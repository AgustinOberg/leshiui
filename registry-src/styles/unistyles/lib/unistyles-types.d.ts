import type { Theme } from "../../../core/tokens/types.js"

declare module "react-native-unistyles" {
  export interface UnistylesThemes {
    light: Theme
    dark: Theme
  }
}
