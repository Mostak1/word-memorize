import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function GuestHomeScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="flex-grow justify-center px-6 py-10">
      <View>
        <Text className="text-sm font-bold uppercase tracking-widest text-brand">VocabPix</Text>
        <Text className="mt-3 text-4xl font-extrabold leading-tight text-slate-950">
          Build your vocabulary one session at a time.
        </Text>
        <Text className="mt-4 text-base leading-7 text-slate-600">
          Sign in to sync progress, streaks, wordlists, quizzes, bookmarks, and review sessions with your Laravel account.
        </Text>

        <View className="mt-8 gap-3">
          <Link href="/(guest)/login" asChild>
            <TouchableOpacity className="rounded-2xl bg-brand px-5 py-4">
              <Text className="text-center text-base font-bold text-white">Sign in</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(guest)/register" asChild>
            <TouchableOpacity className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <Text className="text-center text-base font-bold text-slate-900">Create account</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="font-bold text-slate-950">Guest mode</Text>
          <Text className="mt-2 leading-6 text-slate-600">
            The current mobile API protects learning data with Sanctum tokens, so guest browsing is intentionally limited to this welcome flow.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
