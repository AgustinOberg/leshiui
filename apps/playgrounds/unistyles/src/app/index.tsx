import { Link } from "expo-router"
import { FlatList, Pressable, Text, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

type ComponentEntry = {
  name: string
  slug: "button" | "card" | "dialog"
  description: string
}

const COMPONENTS: ComponentEntry[] = [
  {
    name: "Button",
    slug: "button",
    description: "Pressable with variants, sizes, loading and disabled states.",
  },
  {
    name: "Card",
    slug: "card",
    description:
      "Container with composable header, title, description, content, and footer.",
  },
  {
    name: "Dialog",
    slug: "dialog",
    description:
      "Modal overlay with focus trap, scrim, scroll lock, and size variants.",
  },
]

export default function HomeScreen() {
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={COMPONENTS}
      keyExtractor={(item) => item.slug}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <Link href={`/components/${item.slug}`} asChild>
          <Pressable style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Pressable>
        </Link>
      )}
    />
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  list: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingTop: theme.spacing[4],
    paddingBottom: rt.insets.bottom + theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
  },
  separator: {
    height: theme.spacing[2],
  },
  item: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing[1],
  },
  name: {
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.lineHeights.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.cardForeground,
  },
  description: {
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.mutedForeground,
  },
}))
