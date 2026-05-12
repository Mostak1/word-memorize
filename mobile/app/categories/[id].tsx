import { Link, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useCategoryWordlists } from "../../src/queries/useLearning";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useCategoryWordlists(id);

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
      data={query.data?.wordlists.data ?? []}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View className="pb-2">
          <Text className="text-3xl font-extrabold text-slate-950">{query.data?.category.name}</Text>
          <Text className="mt-2 text-base text-slate-600">
            {query.data?.category.description || "Pick a wordlist to start learning."}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Link href={`/wordlists/${item.id}`} asChild>
          <TouchableOpacity className="rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-lg font-bold text-slate-950">{item.title}</Text>
            <Text className="mt-2 text-sm text-slate-600">
              {item.difficulty || "Mixed"} • {item.words_count} words • {item.mastered_count} mastered
            </Text>
            {item.is_locked && !item.has_access ? (
              <Text className="mt-3 text-xs font-bold uppercase text-brand">Locked</Text>
            ) : (
              <Text className="mt-3 text-xs font-bold uppercase text-brand">Open</Text>
            )}
          </TouchableOpacity>
        </Link>
      )}
    />
  );
}
