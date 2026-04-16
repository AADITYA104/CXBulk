import { useState } from "react";
import { router } from "expo-router";
import { View, Text, TextInput, Pressable, Platform, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "react-native";
import Animated, { FadeInUp, FadeInDown, SlideInUp } from "react-native-reanimated";
import { BlurView } from "expo-blur";

export default function AuthScreen() {
  const [inputValue, setInputValue] = useState("");

  const handleAuth = () => {
    router.replace("/(app)/dashboard");
  };

  return (
    <View style={{flex: 1, backgroundColor: "#E5E5EA"}}>
      <StatusBar barStyle="dark-content" backgroundColor="#E5E5EA" />
      
      {/* Decorative Blob */}
      <View style={{position: "absolute", top: -100, left: -50, width: 400, height: 400, backgroundColor: "rgba(0,122,255,0.15)", borderRadius: 200}} />
      <View style={{position: "absolute", bottom: -100, right: -50, width: 300, height: 300, backgroundColor: "rgba(52,199,89,0.15)", borderRadius: 150}} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex: 1, justifyContent: "center", paddingHorizontal: 32}}
      >
        <Animated.View entering={FadeInUp.duration(1000).springify()} style={{alignItems: "center", marginBottom: 32}}>
          <View style={{
            width: 80, height: 80, borderRadius: 24, backgroundColor: "#fff",
            alignItems: "center", justifyContent: "center", 
            shadowColor: "#000", shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.1, shadowRadius: 24, elevation: 5,
            marginBottom: 24
          }}>
            <Ionicons name="chatbubbles" size={36} color="#007AFF" />
          </View>
          <Text style={{fontSize: 28, fontWeight: "900", color: "#1C1C1E", textAlign: "center"}}>Ready to Broadcast</Text>
          <Text style={{fontSize: 15, color: "#8E8E93", marginTop: 8, textAlign: "center"}}>Sign in to manage your SMS gateway</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(800).springify()}>
          <View style={{
            backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 28, overflow: "hidden",
            borderColor: "rgba(255,255,255,1)", borderWidth: 1,
            shadowColor: "#000", shadowOffset: {width: 0, height: 12}, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4
          }}>
            <BlurView intensity={60} tint="light" style={{padding: 24}}>
              
              <View style={{flexDirection: "row", alignItems: "center", backgroundColor: "#F2F2F7", borderRadius: 16, height: 56, paddingHorizontal: 16, marginBottom: 16}}>
                <Ionicons name="call" size={20} color="#8E8E93" style={{marginRight: 12}} />
                <TextInput
                  style={{flex: 1, fontSize: 16, color: "#1C1C1E", fontWeight: "500"}}
                  placeholder="Mobile Number"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="phone-pad"
                  value={inputValue}
                  onChangeText={setInputValue}
                />
              </View>

              <View style={{flexDirection: "row", alignItems: "center", backgroundColor: "#F2F2F7", borderRadius: 16, height: 56, paddingHorizontal: 16, marginBottom: 24}}>
                <Ionicons name="lock-closed" size={20} color="#8E8E93" style={{marginRight: 12}} />
                <TextInput
                  style={{flex: 1, fontSize: 16, color: "#1C1C1E", fontWeight: "500"}}
                  placeholder="Password"
                  placeholderTextColor="#C7C7CC"
                  secureTextEntry
                />
              </View>

              <Pressable
                style={{
                  backgroundColor: "#007AFF", borderRadius: 16, height: 56,
                  alignItems: "center", justifyContent: "center", flexDirection: "row",
                  shadowColor: "#007AFF", shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8
                }}
                onPress={handleAuth}
              >
                <Text style={{color: "#fff", fontWeight: "bold", fontSize: 16, marginRight: 8}}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </Pressable>

            </BlurView>
          </View>
        </Animated.View>
        
        <Animated.View entering={SlideInUp.delay(500).duration(800)} style={{alignItems: "center", marginTop: 40}}>
           <Text style={{color: "#8E8E93", fontWeight: "600"}}>CodeX Solutions</Text>
        </Animated.View>

      </KeyboardAvoidingView>
    </View>
  );
}
