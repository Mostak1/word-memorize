import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  SunMoon,
  XCircle,
  Zap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { AuthRequired } from "../../src/components/AuthRequired";
import { api } from "../../src/lib/api";
import { useAuth } from "../../src/providers/AuthProvider";
import { useShopIndex, useXpShopStatus } from "../../src/queries/useShop";
import { ShopCategory, ShopOrderPayload, XpShopStatus } from "../../src/types/shop";

const BKASH_NUMBER = "01825236112";

export default function ShopScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"shop" | "xp">("shop");

  if (!user) {
    return (
      <AuthRequired
        title="Shop needs an account"
        message="Sign in to purchase locked categories, spend XP, and track your order status."
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F0F2F5]" contentContainerClassName="gap-5 px-4 py-5 pb-28" showsVerticalScrollIndicator={false}>
      <View>
        <Text className="text-2xl font-black text-slate-950">
          {activeTab === "shop" ? "Shop" : "XP Shop"}
        </Text>
        <Text className="mt-1 text-sm font-medium text-slate-500">
          {activeTab === "shop" ? "Unlock premium word categories." : "Use XP for streak helpers and upgrades."}
        </Text>
      </View>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "shop" ? <CategoryShopTab /> : <XpShopTab />}
    </ScrollView>
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: "shop" | "xp";
  onChange: (tab: "shop" | "xp") => void;
}) {
  return (
    <View className="flex-row gap-1 rounded-2xl bg-slate-100 p-1">
      <TabButton active={active === "shop"} label="Shop" icon={<ShoppingBag size={17} color={active === "shop" ? "#0f172a" : "#64748b"} />} onPress={() => onChange("shop")} />
      <TabButton active={active === "xp"} label="XP" icon={<Zap size={17} color={active === "xp" ? "#eab308" : "#64748b"} fill={active === "xp" ? "#eab308" : "transparent"} />} onPress={() => onChange("xp")} />
    </View>
  );
}

