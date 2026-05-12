import { router } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../lib/api";
import { deleteToken, getToken, setToken } from "../lib/tokenStorage";

type MobileUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

type AuthContextValue = {
  user: MobileUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

type RegisterPayload = {
  name: string;
  email: string;
  phone_number?: string;
  password: string;
};

const TOKEN_KEY = "vocabpix.mobile_token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshMe().finally(() => setIsLoading(false));
  }, []);

  async function refreshMe() {
    const token = await getToken(TOKEN_KEY);
    setAuthToken(token);

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get("/me");
      setUser(response.data.user);
    } catch {
      await deleteToken(TOKEN_KEY);
      setAuthToken(null);
      setUser(null);
    }
  }

  async function login(email: string, password: string) {
    const response = await api.post("/login", {
      email,
      password,
      device_name: "android",
    });

    await setToken(TOKEN_KEY, response.data.token);
    setAuthToken(response.data.token);
    setUser(response.data.user);
    router.replace("/(user)/dashboard");
  }

  async function register(payload: RegisterPayload) {
    const response = await api.post("/register", {
      ...payload,
      device_name: "android",
    });

    await setToken(TOKEN_KEY, response.data.token);
    setAuthToken(response.data.token);
    setUser(response.data.user);
    router.replace("/(user)/dashboard");
  }

  async function logout() {
    try {
      await api.post("/logout");
    } finally {
      await deleteToken(TOKEN_KEY);
      setAuthToken(null);
      setUser(null);
      router.replace("/(guest)/login");
    }
  }

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshMe }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
