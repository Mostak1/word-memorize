import { Link } from "expo-router";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BookOpen, Lock } from "lucide-react-native";
import { useMemo } from "react";
import { useCategories } from "../../src/queries/useLearning";
import { Category } from "../../src/types/api";

export default function LearnScreen() {
  const categories = useCategories();

  const { adminCategories, userCategories } = useMemo(() => {
    const items = categories.data ?? [];

    return {
      adminCategories: items.filter((category) => category.is_admin_category),
      userCategories: items.filter((category) => !category.is_admin_category),
    };
  }, [categories.data]);

  if (categories.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <ActivityIndicator color="#e70013" />
      </View>
    );
  }

  const hasAnyCategories = adminCategories.length > 0 || userCategories.length > 0;

  return (
    <ScrollView className="flex-1 bg-[#F0F2F5]" contentContainerClassName="px-4 py-5 pb-28" showsVerticalScrollIndicator={false}>
      {hasAnyCategories ? (
        <View className="gap-8">
          {adminCategories.length > 0 ? (
            <CategorySection
              title="All Categories"
              count={adminCategories.length}
              accentClassName="bg-slate-400"
              countClassName="bg-slate-100 text-slate-600"
              categories={adminCategories}
            />
          ) : null}

          {userCategories.length > 0 ? (
            <CategorySection
              title="Your List"
              count={userCategories.length}
              accentClassName="bg-brand"
              countClassName="bg-rose-50 text-brand"
              categories={userCategories}
            />
          ) : null}
        </View>
      ) : (
        <EmptyState />
      )}
    </ScrollView>
  );
}

function CategorySection({
  title,
  count,
  accentClassName,
  countClassName,
  categories,
}: {
  title: string;
  count: number;
  accentClassName: string;
  countClassName: string;
  categories: Category[];
}) {
  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className={`h-4 w-1.5 rounded-full ${accentClassName}`} />
          <Text className="text-sm font-black text-slate-950">{title}</Text>
        </View>
        <View className={`rounded-full px-2 py-0.5 ${countClassName}`}>
          <Text className="text-[10px] font-black">{count}</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </View>
    </View>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const isLocked = category.is_locked && !category.has_access;
  const initial = category.name?.charAt(0)?.toUpperCase() || "V";

  return (
    <Link href={`/categories/${category.id}`} asChild>
      <TouchableOpacity activeOpacity={0.84} className="w-[48%] overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-200">
        <View className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: 4 / 3 }}>
          {category.thumbnail_url ? (
            <Image source={{ uri: category.thumbnail_url }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center bg-rose-50">
              <Text className="text-4xl font-black text-brand/40">{initial}</Text>
            </View>
          )}

          {isLocked ? (
            <>
              <View className="absolute inset-0 bg-black/40" />
              <View className="absolute right-2.5 top-2.5 h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-brand">
                <Lock color="#ffffff" size={18} />
              </View>
            </>
          ) : null}
        </View>

        <View className="min-h-[82px] justify-between px-3.5 py-3">
          <Text className="text-xs font-black leading-4 text-slate-950" numberOfLines={2}>
            {category.name}
          </Text>
          <View className="mt-2 flex-row items-center">
            <Text className="mx-1 text-[10px] font-bold text-slate-400">•</Text>
            <Text className="text-[10px] font-semibold text-slate-500">{category.words_count || 0} words</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function EmptyState() {
  return (
    <View className="rounded-2xl bg-white p-10 text-center shadow-sm shadow-slate-200">
      <View className="mx-auto mb-4 h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <BookOpen color="#94a3b8" size={42} />
      </View>
      <Text className="text-center text-lg font-black text-slate-950">No categories yet</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
        Word categories will appear here when they are available.
      </Text>
      <Link href="/(user)/dashboard" asChild>
        <TouchableOpacity activeOpacity={0.85} className="mt-5 rounded-xl bg-brand px-5 py-3">
          <Text className="text-center text-sm font-black text-white">Go home</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
