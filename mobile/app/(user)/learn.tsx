import { Link } from "expo-router";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useCategories } from "../../src/queries/useLearning";

export default function LearnScreen() {
  const categories = useCategories();

  if (categories.isLoading) {
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
      data={categories.data ?? []}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View className="pb-2">
          <Text className="text-3xl font-extrabold text-slate-950">Learn</Text>
          <Text className="mt-2 text-base text-slate-600">Choose a category to continue.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Link href={`/categories/${item.id}`} asChild>
          <TouchableOpacity className="rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-lg font-bold text-slate-950">{item.name}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600" numberOfLines={2}>
              {item.description || "Vocabulary practice category"}
            </Text>
            <Text className="mt-3 text-xs font-bold uppercase text-brand">
              {item.wordlists_count} wordlists
            </Text>
          </TouchableOpacity>
        </Link>
      )}
    />
  );
}
