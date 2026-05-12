import { StyleSheet } from "nativewind";

type NativeWindStyleSheet = typeof StyleSheet & {
  setFlag?: (name: string, value: string) => void;
};

(StyleSheet as NativeWindStyleSheet).setFlag?.("darkMode", "class");
