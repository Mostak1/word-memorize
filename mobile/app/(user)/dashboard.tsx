import { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import {
  dashboardFeatures,
  FeatureCard,
  GreetingHero,
  MetricPill,
  ProtectedCollectionCta,
  StreakBanner,
  StreakHistorySheet,
} from "../../src/components/dashboard/DashboardCards";
import { useAuth } from "../../src/providers/AuthProvider";
import { useDashboard } from "../../src/queries/useDashboard";
import { BookOpen, RotateCcw, Trophy, WalletCards } from "lucide-react-native";

export default function DashboardScreen() {
  const { user } = useAuth();
  const dashboard = useDashboard(Boolean(user));
  const [showStreakHistory, setShowStreakHistory] = useState(false);
  const firstName = user?.name?.split(" ")[0] || "Learner";
  const isAuthenticated = Boolean(user);
  const data = dashboard.data;
  const features = dashboardFeatures({
    masteredCount: data?.mastered_count ?? 0,
    reviseCount: data?.revise_counts?.all ?? 0,
  });

  return (
    <>
      <ScrollView
        className="flex-1 bg-slate-50"
        contentContainerClassName="gap-5 px-4 pb-28 pt-6"
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isRefetching}
            onRefresh={dashboard.refetch}
            tintColor="#e70013"
            colors={["#e70013"]}
          />
        }
      >
        <GreetingHero firstName={firstName} isGuest={!isAuthenticated} />

        {dashboard.isLoading ? (
          <View className="min-h-[300px] items-center justify-center">
            <ActivityIndicator color="#e70013" />
          </View>
        ) : (
          <>
            <StreakBanner streak={data?.streak ?? null} onPress={() => setShowStreakHistory(true)} />

            <View className="flex-row gap-3">
              <MetricPill label="XP" value={data?.xp?.balance ?? 0} icon={WalletCards} />
              <MetricPill label="Mastered" value={data?.mastered_count ?? 0} icon={Trophy} />
            </View>

            <View className="flex-row gap-3">
              <MetricPill label="Review" value={data?.review_count ?? 0} icon={BookOpen} />
              <MetricPill label="Revise" value={data?.revise_counts?.all ?? 0} icon={RotateCcw} />
            </View>

            <View>
              <Text className="mb-3 px-1 text-base font-black text-slate-950">Quick actions</Text>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {features.map((feature) => (
                  <FeatureCard key={feature.title} item={feature} isAuthenticated={isAuthenticated} />
                ))}
              </View>
            </View>

            <ProtectedCollectionCta isAuthenticated={isAuthenticated} />
          </>
        )}
      </ScrollView>

      <StreakHistorySheet
        visible={showStreakHistory}
        streak={data?.streak ?? null}
        onClose={() => setShowStreakHistory(false)}
      />
    </>
  );
}
