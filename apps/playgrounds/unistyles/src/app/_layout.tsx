import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useUnistyles } from "react-native-unistyles"

import { PortalHost, PortalProvider } from "@/lib/portal"

export default function RootLayout() {
  const { theme } = useUnistyles()

  return (
    <PortalProvider>
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
        <Stack.Screen name="components/card" options={{ title: "Card" }} />
        <Stack.Screen
          name="components/dialog"
          options={{ title: "Dialog" }}
        />
      </Stack>
      <PortalHost />
    </PortalProvider>
  )
}
