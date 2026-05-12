import "../src/lib/nativewind";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "../src/providers/AppProviders";

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#0f172a",
          headerTitleStyle: { color: "#0f172a", fontWeight: "800" },
          contentStyle: { backgroundColor: "#f8fafc" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(guest)" options={{ headerShown: false }} />
        <Stack.Screen name="(user)" options={{ headerShown: false }} />
        <Stack.Screen name="categories/[id]" options={{ title: "Wordlists" }} />
        <Stack.Screen name="wordlists/[id]" options={{ title: "Wordlist" }} />
        <Stack.Screen name="words/[id]" options={{ title: "Word" }} />
        <Stack.Screen name="sessions/wordlists/[id]" options={{ title: "Session" }} />
      </Stack>
    </AppProviders>
  );
}
