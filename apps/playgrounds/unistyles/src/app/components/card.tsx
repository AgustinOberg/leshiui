import { Text } from "react-native"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlaygroundScreen } from "@/components/playground/screen"
import { Section } from "@/components/playground/section"

export default function CardDemoScreen() {
  return (
    <PlaygroundScreen
      title="Card"
      description="Composable container — Card + CardHeader + CardTitle + CardDescription + CardContent + CardFooter."
    >
      <Section title="Basic">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have 3 unread messages.</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Check your inbox to mark them as read.</Text>
          </CardContent>
        </Card>
      </Section>

      <Section title="With footer">
        <Card>
          <CardHeader>
            <CardTitle>Project deleted</CardTitle>
            <CardDescription>
              This action cannot be undone. All data tied to the project will
              be removed from our servers immediately.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="destructive">Delete</Button>
            <Button variant="outline">Cancel</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Header only">
        <Card>
          <CardHeader>
            <CardTitle>Compact card</CardTitle>
            <CardDescription>
              Sometimes a card is just a title and a description.
            </CardDescription>
          </CardHeader>
        </Card>
      </Section>
    </PlaygroundScreen>
  )
}
