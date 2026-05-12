import type { Theme } from "./tokens/types"

declare module "react-native-unistyles" {
  export interface UnistylesThemes {
    light: Theme
    dark: Theme
  }
}