function TabButton({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.82} className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 ${active ? "bg-white shadow-sm shadow-slate-200" : ""}`} onPress={onPress}>
      {icon}
      <Text className={`text-sm font-black ${active ? "text-slate-950" : "text-slate-500"}`}>{label}</Text>
    </TouchableOpacity>
  );
}

function CategoryShopTab() {
  const shop = useShopIndex();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null);

  if (shop.isLoading) {
    return <LoadingBlock />;
  }

  const categories = shop.data?.word_list_categories ?? [];

  if (categories.length === 0) {
    return (
      <View className="rounded-2xl bg-white p-10 shadow-sm shadow-slate-200">
        <View className="mx-auto mb-4 h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <BookOpen color="#94a3b8" size={42} />
        </View>
        <Text className="text-center text-lg font-black text-slate-950">No categories available</Text>
        <Text className="mt-2 text-center text-sm leading-6 text-slate-500">Locked categories will appear here when they are available.</Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {categories.map((category) => (
          <ShopCategoryCard key={category.id} category={category} onPress={() => setSelectedCategory(category)} />
        ))}
      </View>

      <OrderDialog
        category={selectedCategory}
        visible={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
      />
    </>
  );
}

function ShopCategoryCard({
  category,
  onPress,
}: {
  category: ShopCategory;
  onPress: () => void;
}) {
  const isOwned = category.shop_status === "owned";
  const isPending = category.shop_status === "pending";
  const isBlocked = isOwned || isPending;
  const initial = category.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={isBlocked ? 1 : 0.84}
      className={`w-[48%] overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-200 ${isBlocked ? "opacity-70" : ""}`}
      onPress={() => {
        if (!isBlocked) onPress();
      }}
    >
      <View className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: 4 / 3 }}>
        {category.thumbnail_url ? (
          <Image source={{ uri: category.thumbnail_url }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center bg-rose-50">
            <Text className="text-4xl font-black text-brand/40">{initial}</Text>
          </View>
        )}

        {isOwned ? <StatusBadge label="Owned" colorClassName="bg-green-600" icon={<CheckCircle2 color="#ffffff" size={12} />} /> : null}
        {isPending ? <StatusBadge label="Pending" colorClassName="bg-yellow-500" /> : null}
        {!isOwned && !isPending ? (
          <View className="absolute right-2 top-2 flex-row items-center gap-1 rounded-lg bg-black/60 px-2 py-1">
            <Lock color="#ffffff" size={12} />
            {Number(category.price ?? 0) > 0 ? <Text className="text-[10px] font-black text-white">৳{category.price}</Text> : null}
          </View>
        ) : null}
      </View>

      <View className="h-[100px] justify-between px-3.5 py-3">
        <Text className="text-sm font-black leading-5 text-slate-950" numberOfLines={3}>
          {category.name}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <BookOpen color="#94a3b8" size={14} />
          <Text className="text-xs font-semibold text-slate-500">
            {category.wordlists_count} {category.wordlists_count === 1 ? "word list" : "word lists"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function StatusBadge({
  label,
  colorClassName,
  icon,
}: {
  label: string;
  colorClassName: string;
  icon?: React.ReactNode;
}) {
  return (
    <View className={`absolute right-2 top-2 flex-row items-center gap-1 rounded-lg px-2 py-1 ${colorClassName}`}>
      {icon}
      <Text className="text-[10px] font-black text-white">{label}</Text>
    </View>
  );
}

function OrderDialog({
  category,
  visible,
  onClose,
}: {
  category: ShopCategory | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone_number: user?.phone_number ?? "",
    address: "",
    profession: user?.profession ?? "",
    transaction_id: "",
    note: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: ShopOrderPayload) => {
      const response = await api.post("/shop/orders", payload);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: () => setError("Could not place the order. Check your details and try again."),
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  function close() {
    setSuccess(false);
    setError(null);
    setForm({
      name: user?.name ?? "",
      phone_number: user?.phone_number ?? "",
      address: "",
      profession: user?.profession ?? "",
      transaction_id: "",
      note: "",
    });
    onClose();
  }

  function submit() {
    if (!category || mutation.isPending) return;

    setError(null);
    mutation.mutate({
      category_ids: [category.id],
      ...form,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[88%] overflow-hidden rounded-t-[32px] bg-white">
          <View className="bg-brand px-6 pb-5 pt-6">
            <View className="mb-1 flex-row items-center gap-2">
              <Lock color="#ffffff" opacity={0.82} size={16} />
              <Text className="text-xs font-black uppercase tracking-widest text-white/80">Purchase Access</Text>
            </View>
            <Text className="text-xl font-black leading-6 text-white">{category?.name}</Text>
            {Number(category?.price ?? 0) > 0 ? <Text className="mt-1 text-base font-black text-white/90">৳{category?.price}</Text> : null}
            <Text className="mt-1 text-sm font-medium text-white/70">Send payment first, then submit your transaction details.</Text>
          </View>

          <ScrollView className="px-6 py-5" contentContainerClassName="gap-4 pb-8" keyboardShouldPersistTaps="handled">
            {success ? (
              <View className="items-center py-8">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 color="#16a34a" size={34} />
                </View>
                <Text className="mt-4 text-center text-lg font-black text-slate-950">Order placed</Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">We will review your payment and grant access soon.</Text>
                <TouchableOpacity activeOpacity={0.85} className="mt-6 w-full rounded-xl bg-brand py-3" onPress={close}>
                  <Text className="text-center text-sm font-black text-white">Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="rounded-xl border border-pink-200 bg-pink-50 p-4">
                  <Text className="text-sm font-black text-pink-800">Send bKash payment</Text>
                  <Text className="mt-2 font-mono text-base font-black tracking-wider text-slate-900">{BKASH_NUMBER}</Text>
                  {Number(category?.price ?? 0) > 0 ? <Text className="mt-2 text-xs font-semibold text-pink-600">Amount: ৳{category?.price}</Text> : null}
                </View>

                <ShopInput label="Name" value={form.name} onChangeText={(value) => update("name", value)} />
                <ShopInput label="Phone" value={form.phone_number} onChangeText={(value) => update("phone_number", value)} keyboardType="phone-pad" />
                <ShopInput label="Address" value={form.address} onChangeText={(value) => update("address", value)} multiline />
                <ShopInput label="Profession (optional)" value={form.profession} onChangeText={(value) => update("profession", value)} />
                <ShopInput label="Transaction ID" value={form.transaction_id} onChangeText={(value) => update("transaction_id", value)} />
                <ShopInput label="Note (optional)" value={form.note} onChangeText={(value) => update("note", value)} multiline />

                {error ? (
                  <View className="flex-row items-center gap-2 rounded-xl bg-rose-50 px-4 py-3">
                    <XCircle color="#e70013" size={16} />
                    <Text className="flex-1 text-sm font-bold text-brand">{error}</Text>
                  </View>
                ) : null}

                <View className="flex-row gap-3 pt-1">
                  <TouchableOpacity activeOpacity={0.82} className="flex-1 rounded-xl border border-slate-200 py-3" onPress={close}>
                    <Text className="text-center text-sm font-black text-slate-600">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.82} className="flex-1 rounded-xl bg-brand py-3 disabled:opacity-60" disabled={mutation.isPending} onPress={submit}>
                    {mutation.isPending ? <ActivityIndicator color="#ffffff" /> : <Text className="text-center text-sm font-black text-white">Place order</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ShopInput({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View>
      <Text className="mb-1.5 text-sm font-black text-slate-700">{label}</Text>
      <TextInput
        className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-950 ${multiline ? "min-h-[76px]" : ""}`}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

