import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

function webStorage() {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export async function getToken(key: string) {
  const storage = webStorage();

  if (storage) {
    return storage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

export async function setToken(key: string, value: string) {
  const storage = webStorage();

  if (storage) {
    storage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function deleteToken(key: string) {
  const storage = webStorage();

  if (storage) {
    storage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
