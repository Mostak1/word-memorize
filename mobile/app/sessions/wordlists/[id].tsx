import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { AuthRequired } from "../../../src/components/AuthRequired";
import { useAuth } from "../../../src/providers/AuthProvider";
import { useWordlistSession } from "../../../src/queries/useLearning";
import { Word } from "../../../src/types/api";

export default function WordlistSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const query = useWordlistSession(id, Boolean(user));

  if (!user) {
    return (
      <AuthRequired
        title="Exercise needs an account"
        message="Sign in to start sessions, save answers, earn XP, and update your streak."
      />
    );
  }

  if (query.isLoading) {
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
      data={query.data?.words ?? []}
      keyExtractor={(item, index) => `${item.kind}-${index}`}
      ListHeaderComponent={
        <View className="pb-2">
          <Text className="text-3xl font-extrabold text-slate-950">{query.data?.wordlist.title}</Text>
          <Text className="mt-2 text-base text-slate-600">
            {query.data?.is_quiz_only ? "Quiz-only session" : "Learning session"}
          </Text>
        </View>
      }
      renderItem={({ item, index }) => {
        if (item.kind === "quiz") {
          const quiz = item.payload as Record<string, unknown>;

          return (
            <View className="rounded-2xl border border-rose-200 bg-brand-soft p-4">
              <Text className="text-xs font-bold uppercase text-brand">Quiz card {index + 1}</Text>
              <Text className="mt-2 text-base font-bold text-slate-950">
                {String(quiz.targetWordWord ?? "Quiz")}
              </Text>
            </View>
          );
        }

        const word = item.payload as Word;

        return (
          <View className="rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-xs font-bold uppercase text-brand">Word {index + 1}</Text>
            <Text className="mt-2 text-2xl font-extrabold text-slate-950">{word.word}</Text>
            <Text className="mt-3 text-base leading-7 text-slate-700">{word.definition}</Text>
          </View>
        );
      }}
    />
  );
}