function XpShopTab() {
  const status = useXpShopStatus();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const buyMutation = useMutation({
    mutationFn: async (kind: "freeze" | "dark") => {
      const response = await api.post<XpShopStatus & { success: boolean; message?: string }>(
        kind === "freeze" ? "/shop/buy-streak-freeze" : "/shop/buy-dark-mode",
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["shop", "xp-status"], {
        xp: data.xp,
        streak: data.streak,
        dark_mode_unlocked: data.dark_mode_unlocked,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setToast({ type: "success", message: data.message ?? "Purchase complete" });
    },
    onError: () => setToast({ type: "error", message: "Purchase failed. Check your XP balance." }),
  });

  const data = status.data;

  if (status.isLoading) {
    return <LoadingBlock />;
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-4 rounded-2xl bg-yellow-400 p-5 shadow-lg shadow-yellow-200">
        <View className="rounded-xl bg-white/25 p-3">
          <Zap color="#ffffff" size={32} />
        </View>
        <View>
          <Text className="text-sm font-bold text-white/80">XP Balance</Text>
          <Text className="text-4xl font-black text-white">
            {(data?.xp.balance ?? 0).toLocaleString()} <Text className="text-lg font-bold text-white/80">XP</Text>
          </Text>
        </View>
      </View>

      <StreakStatusCard status={data} />

      <Text className="text-sm font-black uppercase tracking-wide text-slate-500">Available Items</Text>

      <XpItemCard
        title="Streak Freeze"
        description="Protect your streak if you miss a day."
        icon={<ShieldCheck color="#ffffff" size={32} />}
        gradientClassName="bg-blue-600"
        cost={data?.xp.next_freeze_cost ?? 1000}
        canAfford={Boolean(data?.xp.can_afford_freeze)}
        purchasing={buyMutation.isPending}
        onBuy={() => buyMutation.mutate("freeze")}
        footer="You can purchase up to 3 freezes."
      />

      {data?.dark_mode_unlocked ? (
        <View className="flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
          <View className="rounded-xl bg-slate-900 p-3">
            <SunMoon color="#ffffff" size={32} />
          </View>
          <View>
            <Text className="text-lg font-black text-slate-950">Dark Mode</Text>
            <Text className="text-sm font-bold text-green-600">Unlocked</Text>
          </View>
        </View>
      ) : (
        <XpItemCard
          title="Dark Mode"
          description="Unlock dark appearance for your account."
          icon={<SunMoon color="#ffffff" size={32} />}
          gradientClassName="bg-slate-900"
          cost={6000}
          canAfford={(data?.xp.balance ?? 0) >= 6000}
          purchasing={buyMutation.isPending}
          onBuy={() => buyMutation.mutate("dark")}
          footer="Mobile dark theme support can be enabled later."
        />
      )}

      {toast ? (
        <View className={`flex-row items-center gap-2 rounded-xl px-4 py-3 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle2 color="#ffffff" size={18} /> : <XCircle color="#ffffff" size={18} />}
          <Text className="flex-1 text-sm font-black text-white">{toast.message}</Text>
        </View>
      ) : null}
    </View>
  );
}

function StreakStatusCard({ status }: { status?: XpShopStatus }) {
  const streak = status?.streak;
  if (!streak) return null;

  const label = streak.active_today
    ? "Active today"
    : streak.at_risk
      ? "At risk"
      : streak.is_frozen
        ? "Frozen"
        : streak.is_broken
          ? "Lost"
          : "No activity yet";

  return (
    <View className="flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
      <View className="rounded-xl bg-orange-50 p-3">
        <Text className="text-3xl">🔥</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-bold text-slate-500">Current streak</Text>
        <Text className="text-2xl font-black text-slate-950">
          {streak.current_streak} <Text className="text-base font-bold text-slate-500">days</Text>
        </Text>
        <Text className="mt-1 self-start rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">{label}</Text>
      </View>
      <View className="items-end">
        <Text className="mb-1 text-xs font-bold text-slate-400">Freezes</Text>
        <View className="flex-row items-center gap-1">
          <Snowflake color="#60a5fa" size={16} />
          <Text className="text-lg font-black text-blue-500">{streak.freeze_count}</Text>
        </View>
      </View>
    </View>
  );
}

function XpItemCard({
  title,
  description,
  icon,
  gradientClassName,
  cost,
  canAfford,
  purchasing,
  onBuy,
  footer,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientClassName: string;
  cost: number;
  canAfford: boolean;
  purchasing: boolean;
  onBuy: () => void;
  footer: string;
}) {
  return (
    <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200">
      <View className={`flex-row items-center gap-4 p-6 ${gradientClassName}`}>
        <View className="rounded-xl bg-white/25 p-3">{icon}</View>
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-black text-white">{title}</Text>
          <Text className="text-sm font-medium text-white/80">{description}</Text>
        </View>
      </View>
      <View className="p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="mb-0.5 text-xs font-black uppercase tracking-wide text-slate-400">Cost</Text>
            <View className="flex-row items-center gap-1.5">
              <Zap color="#eab308" fill="#eab308" size={20} />
              <Text className="text-2xl font-black text-slate-950">{cost.toLocaleString()}</Text>
              <Text className="text-sm font-bold text-slate-400">XP</Text>
            </View>
          </View>
          {!canAfford ? <Text className="text-right text-xs font-black text-red-400">Not enough XP</Text> : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          className={`rounded-xl py-3 ${canAfford && !purchasing ? "bg-brand" : "bg-slate-100"}`}
          disabled={!canAfford || purchasing}
          onPress={onBuy}
        >
          {purchasing ? (
            <ActivityIndicator color={canAfford ? "#ffffff" : "#94a3b8"} />
          ) : (
            <Text className={`text-center text-sm font-black ${canAfford ? "text-white" : "text-slate-400"}`}>
              {canAfford ? "Buy now" : "Insufficient XP"}
            </Text>
          )}
        </TouchableOpacity>
        <Text className="mt-3 text-center text-xs font-medium text-slate-400">{footer}</Text>
      </View>
    </View>
  );
}

function LoadingBlock() {
  return (
    <View className="min-h-[260px] items-center justify-center">
      <ActivityIndicator color="#e70013" />
    </View>
  );
}
