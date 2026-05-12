import { useEffect } from "react";
import { router } from "@inertiajs/react";

const ANON_KEY = "wm.telemetry.anonymous_id";
const SESSION_KEY = "wm.telemetry.session_id";
const SESSION_STARTED_KEY = "wm.telemetry.session_started_at";
const LAST_ACTIVITY_KEY = "wm.telemetry.last_activity_at";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const HEARTBEAT_MS = 15 * 1000;
const MAX_BATCH_SIZE = 40;

const nowIso = () => new Date().toISOString();

const uuid = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const getCookie = (name) => {
    const row = document.cookie
        .split("; ")
        .find((item) => item.startsWith(`${name}=`));
    return row ? decodeURIComponent(row.substring(name.length + 1)) : "";
};

const getMeta = (name) =>
    document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ??
    "";

const getRouteName = () => {
    try {
        return typeof route === "function" ? route().current() : null;
    } catch {
        return null;
    }
};

const detectClient = () => {
    const ua = navigator.userAgent || "";
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
    const browser = /Edg\//.test(ua)
        ? "Edge"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : /Firefox\//.test(ua)
              ? "Firefox"
              : "Unknown";

    return {
        device_type: isMobile ? "mobile" : "desktop",
        browser,
        platform: navigator.platform || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        locale: navigator.language || "",
        user_agent: ua,
    };
};

const currentScrollDepth = () => {
    const doc = document.documentElement;
    const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
    const depth = Math.round(((window.scrollY + window.innerHeight) / scrollable) * 100);
    return Math.max(0, Math.min(100, depth));
};

class TelemetryClient {
    constructor() {
        this.queue = [];
        this.page = null;
        this.initialized = false;
        this.flushTimer = null;
        this.heartbeatTimer = null;
        this.userId = null;
    }

    init() {
        if (this.initialized || typeof window === "undefined") return;
        this.initialized = true;
        const anonymousId = this.ensureAnonymousId();
        this.ensureSession();
        this.syncAxiosHeaders(anonymousId);

        window.addEventListener("scroll", this.handleScroll, { passive: true });
        document.addEventListener("visibilitychange", this.handleVisibilityChange);
        window.addEventListener("pagehide", this.handlePageHide);
        window.addEventListener("beforeunload", this.handleBeforeUnload);

        this.flushTimer = window.setInterval(() => this.flush(), HEARTBEAT_MS);
        this.heartbeatTimer = window.setInterval(() => this.heartbeat(), HEARTBEAT_MS);
    }

    identify(user) {
        this.userId = user?.id ?? null;
    }

    syncAxiosHeaders(anonymousId = this.ensureAnonymousId()) {
        if (!window.axios?.defaults?.headers?.common) return;

        window.axios.defaults.headers.common["X-Telemetry-Anonymous-Id"] =
            anonymousId;
        window.axios.defaults.headers.common["X-Telemetry-Session-Id"] =
            sessionStorage.getItem(SESSION_KEY) || "";
    }

    ensureAnonymousId() {
        let id = localStorage.getItem(ANON_KEY);
        if (!id) {
            id = uuid();
            localStorage.setItem(ANON_KEY, id);
        }
        return id;
    }

