import { Feather } from "@expo/vector-icons"
import { Link } from "expo-router"
import { Pressable, Text } from "react-native"
import { useUnistyles } from "react-native-unistyles"
import { Button } from "@/components/ui/button"
import { PlaygroundScreen } from "@/components/playground/screen"
import { Section } from "@/components/playground/section"
import { Row } from "@/components/playground/row"

export default function ButtonDemoScreen() {
  const { theme } = useUnistyles()
  // Foreground colors per variant — kept here in the demo because each Button
  // controls its own label color via tokens; the icon caller chooses the
  // matching color manually (icons are arbitrary ReactNodes, not auto-tinted).
  const fgPrimary = theme.colors.primaryForeground
  const fgDestructive = theme.colors.destructiveForeground
  const fgOutline = theme.colors.foreground
  const fgSecondary = theme.colors.secondaryForeground

  return (
    <PlaygroundScreen
      title="Button"
      description="shadcn-perfect parity: 6 variants × 8 sizes, hover & focus-visible ring on web, tactile scale on native, loading + disabled states, `asChild` for routing, and `startContent` / `endContent` for icons."
    >
      <Section title="Variants">
        <Row>
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </Row>
      </Section>

      <Section title="Sizes (text)">
        <Row>
          <Button size="xs">XS</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </Row>
      </Section>

      <Section title="Sizes (icon-only)">
        <Row>
          <Button size="icon-xs" accessibilityLabel="Add (xs)">
            ★
          </Button>
          <Button size="icon-sm" accessibilityLabel="Add (sm)">
            ★
          </Button>
          <Button size="icon" accessibilityLabel="Add">
            ★
          </Button>
          <Button size="icon-lg" accessibilityLabel="Add (lg)">
            ★
          </Button>
        </Row>
      </Section>

      <Section title="States">
        <Row>
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button variant="outline" disabled>
            Outline disabled
          </Button>
          <Button variant="outline" loading>
            Outline loading
          </Button>
        </Row>
      </Section>

      <Section
        title="Hover & focus (web)"
        description="Hover the buttons or tab through them on the web target to see the 3 px focus ring and variant-specific hover background."
      >
        <Row>
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </Row>
      </Section>

      <Section
        title="Press feedback"
        description="Hold to feel the difference: web fades to opacity 0.9; iOS / Android also scale to 0.97."
      >
        <Row>
          <Button>Hold me</Button>
          <Button variant="outline">Hold me</Button>
          <Button variant="ghost">Hold me</Button>
        </Row>
      </Section>

      <Section
        title="Icons (startContent / endContent)"
        description="Slot-based icon props. Pass any element — common case is `@expo/vector-icons`. Padding shrinks automatically (shadcn `has-[>svg]:px-*` parity)."
      >
        <Row>
          <Button startContent={<Feather name="mail" size={16} color={fgPrimary} />}>
            Login with email
          </Button>
          <Button
            variant="outline"
            endContent={<Feather name="arrow-right" size={16} color={fgOutline} />}
          >
            Continue
          </Button>
          <Button
            variant="destructive"
            startContent={<Feather name="trash-2" size={16} color={fgDestructive} />}
            endContent={<Feather name="chevron-right" size={16} color={fgDestructive} />}
          >
            Delete
          </Button>
          <Button
            variant="secondary"
            startContent={<Feather name="download" size={16} color={fgSecondary} />}
          >
            Download
          </Button>
        </Row>
      </Section>

      <Section
        title="Icons + sizes"
        description="Icon sizes scale with the button — 12 px on `xs`, 16 px on `sm` / `default` / `lg`. Padding adjusts per size."
      >
        <Row>
          <Button
            size="xs"
            startContent={<Feather name="plus" size={12} color={fgPrimary} />}
          >
            XS
          </Button>
          <Button
            size="sm"
            startContent={<Feather name="plus" size={16} color={fgPrimary} />}
          >
            Small
          </Button>
          <Button
            size="default"
            startContent={<Feather name="plus" size={16} color={fgPrimary} />}
          >
            Default
          </Button>
          <Button
            size="lg"
            startContent={<Feather name="plus" size={16} color={fgPrimary} />}
          >
            Large
          </Button>
        </Row>
      </Section>

      <Section
        title="Loading + endContent"
        description="When loading, the spinner replaces `startContent`. `endContent` stays in place."
      >
        <Row>
          <Button
            loading
            startContent={<Feather name="mail" size={16} color={fgPrimary} />}
            endContent={<Feather name="arrow-right" size={16} color={fgPrimary} />}
          >
            Sending
          </Button>
          <Button
            variant="outline"
            loading
            startContent={<Feather name="mail" size={16} color={fgOutline} />}
            endContent={<Feather name="arrow-right" size={16} color={fgOutline} />}
          >
            Sending
          </Button>
        </Row>
      </Section>

      <Section
        title="Composition with routing (Link asChild)"
        description="Idiomatic Expo Router pattern: `Link` owns the asChild so it can wrap any element with navigation. Button stays a styled Pressable underneath."
      >
        <Row>
          <Link href="/" asChild>
            <Button>Go home</Button>
          </Link>
          <Link href="/components/button" asChild>
            <Button variant="outline">Reload button page</Button>
          </Link>
        </Row>
      </Section>

      <Section
        title="Button asChild (Slot)"
        description="Pass any custom Pressable as the only child; Button merges its style + a11y + event handlers onto it via the shared `Slot` primitive."
      >
        <Row>
          <Button
            asChild
            onPress={() => console.log("[Demo] asChild Pressable fired")}
          >
            <Pressable accessibilityLabel="Custom asChild pressable">
              <Text>Custom Pressable</Text>
            </Pressable>
          </Button>
        </Row>
      </Section>
    </PlaygroundScreen>
  )
}
