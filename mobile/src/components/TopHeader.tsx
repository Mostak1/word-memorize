import { Link } from "expo-router";
import { Image, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, RotateCw, Settings, User, Zap } from "lucide-react-native";
import { API_URL } from "../lib/api";
import { useAuth } from "../providers/AuthProvider";
import { useDashboard } from "../queries/useDashboard";
import { useState } from "react";
import { ReactNode } from "react";

const logo = require("../../assets/logo.png");
const defaultAvatar = require("../../assets/default_pic.jpeg");

export function TopHeader() {
  const { user, logout } = useAuth();
  const dashboard = useDashboard(Boolean(user));
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const xpBalance = dashboard.data?.xp?.balance ?? 0;
  const avatarSource =
    user?.image && !imageFailed
      ? { uri: user.image.startsWith("http") ? user.image : `${API_URL.replace(/\/$/, "")}/${user.image.replace(/^\//, "")}` }
      : defaultAvatar;

  async function refreshAppData() {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
  }

  return (
    <SafeAreaView edges={["top"]} className="bg-slate-50 px-4 pb-2">
      <View className="mt-2 flex-row items-center justify-between rounded-[28px] border border-white bg-white/95 p-2 shadow-sm shadow-slate-200">
        <Link href="/(user)/dashboard" asChild>
          <TouchableOpacity activeOpacity={0.82} className="min-w-0 flex-1 flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-50 p-1.5">
              <Image source={logo} className="h-full w-full" resizeMode="contain" />
            </View>
            <Text className="text-xl font-black text-brand" numberOfLines={1}>
              VocabPix
            </Text>
          </TouchableOpacity>
        </Link>

        <View className="flex-row items-center gap-2">
          {user ? (
            <>
              <View className="flex-row items-center gap-1.5 rounded-2xl border border-yellow-100 bg-yellow-50 px-3 py-2">
                <Zap color="#eab308" fill="#eab308" size={16} />
                {dashboard.isLoading ? (
                  <Loader2 color="#eab308" size={16} />
                ) : (
                  <Text className="text-sm font-black text-yellow-700">{xpBalance.toLocaleString()}</Text>
                )}
              </View>

              <TouchableOpacity activeOpacity={0.82} onPress={() => setMenuOpen(true)}>
                <View className="h-11 w-11 overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-sm shadow-slate-300">
                  <Image
                    source={avatarSource}
                    className="h-full w-full"
                    resizeMode="cover"
                    onError={() => setImageFailed(true)}
                  />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <Link href="/(guest)/login" asChild>
              <TouchableOpacity activeOpacity={0.85} className="rounded-xl bg-brand px-4 py-2.5">
                <Text className="text-sm font-black text-white">Sign in</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable className="flex-1 bg-black/10 px-4 pt-20" onPress={() => setMenuOpen(false)}>
          <Pressable className="ml-auto w-56 rounded-3xl border border-slate-100 bg-white py-2 shadow-xl shadow-slate-300">
            <View className="border-b border-slate-100 px-4 py-3">
              <Text className="text-sm font-black text-slate-950" numberOfLines={1}>
                {user?.name}
              </Text>
              <Text className="mt-0.5 text-xs font-medium text-slate-500" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>

            <HeaderMenuLink href="/(user)/dashboard" icon={<User color="#64748b" size={17} />} label="Profile" onPress={() => setMenuOpen(false)} />
            <HeaderMenuLink href="/(user)/settings" icon={<Settings color="#64748b" size={17} />} label="Settings" onPress={() => setMenuOpen(false)} />

            <TouchableOpacity
              activeOpacity={0.75}
              className="flex-row items-center gap-3 px-4 py-3"
              disabled={isRefreshing}
              onPress={refreshAppData}
            >
              <RotateCw color={isRefreshing ? "#e70013" : "#64748b"} size={17} />
              <Text className="text-sm font-bold text-slate-700">Refresh</Text>
            </TouchableOpacity>

            <View className="mt-1 border-t border-slate-100 pt-1">
              <TouchableOpacity activeOpacity={0.75} className="flex-row items-center gap-3 px-4 py-3" onPress={handleLogout}>
                <LogOut color="#e70013" size={17} />
                <Text className="text-sm font-bold text-brand">Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function HeaderMenuLink({
  href,
  icon,
  label,
  onPress,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Link href={href as never} asChild>
      <TouchableOpacity activeOpacity={0.75} className="flex-row items-center gap-3 px-4 py-3" onPress={onPress}>
        {icon}
        <Text className="text-sm font-bold text-slate-700">{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}
