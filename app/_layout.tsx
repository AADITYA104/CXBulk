import { Stack, useRouter, useSegments } from "expo-router";
import "../global.css";
import { AuthProvider, useAuth } from "../context/auth";
import { useEffect } from "react";
import { useFonts, Inter_900Black } from "@expo-google-fonts/inter";
import * as SplashScreenNative from "expo-splash-screen";

SplashScreenNative.preventAutoHideAsync();

function InitialLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreenNative.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

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
  }, [user, isLoading, segments, router, fontsLoaded]);

  if (!fontsLoaded) return null;

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