    ensureSession() {
        const lastActivity = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY) || 0);
        const expired = !lastActivity || Date.now() - lastActivity > SESSION_TIMEOUT_MS;
        let id = sessionStorage.getItem(SESSION_KEY);

        if (!id || expired) {
            id = uuid();
            sessionStorage.setItem(SESSION_KEY, id);
            sessionStorage.setItem(SESSION_STARTED_KEY, nowIso());
            this.enqueue("session_started", {
                started_at: sessionStorage.getItem(SESSION_STARTED_KEY),
            });
        }

        sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
        this.syncAxiosHeaders();
        return id;
    }

    startPage({ component, url, title }) {
        this.init();
        this.endPage("navigation");
        this.ensureSession();

        this.page = {
            id: uuid(),
            component,
            path: url || window.location.pathname,
            routeName: getRouteName(),
            title: title || document.title,
            referrer: document.referrer || null,
            startedAt: Date.now(),
            startedIso: nowIso(),
            lastActiveAt: document.hidden ? null : Date.now(),
            activeMs: 0,
            maxScrollDepth: currentScrollDepth(),
        };

        this.enqueue("page_view_started", {
            started_at: this.page.startedIso,
            title: this.page.title,
            referrer: this.page.referrer,
        });
    }

    track(name, properties = {}) {
        this.init();
        this.ensureSession();
        this.enqueue(name, properties);
    }

    heartbeat() {
        if (!this.page) return;
        this.updateActiveTime();
        this.ensureSession();
        this.enqueue("page_view_heartbeat", {
            duration_ms: Date.now() - this.page.startedAt,
            active_duration_ms: this.page.activeMs,
            max_scroll_depth: this.page.maxScrollDepth,
        });
    }

    endPage(reason = "unknown", beacon = false) {
        if (!this.page) return;
        this.updateActiveTime(true);

        this.enqueue("page_view_ended", {
            started_at: this.page.startedIso,
            ended_at: nowIso(),
            duration_ms: Date.now() - this.page.startedAt,
            active_duration_ms: this.page.activeMs,
            max_scroll_depth: this.page.maxScrollDepth,
            exit_reason: reason,
            title: this.page.title,
            referrer: this.page.referrer,
        });

        this.page = null;
        if (beacon) this.flush(true);
    }

    enqueue(name, properties = {}) {
        const page = this.page;
        this.queue.push({
            event_uuid: uuid(),
            name,
            occurred_at: nowIso(),
            page_view_id: page?.id ?? null,
            path: page?.path ?? window.location.pathname,
            route_name: page?.routeName ?? getRouteName(),
            component: page?.component ?? null,
            properties,
        });

        if (this.queue.length >= MAX_BATCH_SIZE) {
            this.flush();
        }
    }

    updateActiveTime(forcePause = false) {
        if (!this.page) return;

        this.page.maxScrollDepth = Math.max(
            this.page.maxScrollDepth,
            currentScrollDepth(),
        );

        if (this.page.lastActiveAt) {
            this.page.activeMs += Date.now() - this.page.lastActiveAt;
        }

        this.page.lastActiveAt = forcePause || document.hidden ? null : Date.now();
    }

    flush(beacon = false) {
        if (this.queue.length === 0) return;

        const events = this.queue.splice(0, MAX_BATCH_SIZE);
        const payload = {
            anonymous_id: this.ensureAnonymousId(),
            session_id: this.ensureSession(),
            session_started_at: sessionStorage.getItem(SESSION_STARTED_KEY),
            client: detectClient(),
            events,
        };

        const url =
            typeof route === "function"
                ? route("telemetry.batch")
                : "/telemetry/batch";

        // Use beacon for final flush if available (navigation/close)
        if (beacon && navigator.sendBeacon) {
            // Beacon requires a flat object or Blob. For JSON we use Blob.
            // Note: Beacon doesn't support custom headers like X-XSRF-TOKEN easily,
            // so we include the token in the body for the middleware to pick up.
            const beaconPayload = {
                ...payload,
                _token: getMeta("csrf-token") || getCookie("XSRF-TOKEN"),
            };
            const sent = navigator.sendBeacon(
                url,
                new Blob([JSON.stringify(beaconPayload)], {
                    type: "application/json",
                }),
            );
            if (sent) return;
        }

        // Use axios if available, otherwise fallback to fetch
        if (window.axios) {
            window.axios.post(url, payload).catch((err) => {
                console.warn("Telemetry flush failed (axios):", err.message);
                this.queue.unshift(...events);
            });
        } else {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
                keepalive: beacon,
            }).catch((err) => {
                console.warn("Telemetry flush failed (fetch):", err.message);
                this.queue.unshift(...events);
            });
        }
    }

    handleScroll = () => {
        if (!this.page) return;
        this.page.maxScrollDepth = Math.max(
            this.page.maxScrollDepth,
            currentScrollDepth(),
        );
    };

    handleVisibilityChange = () => {
        this.updateActiveTime();
    };

    handlePageHide = () => {
        this.endPage("pagehide", true);
    };

    handleBeforeUnload = () => {
        this.endPage("beforeunload", true);
    };
}

export const telemetry = new TelemetryClient();

export function TelemetryProvider({ initialPage, children }) {
    useEffect(() => {
        telemetry.init();
        telemetry.identify(initialPage?.props?.auth?.user);
        telemetry.startPage({
            component: initialPage?.component,
            url: initialPage?.url,
            title: document.title,
        });

        const removeNavigateListener = router.on("navigate", (event) => {
            const page = event.detail.page;

            telemetry.identify(page.props?.auth?.user);
            telemetry.startPage({
                component: page.component,
                url: page.url,
                title: document.title,
            });
        });

        return () => removeNavigateListener();
    }, []);

    return children;
}
