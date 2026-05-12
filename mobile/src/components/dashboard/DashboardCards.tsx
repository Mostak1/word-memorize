import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import {
  BookOpen,
  Bookmark,
  ChevronRight,
  Flame,
  Grid3X3,
  LucideIcon,
  LockKeyhole,
  Medal,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
} from "lucide-react-native";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { DashboardStreak } from "../../types/dashboard";

export type FeatureCardConfig = {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  background: string;
  requiresAuth?: boolean;
};

export const dashboardFeatures = ({
  masteredCount,
  reviseCount,
}: {
  masteredCount: number;
  reviseCount: number;
}): FeatureCardConfig[] => [
  {
    title: "Add New Word",
    subtitle: "Expand vocabulary",
    href: "/(user)/learn",
    icon: Plus,
    accent: "#3b82f6",
    background: "#eff6ff",
    requiresAuth: true,
  },
  {
    title: "Word Lists",
    subtitle: "Browse all",
    href: "/(user)/learn",
    icon: Grid3X3,
    accent: "#8b5cf6",
    background: "#f5f3ff",
  },
  {
    title: "Mastered Words",
    subtitle: masteredCount > 0 ? `${masteredCount} words` : "Words you know",
    href: "/(user)/dashboard",
    icon: Trophy,
    accent: "#22c55e",
    background: "#f0fdf4",
    requiresAuth: true,
  },
  {
    title: "Test Learning",
    subtitle: "Practice now",
    href: "/(user)/dashboard",
    icon: BookOpen,
    accent: "#ef4444",
    background: "#fef2f2",
    requiresAuth: true,
  },
  {
    title: "Leaderboard",
    subtitle: "Top learners",
    href: "/(user)/dashboard",
    icon: Users,
    accent: "#f97316",
    background: "#fff7ed",
  },
  {
    title: "Achievements",
    subtitle: "Earned badges",
    href: "/(user)/dashboard",
    icon: ShieldCheck,
    accent: "#06b6d4",
    background: "#ecfeff",
    requiresAuth: true,
  },
  {
    title: "Revise",
    subtitle: reviseCount > 0 ? `${reviseCount} words` : "Practice review",
    href: "/(user)/review",
    icon: RotateCcw,
    accent: "#6366f1",
    background: "#eef2ff",
    requiresAuth: true,
  },
  {
    title: "Bookmarked",
    subtitle: "Saved for later",
    href: "/(user)/dashboard",
    icon: Bookmark,
    accent: "#eab308",
    background: "#fefce8",
    requiresAuth: true,
  },
];

