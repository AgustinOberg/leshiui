import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { PlaygroundScreen } from "@/components/playground/screen"
import { Section } from "@/components/playground/section"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DialogDemoScreen() {
  const [controlledOpen, setControlledOpen] = useState(false)

  return (
    <PlaygroundScreen
      title="Dialog"
      description="Modal overlay over @rn-primitives/dialog. Web → Radix focus trap + scroll lock + ESC. Native → BackHandler + accessibilityViewIsModal. Reanimated fade + scale (HeroUI Native parity). Scroll the page below and reopen any dialog — the overlay should stay viewport-locked."
    >
      <Section title="Default">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. It will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive">Delete account</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="No close button">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open without X</Button>
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Forced choice</DialogTitle>
              <DialogDescription>
                The X icon is hidden — the user must use a button below.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Not dismissible from overlay">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open locked dialog</Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
            overlayProps={{ closeOnPress: false }}
          >
            <DialogHeader>
              <DialogTitle>Locked overlay</DialogTitle>
              <DialogDescription>
                Pressing the overlay does nothing. The user must use the X icon
                or a button below to close. ESC still works (intentional — not
                blocked).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>I understand</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Footer with auto Close button">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Auto-rendered Close</DialogTitle>
              <DialogDescription>
                `showCloseButton` on the footer renders a default Close button.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Controlled (external state)">
        <Button onPress={() => setControlledOpen(true)}>
          {controlledOpen ? "Closing…" : "Open from external state"}
        </Button>
        <Dialog open={controlledOpen} onOpenChange={setControlledOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled mode</DialogTitle>
              <DialogDescription>
                Open / close is driven by the parent's `open` and
                `onOpenChange` props.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onPress={() => setControlledOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Long content (scrolls inside)">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open long dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terms & conditions</DialogTitle>
              <DialogDescription>
                Scroll inside the content area without dismissing the modal.
              </DialogDescription>
            </DialogHeader>
            <ScrollView style={styles.scroll}>
              {LONG_PARAGRAPHS.map((paragraph) => (
                <Text key={paragraph.id} style={styles.paragraph}>
                  {paragraph.text}
                </Text>
              ))}
            </ScrollView>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Accept</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Scroll the page, then reopen">
        <Text style={styles.fillerNote}>
          The block below forces the page to overflow so you can scroll, then
          open any dialog above to verify the overlay stays viewport-locked
          (web → position: fixed; native → root-mounted portal).
        </Text>
        <View style={styles.fillerColumn}>
          {FILLER_BLOCKS.map((block) => (
            <View key={block.id} style={styles.fillerCard}>
              <Text style={styles.fillerTitle}>{block.title}</Text>
              <Text style={styles.fillerBody}>{block.body}</Text>
            </View>
          ))}
        </View>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog from bottom of page</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Viewport-locked overlay</DialogTitle>
              <DialogDescription>
                You triggered this from the bottom of the page. The overlay
                covers the full viewport, not just what was visible when the
                page was at the top.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </Section>
    </PlaygroundScreen>
  )
}

const LONG_PARAGRAPHS = Array.from({ length: 20 }).map((_, i) => ({
  id: `p-${i}`,
  text: `${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
}))

const FILLER_BLOCKS = Array.from({ length: 18 }).map((_, i) => ({
  id: `filler-${i}`,
  title: `Filler block #${i + 1}`,
  body: `${i + 1}. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.`,
}))

const styles = StyleSheet.create((theme) => ({
  scroll: {
    maxHeight: 240,
  },
  paragraph: {
    paddingVertical: theme.spacing[2],
    color: theme.colors.foreground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
  },
  fillerNote: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
  },
  fillerColumn: {
    gap: theme.spacing[3],
  },
  fillerCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing[4],
    gap: theme.spacing[2],
    backgroundColor: theme.colors.card,
  },
  fillerTitle: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  fillerBody: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
  },
}))
