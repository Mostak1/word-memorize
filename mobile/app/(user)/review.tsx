import { Link } from "expo-router";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { AuthRequired } from "../../src/components/AuthRequired";
import { useAuth } from "../../src/providers/AuthProvider";
import { useReviewWords } from "../../src/queries/useLearning";

export default function ReviewScreen() {
  const { user } = useAuth();
  const reviewWords = useReviewWords(Boolean(user));

  if (!user) {
    return (
      <AuthRequired
        title="Review needs an account"
        message="Sign in to review saved words, revise weak words, and keep your progress synced."
      />
    );
  }

  if (reviewWords.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#e70013" />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-slate-50"
      contentContainerClassName="gap-3 p-5"
      data={reviewWords.data ?? []}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View className="pb-2">
          <Text className="text-3xl font-extrabold text-slate-950">Review</Text>
          <Text className="mt-2 text-base text-slate-600">Words waiting for another pass.</Text>
        </View>
      }
      ListEmptyComponent={
        <View className="rounded-2xl border border-slate-200 bg-white p-5">
          <Text className="text-base font-bold text-slate-950">Nothing to review yet</Text>
          <Text className="mt-2 text-slate-600">Complete learning sessions to build your review queue.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Link href={`/words/${item.id}`} asChild>
          <TouchableOpacity className="rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-lg font-bold text-slate-950">{item.word}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600" numberOfLines={2}>
              {item.definition}
            </Text>
          </TouchableOpacity>
        </Link>
      )}
    />
  );
}
