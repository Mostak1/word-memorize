import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CheckCircle2,
  Languages,
  Lock,
  LogOut,
  LucideIcon,
  Moon,
  ShoppingBag,
  Volume2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { AuthRequired } from "../../src/components/AuthRequired";
import { api } from "../../src/lib/api";
import { useAuth } from "../../src/providers/AuthProvider";
import { useSettings } from "../../src/queries/useLearning";

type SettingsState = {
  show_bangla: boolean;
  sound_effects: boolean;
  ui_language: "en" | "bn";
  dark_mode_unlocked: boolean;
};

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const settings = useSettings(Boolean(user));
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState<SettingsState | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [appearanceDialogOpen, setAppearanceDialogOpen] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setCurrent(settings.data);
    }
  }, [settings.data]);

  const mutation = useMutation({
    mutationFn: async (payload: Partial<SettingsState>) => {
      const response = await api.patch<{ settings: SettingsState }>("/settings", payload);
      return response.data.settings;
    },
    onSuccess: (updated) => {
      setCurrent(updated);
      queryClient.setQueryData(["settings"], updated);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2200);
    },
    onError: () => {
      if (settings.data) {
        setCurrent(settings.data);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  if (!user) {
    return (
      <AuthRequired
        title="Settings need an account"
        message="Sign in to manage language, sound effects, appearance, and account settings."
      />
    );
  }

  const save = (payload: Partial<SettingsState>) => {
    if (!current || mutation.isPending) return;

    setCurrent({ ...current, ...payload });
    mutation.mutate(payload);
  };

  if (settings.isLoading || !current) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <ActivityIndicator color="#e70013" />
      </View>
    );
  }

  const saving = mutation.isPending;
  const isBanglaUi = current.ui_language === "bn";

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-8 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-1">
          <Text className="text-2xl font-black text-slate-950">Settings</Text>
          <Text className="mt-1 text-xs font-semibold text-slate-400">
            Control how VocabPix looks and sounds.
          </Text>
        </View>

        <SectionCard title="Language Display">
          <SettingRow
            icon={Languages}
            iconBackground="#eef2ff"
            iconColor="#4f46e5"
            title="Show Bangla"
            description={
              current.show_bangla
                ? "Bangla pronunciation and meanings are visible."
                : "Bangla help is hidden while you learn."
            }
            checked={current.show_bangla}
            onChange={(value) => save({ show_bangla: value })}
            saving={saving}
          />

          <Divider />

          <SettingRow
            icon={Languages}
            iconBackground="#dbeafe"
            iconColor="#2563eb"
            title="UI Language"
            description={isBanglaUi ? "Bangla interface is selected." : "English interface is selected."}
            checked={isBanglaUi}
            onChange={() => save({ ui_language: isBanglaUi ? "en" : "bn" })}
            saving={saving}
          />
        </SectionCard>

        <SectionCard title="Sound Effects">
          <SettingRow
            icon={Volume2}
            iconBackground="#fce7f3"
            iconColor="#db2777"
            title="Sound effects"
            description={
              current.sound_effects
                ? "Exercise sounds and feedback are enabled."
                : "Exercise sounds and feedback are muted."
            }
            checked={current.sound_effects}
            onChange={(value) => save({ sound_effects: value })}
            saving={saving}
          />
        </SectionCard>

        <SectionCard title="Appearance">
          <SettingRow
            icon={current.dark_mode_unlocked ? Moon : Lock}
            iconBackground="#f1f5f9"
            iconColor="#475569"
            title="Dark Mode"
            description={
              current.dark_mode_unlocked
                ? "Dark mode support for mobile is coming soon."
                : "Unlock dark mode from the shop on the web app."
            }
            checked={false}
            onChange={() => setAppearanceDialogOpen(true)}
            saving={false}
          />
        </SectionCard>

        <Text className="px-2 text-center text-xs font-medium text-slate-400">
          Changes are saved immediately.
        </Text>

        <TouchableOpacity
          activeOpacity={0.82}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4"
          onPress={logout}
        >
          <LogOut color="#334155" size={18} />
          <Text className="font-black text-slate-800">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      <SavedToast visible={toastVisible} />
      <AppearanceDialog
        unlocked={current.dark_mode_unlocked}
        visible={appearanceDialogOpen}
        onClose={() => setAppearanceDialogOpen(false)}
      />
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="rounded-2xl bg-white px-5 shadow-sm shadow-slate-200">
      <Text className="pb-1 pt-4 text-xs font-black uppercase tracking-widest text-slate-400">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-slate-100" />;
}

function SettingRow({
  icon: Icon,
  iconBackground,
  iconColor,
  title,
  description,
  checked,
  onChange,
  saving,
}: {
  icon: LucideIcon;
  iconBackground: string;
  iconColor: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  saving: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between gap-4 py-4">
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View
          className="h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBackground }}
        >
          <Icon color={iconColor} size={20} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-black text-slate-950">{title}</Text>
          <Text className="mt-0.5 text-xs font-medium leading-4 text-slate-400">
            {description}
          </Text>
        </View>
      </View>
      <Switch
        disabled={saving}
        value={checked}
        onValueChange={onChange}
        trackColor={{ false: "#e2e8f0", true: "#fecdd3" }}
        thumbColor={checked ? "#e70013" : "#ffffff"}
      />
    </View>
  );
}

function SavedToast({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center px-4">
      <View className="flex-row items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 shadow-lg">
        <CheckCircle2 color="#4ade80" size={16} />
        <Text className="text-sm font-black text-white">Settings saved</Text>
      </View>
    </View>
  );
}

function AppearanceDialog({
  unlocked,
  visible,
  onClose,
}: {
  unlocked: boolean;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40 px-4 pb-4">
        <View className="rounded-[28px] bg-white p-6">
          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              {unlocked ? <Moon color="#4f46e5" size={34} /> : <Lock color="#4f46e5" size={34} />}
            </View>
            <Text className="mt-4 text-center text-xl font-black text-slate-950">
              {unlocked ? "Dark mode is coming to mobile" : "Unlock Dark Mode"}
            </Text>
            <Text className="mt-2 text-center text-sm font-medium leading-5 text-slate-500">
              {unlocked
                ? "Your account has access, but the Expo app does not have app-wide theme switching yet."
                : "Dark mode is an unlockable web feature. Use the shop on the web app for now."}
            </Text>
          </View>

          {!unlocked && (
            <View className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3">
              <ShoppingBag color="#4f46e5" size={18} />
              <Text className="text-sm font-black text-indigo-700">Open the web shop to unlock</Text>
            </View>
          )}

          <TouchableOpacity activeOpacity={0.85} className="mt-5 rounded-2xl bg-sky-500 py-4" onPress={onClose}>
            <Text className="text-center text-sm font-black uppercase tracking-widest text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
