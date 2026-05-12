import { Button } from "@/components/ui/button"
import { PlaygroundScreen } from "@/components/playground/screen"
import { Section } from "@/components/playground/section"
import { Row } from "@/components/playground/row"

export default function ButtonDemoScreen() {
  return (
    <PlaygroundScreen
      title="Button"
      description="Pressable with variant and size variants, plus loading and disabled states. Renders a focus ring on web."
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

      <Section title="Sizes">
        <Row>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" accessibilityLabel="Icon">
            ★
          </Button>
        </Row>
      </Section>

      <Section title="States">
        <Row>
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </Row>
      </Section>

      <Section
        title="Long press"
        description="Tap and hold to feel the pressed-state opacity transition."
      >
        <Row>
          <Button variant="default">Hold me</Button>
          <Button variant="outline">Hold me</Button>
        </Row>
      </Section>
    </PlaygroundScreen>
  )
}
