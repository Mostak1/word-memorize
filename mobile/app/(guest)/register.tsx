import { Link } from "expo-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (isSubmitting) return;

    setError(null);

    if (password !== passwordConfirmation) {
      setError("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch {
      setError("Could not create the account. Check the fields and try again.");
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
        <View className="mb-8 items-center">
          <Text className="text-center text-3xl font-black text-slate-950">Create Account</Text>
          <Text className="mt-2 text-center text-base font-medium leading-6 text-slate-500">
            Start your learning journey today.
          </Text>
        </View>

        <View className="gap-4">
          <FieldLabel label="Full Name" />
          <InputShell>
            <User color="#94a3b8" size={21} />
            <TextInput
              autoComplete="name"
              className="min-h-12 flex-1 text-base font-semibold text-slate-950"
              placeholder="John Doe"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </InputShell>

          <FieldLabel label="Email Address" />
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
              autoComplete="new-password"
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

          <FieldLabel label="Confirm Password" />
          <InputShell>
            <Lock color="#94a3b8" size={21} />
            <TextInput
              autoComplete="new-password"
              className="min-h-12 flex-1 text-base font-semibold text-slate-950"
              placeholder="********"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showConfirmPassword}
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
            />
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.75}
              className="h-10 w-10 items-center justify-center"
              onPress={() => setShowConfirmPassword((value) => !value)}
            >
              {showConfirmPassword ? <EyeOff color="#64748b" size={21} /> : <Eye color="#64748b" size={21} />}
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
            <Text className="text-center text-base font-black text-white">Create Account</Text>
          )}
        </TouchableOpacity>

        <View className="mt-7 flex-row justify-center">
          <Text className="text-sm font-semibold text-slate-500">Already have an account? </Text>
          <Link href="/(guest)/login" className="text-sm font-black text-brand">
            Sign in
          </Link>
        </View>
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
