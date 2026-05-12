import type { ReactNode } from "react"
import { ScrollView, Text, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

type Props = {
  title: string
  description?: string
  children: ReactNode
}

/**
 * Page-level wrapper used by every component demo screen.
 *
 * Renders a sticky title + optional description, then a scrollable
 * body with consistent spacing. Theme tokens drive every value so
 * theme switches reflow correctly.
 */
export function PlaygroundScreen({ title, description, children }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <View style={styles.body}>{children}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingTop: theme.spacing[4],
    paddingBottom: rt.insets.bottom + theme.spacing[8],
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[6],
  },
  header: {
    gap: theme.spacing[2],
  },
  title: {
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.xl,
    lineHeight: theme.typography.lineHeights.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.foreground,
  },
  description: {
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.mutedForeground,
  },
  body: {
    gap: theme.spacing[6],
  },
}))
