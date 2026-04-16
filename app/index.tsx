import { useEffect } from "react";
import { View, Text } from "../src/tw";
import { router } from "expo-router";
import { StatusBar } from "react-native";
import Animated, { FadeIn, FadeInDown, withRepeat, withTiming, useSharedValue, useAnimatedStyle, Easing } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Pulse/spin the icon gently
    rotation.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );

    const timer = setTimeout(() => {
      router.replace("/auth");
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  return (
    <View className="flex-1 bg-[#1c1c1e] items-center justify-center relative">
      <StatusBar barStyle="light-content" backgroundColor="#1c1c1e" />
      
      {/* Immersive Glass Background Elements */}
      <View className="absolute top-1/4 right-0 w-80 h-80 bg-brand/30 rounded-full blur-[100px] -mr-32 opacity-50" />
      <View className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/20 rounded-full blur-[100px] -ml-32 opacity-50" />

      <Animated.View entering={FadeIn.duration(1000)} className="items-center z-10">
        <Animated.View style={animatedStyle} className="w-28 h-28 bg-[#FFFFFF0A] rounded-full items-center justify-center mb-6 border border-white/10 shadow-2xl">
          <Ionicons name="flash" size={54} color="#A29BFE" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(800)}>
          <Text className="text-white text-5xl font-extrabold tracking-tighter shadow-lg text-center">
            CodeX
          </Text>
          <Text className="text-white/60 text-lg font-medium text-center tracking-widest mt-2 uppercase">
            Smart Gateway
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
