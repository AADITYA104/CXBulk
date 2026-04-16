import { Stack, useRouter, useSegments } from "expo-router";
import "@/global.css";
import { AuthProvider, useAuth } from "../context/auth";
import { useEffect } from "react";

function InitialLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === "auth" || currentSegment === "index" || !currentSegment;

    if (!user && !inAuthGroup) {
      // Redirect to the login page if trying to access app without auth
      router.replace("/auth");
    } else if (user && inAuthGroup && currentSegment !== "index") {
      // Redirect to the app directory if logged in and trying to access auth
      // Note: We allow currentSegment === "index" so the splash screen can gracefully finish its animation
      router.replace("/(app)/dashboard");
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
