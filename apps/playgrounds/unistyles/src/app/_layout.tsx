import { PortalHost } from "@rn-primitives/portal"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useUnistyles } from "react-native-unistyles"

export default function RootLayout() {
  const { theme } = useUnistyles()

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
          headerTitleStyle: {
            fontFamily: theme.typography.families.sans,
            fontWeight: theme.typography.weights.semibold,
          },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Leshi UI Playground" }}
        />
        <Stack.Screen name="components/button" options={{ title: "Button" }} />
        <Stack.Screen
          name="components/dialog"
          options={{ title: "Dialog" }}
        />
      </Stack>
      <PortalHost />
    </>
  )
}