export function GreetingHero({ firstName, isGuest = false }: { firstName: string; isGuest?: boolean }) {
  return (
    <View className="relative min-h-[142px] flex-row items-center justify-between overflow-visible px-2">
      <View className="z-10 max-w-[62%]">
        <Text className="text-4xl font-black leading-tight text-slate-950">
          Hello{"\n"}
          {firstName}
        </Text>
        <Text className="mt-2 text-base font-bold text-slate-400">Ready to practice?</Text>
        {isGuest ? (
          <Link href="/(guest)/login" asChild>
            <TouchableOpacity activeOpacity={0.85} className="mt-4 self-start rounded-full bg-brand px-5 py-2.5">
              <Text className="text-xs font-black uppercase tracking-wider text-white">Sign in to save progress</Text>
            </TouchableOpacity>
          </Link>
        ) : null}
      </View>
      <View className="absolute -right-7 -bottom-9 h-48 w-48">
        <View className="absolute left-9 top-10 h-32 w-32 rounded-full bg-rose-100" />
        <Image
          source={require("../../../assets/learning_illustration.png")}
          className="h-full w-full"
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

export function StreakBanner({
  streak,
  onPress,
}: {
  streak: DashboardStreak | null;
  onPress: () => void;
}) {
  if (!streak) return null;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View className="overflow-hidden rounded-[32px] border border-rose-100 bg-rose-50 p-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-rose-200 bg-white">
              <Flame color={streak.is_broken ? "#cbd5e1" : "#ef4444"} size={34} fill={streak.is_broken ? "transparent" : "#ef4444"} />
            </View>
            <View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-3xl font-black text-slate-950">{streak.current_streak}</Text>
                <Text className="text-sm font-black uppercase text-slate-950">
                  {streak.current_streak === 1 ? "day" : "days"}
                </Text>
              </View>
              <Text className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Current</Text>
            </View>
          </View>

          <View className="border-l border-rose-200 pl-6">
            <Text className="text-right text-2xl font-black text-slate-950">{streak.longest_streak}</Text>
            <Text className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Best</Text>
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap items-center gap-2">
          <View className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${streak.is_broken ? "bg-red-100" : "bg-green-100"}`}>
            {streak.is_broken ? <Flame color="#dc2626" size={12} /> : <Zap color="#16a34a" size={12} />}
            <Text className={`text-[10px] font-black uppercase tracking-wider ${streak.is_broken ? "text-red-600" : "text-green-600"}`}>
              {streak.is_broken ? "Lost" : "Active"}
            </Text>
          </View>
          <Text className="flex-1 text-[11px] font-medium italic text-slate-500">
            {streak.is_broken ? "Start a new streak today." : "Keep the momentum going."}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function FeatureCard({
  item,
  isAuthenticated,
}: {
  item: FeatureCardConfig;
  isAuthenticated: boolean;
}) {
  const Icon = item.icon;
  const isLocked = item.requiresAuth && !isAuthenticated;
  const href = isLocked ? "/(guest)/login" : item.href;

  return (
    <Link href={href as never} asChild>
      <TouchableOpacity activeOpacity={0.82} className="w-[48%] rounded-[28px] border border-transparent bg-white p-4">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: item.background }}>
            <Icon color={item.accent} size={24} />
          </View>
          {isLocked ? (
            <View className="h-7 w-7 items-center justify-center rounded-full bg-slate-100">
              <LockKeyhole color="#94a3b8" size={14} />
            </View>
          ) : null}
        </View>
        <Text className="text-xs font-black leading-tight text-slate-950" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="mt-1 text-[10px] leading-tight text-slate-400" numberOfLines={2}>
          {item.subtitle}
        </Text>
      </TouchableOpacity>
    </Link>
  );
}

export function MetricPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4">
      <View className="flex-row items-center gap-2">
        <Icon color="#e70013" size={16} />
        <Text className="text-xs font-bold uppercase text-slate-400">{label}</Text>
      </View>
      <Text className="mt-2 text-2xl font-black text-slate-950">{value.toLocaleString()}</Text>
    </View>
  );
}

export function CollectionCta() {
  return <CollectionCtaButton href="/(user)/learn" />;
}

export function ProtectedCollectionCta({ isAuthenticated }: { isAuthenticated: boolean }) {
  return <CollectionCtaButton href={isAuthenticated ? "/(user)/learn" : "/(guest)/login"} />;
}

function CollectionCtaButton({ href }: { href: string }) {
  return (
    <Link href={href as never} asChild>
      <TouchableOpacity activeOpacity={0.9}>
        <LinearGradient
          colors={["#e70013", "#ff4d4d"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="overflow-hidden rounded-[36px] p-6"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-5">
              <View className="h-16 w-16 items-center justify-center rounded-[20px] bg-white">
                <Grid3X3 color="#e70013" size={30} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black leading-tight text-white">My Word Collection</Text>
                <Text className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/90">
                  View and manage all words
                </Text>
              </View>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <ChevronRight color="#ffffff" size={28} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Link>
  );
}

export function StreakHistorySheet({
  visible,
  streak,
  onClose,
}: {
  visible: boolean;
  streak: DashboardStreak | null;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40 px-4 pb-4">
        <View className="rounded-[32px] bg-white p-6">
          <View className="items-center">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-orange-50">
              <Flame color="#f97316" size={54} fill="#f97316" />
            </View>
            <Text className="mt-4 text-6xl font-black text-slate-950">{streak?.current_streak ?? 0}</Text>
            <Text className="mt-1 text-sm font-black uppercase tracking-widest text-orange-500">Day streak</Text>
          </View>

          <View className="mt-8 flex-row justify-between">
            {streak?.weekly_history?.map((day) => (
              <View key={day.date} className="items-center gap-3">
                <Text className={`text-[10px] font-bold uppercase ${day.is_today ? "text-orange-500" : "text-slate-400"}`}>
                  {day.short_day}
                </Text>
                <View className={`h-9 w-9 items-center justify-center rounded-full border-2 ${day.is_active ? "border-orange-500 bg-orange-500" : "border-slate-200 bg-slate-100"}`}>
                  {day.is_active ? <Medal color="#ffffff" size={16} /> : <View className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity className="mt-8 rounded-2xl bg-sky-500 py-5" onPress={onClose}>
            <Text className="text-center text-sm font-black uppercase tracking-widest text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
