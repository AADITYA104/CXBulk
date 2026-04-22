import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/auth";
import { SplashScreen } from "@/components/splash-screen";

export default function InitialScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = React.useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    if (!showSplash && !isLoading) {
      if (user) {
        router.replace("/(app)/dashboard");
      } else {
        router.replace("/auth");
      }
    }
  }, [showSplash, isLoading, user]);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Fallback - should not show due to navigation
  return <View style={{ flex: 1, backgroundColor: "#F2F2F7" }} />;
}
