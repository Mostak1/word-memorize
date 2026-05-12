import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { TopHeader } from "../../src/components/TopHeader";
import { useAuth } from "../../src/providers/AuthProvider";

export default function UserLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#e70013" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        header: () => <TopHeader />,
        tabBarActiveTintColor: "#e70013",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarLabel: "Home" }} />
      <Tabs.Screen name="learn" options={{ title: "Learn", tabBarLabel: "Learn" }} />
      <Tabs.Screen name="review" options={{ title: "Review", tabBarLabel: "Review" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarLabel: "Settings" }} />
    </Tabs>
  );
}
