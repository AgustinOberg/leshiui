import type { ReactNode } from "react"
import { View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

/**
 * Horizontal flex container that wraps children with consistent gap.
 * Used inside `Section` bodies to lay out variants side-by-side.
 */
export function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing[2],
  },
}))
