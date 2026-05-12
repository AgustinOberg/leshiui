import { Platform } from "react-native"
import { useScrollLock as useScrollLockNative } from "./use-scroll-lock.native"
import { useScrollLock as useScrollLockWeb } from "./use-scroll-lock.web"

export const useScrollLock =
  Platform.OS === "web" ? useScrollLockWeb : useScrollLockNative
