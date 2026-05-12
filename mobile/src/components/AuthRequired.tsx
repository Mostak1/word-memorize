import { Link } from "expo-router";
import { LockKeyhole, UserPlus } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type AuthRequiredProps = {
  title?: string;
  message?: string;
};

export function AuthRequired({
  title = "Sign in required",
  message = "Create an account or sign in to save progress and use this feature.",
}: AuthRequiredProps) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6">
      <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-rose-50">
        <LockKeyhole color="#e70013" size={38} />
      </View>
      <Text className="mt-6 text-center text-3xl font-black text-slate-950">{title}</Text>
      <Text className="mt-3 text-center text-base font-medium leading-7 text-slate-500">{message}</Text>

      <Link href="/(guest)/login" asChild>
        <TouchableOpacity activeOpacity={0.85} className="mt-8 w-full rounded-full bg-brand px-5 py-4">
          <Text className="text-center text-base font-black text-white">Sign in</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/(guest)/register" asChild>
        <TouchableOpacity
          activeOpacity={0.85}
          className="mt-3 w-full flex-row items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-5 py-4"
        >
          <UserPlus color="#e70013" size={18} />
          <Text className="text-center text-base font-black text-slate-900">Create account</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
