import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/providers/AuthProvider";

export default function IndexRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#e70013" />
      </View>
    );
  }

  return <Redirect href="/(user)/dashboard" />;
}
