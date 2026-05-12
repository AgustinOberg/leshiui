import { Platform } from "react-native"

import { FocusScope as FocusScopeNative } from "./focus-scope.native"
import { FocusScope as FocusScopeWeb } from "./focus-scope.web"

export const FocusScope =
  Platform.OS === "web" ? FocusScopeWeb : FocusScopeNative
