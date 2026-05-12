import { useState } from "react"
import { Text } from "react-native"

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
import { PlaygroundScreen } from "@/components/playground/screen"
import { Section } from "@/components/playground/section"

export default function DialogDemoScreen() {
  const [controlledOpen, setControlledOpen] = useState(false)

  return (
    <PlaygroundScreen
      title="Dialog"
      description="Modal overlay portaled to root. Focus trap on web, scroll lock while open, four size variants."
    >
      <Section title="Default (uncontrolled)">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open default dialog</Button>
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

      <Section title="Controlled">
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

      <Section title="Sizes">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Small</Button>
          </DialogTrigger>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Small dialog</DialogTitle>
              <DialogDescription>
                Compact width — useful for quick confirmations.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>OK</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Large</Button>
          </DialogTrigger>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Large dialog</DialogTitle>
              <DialogDescription>
                Wider content area — useful for longer prose or richer layouts.
              </DialogDescription>
            </DialogHeader>
            <Text>You can stack any content here, not just description text.</Text>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Continue</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Fullscreen</Button>
          </DialogTrigger>
          <DialogContent size="fullscreen">
            <DialogHeader>
              <DialogTitle>Fullscreen dialog</DialogTitle>
              <DialogDescription>
                Takes the entire viewport. Useful on small screens.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>
    </PlaygroundScreen>
  )
}
