import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { useWord } from "../../src/queries/useLearning";

export default function WordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useWord(id);
  const word = query.data;
  const imageUrl = word?.images?.find((image) => image.url)?.url ?? word?.image_url;

  if (query.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#e70013" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-4 p-5">
      {imageUrl ? <Image source={{ uri: imageUrl }} className="h-56 w-full rounded-2xl bg-slate-200" resizeMode="cover" /> : null}

      <View className="rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="text-4xl font-extrabold text-slate-950">{word?.word}</Text>
        {word?.ipa ? <Text className="mt-2 text-base font-semibold text-brand">{word.ipa}</Text> : null}
        {word?.definition ? <Text className="mt-5 text-base leading-7 text-slate-700">{word.definition}</Text> : null}
        {word?.bangla_meaning ? <Text className="mt-4 text-base leading-7 text-slate-700">{word.bangla_meaning}</Text> : null}
      </View>

      {word?.example_sentences ? (
        <View className="rounded-2xl border border-slate-200 bg-white p-5">
          <Text className="text-base font-bold text-slate-950">Example</Text>
          <Text className="mt-3 text-base leading-7 text-slate-700">{word.example_sentences}</Text>
        </View>
      ) : null}

      {word?.synonym || word?.antonym ? (
        <View className="rounded-2xl border border-slate-200 bg-white p-5">
          {word.synonym ? <Text className="text-base text-slate-700">Synonym: {word.synonym}</Text> : null}
          {word.antonym ? <Text className="mt-2 text-base text-slate-700">Antonym: {word.antonym}</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}
