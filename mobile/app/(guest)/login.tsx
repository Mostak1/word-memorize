import { Link } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/providers/AuthProvider";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch {
      setError("The provided credentials are incorrect.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-black text-slate-950">Welcome back</Text>
          <Text className="mt-2 text-base font-medium leading-6 text-slate-500">
            Sign in to continue your learning journey.
          </Text>
        </View>

        <View className="gap-4">
          <FieldLabel label="Email" />
          <InputShell>
            <Mail color="#94a3b8" size={21} />
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              className="min-h-12 flex-1 text-base font-semibold text-slate-950"
              placeholder="your@email.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
            />
          </InputShell>

          <FieldLabel label="Password" />
          <InputShell>
            <Lock color="#94a3b8" size={21} />
            <TextInput
              autoComplete="password"
              className="min-h-12 flex-1 text-base font-semibold text-slate-950"
              placeholder="********"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.75}
              className="h-10 w-10 items-center justify-center"
              onPress={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff color="#64748b" size={21} /> : <Eye color="#64748b" size={21} />}
            </TouchableOpacity>
          </InputShell>
        </View>

        {error ? (
          <View className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
            <Text className="text-sm font-bold leading-5 text-brand">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.86}
          className="mt-7 rounded-full bg-brand px-5 py-4 disabled:opacity-60"
          disabled={isSubmitting}
          onPress={submit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-center text-base font-black text-white">Log in</Text>
          )}
        </TouchableOpacity>

        <Link href="/(user)/dashboard" asChild>
          <TouchableOpacity activeOpacity={0.82} className="mt-3 rounded-full border-2 border-slate-200 bg-white px-5 py-4">
            <Text className="text-center text-base font-black text-slate-900">Continue as guest</Text>
          </TouchableOpacity>
        </Link>

        <View className="my-7 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-slate-200" />
          <Text className="text-sm font-semibold text-slate-400">New here?</Text>
          <View className="h-px flex-1 bg-slate-200" />
        </View>

        <Link href="/(guest)/register" asChild>
          <TouchableOpacity activeOpacity={0.82} className="rounded-full border-2 border-slate-200 bg-white px-5 py-4">
            <Text className="text-center text-base font-black text-brand">Create account</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text className="-mb-2 text-sm font-black text-slate-700">{label}</Text>;
}

function InputShell({ children }: { children: React.ReactNode }) {
  return (
    <View className="min-h-[56px] flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
      {children}
    </View>
  );
}
