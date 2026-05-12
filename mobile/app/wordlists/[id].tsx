import { Link, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../src/providers/AuthProvider";
import { useWordlist } from "../../src/queries/useLearning";

export default function WordlistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const query = useWordlist(id);

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
      data={query.data?.words.data ?? []}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View className="gap-4 pb-2">
          <View>
            <Text className="text-3xl font-extrabold text-slate-950">{query.data?.wordlist.title}</Text>
            <Text className="mt-2 text-base text-slate-600">
              {query.data?.wordlist.difficulty || "Mixed"} • {query.data?.wordlist.words_count ?? 0} words
            </Text>
          </View>
          <Link href={user ? `/sessions/wordlists/${id}` : "/(guest)/login"} asChild>
            <TouchableOpacity className="rounded-2xl bg-brand px-5 py-4">
              <Text className="text-center text-base font-bold text-white">
                {user ? "Start session" : "Sign in to practice"}
              </Text>
            </TouchableOpacity>
          </Link>
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
