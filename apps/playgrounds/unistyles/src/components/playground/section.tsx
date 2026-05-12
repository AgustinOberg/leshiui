import type { ReactNode } from "react"
import { Text, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

type Props = {
  title: string
  description?: string
  children: ReactNode
}

/**
 * Section inside a demo screen. Groups related examples under a
 * small uppercase title (e.g., "Variants", "Sizes", "States").
 */
export function Section({ title, description, children }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing[3],
  },
  header: {
    gap: theme.spacing[1],
  },
  title: {
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.lineHeights.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  description: {
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.mutedForeground,
  },
  body: {
    gap: theme.spacing[3],
  },
}))
