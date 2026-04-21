import { useState } from "react";
import { View, Text, TextInput, Pressable, Platform, KeyboardAvoidingView, ActivityIndicator, Alert, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown, SlideInUp } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/auth";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Input Required", "Please enter both email and password");
      return;
    }
    
    setIsLoggingIn(true);
    try {
      if (isRegistering) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (e: any) {
      Alert.alert(isRegistering ? "Registration Failed" : "Login Failed", e.message || "An unknown error occurred.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: "#000"}}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Decorative Blobs - Dark Mode Version */}
      <View style={[{position: "absolute", width: 250, height: 250, borderRadius: 125, opacity: 0.5}, { top: -100, left: -50, backgroundColor: "rgba(0,122,255,0.1)" }]} />
      <View style={[{position: "absolute", width: 250, height: 250, borderRadius: 125, opacity: 0.5}, { bottom: -100, right: -50, width: 300, height: 300, backgroundColor: "rgba(255,45,85,0.1)" }]} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex: 1, paddingHorizontal: 24, justifyContent: "center"}}
      >
        <Animated.View entering={FadeInUp.duration(1000).springify()} style={{alignItems: "center", marginBottom: 40}}>
          <View style={{width: 80, height: 80, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 20, overflow: "hidden"}}>
            <Image source={require("../assets/images/app-logo.png")} style={{width: "100%", height: "100%", resizeMode: "cover"}} />
          </View>
          <Text style={{fontSize: 28, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.5}}>{isRegistering ? "Create Account" : "CXBulk Login"}</Text>
          <Text style={{fontSize: 14, color: "#8E8E93", marginTop: 8, textAlign: "center"}}>{isRegistering ? "Sign up to start broadcasting messages" : "Sign in to manage your SMS gateway"}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(800).springify()}>
          <View style={{borderRadius: 32, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)"}}>
            <BlurView intensity={20} tint="dark" style={{padding: 24}}>
              
              <View style={{flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, height: 56}}>
                <Ionicons name="mail" size={20} color="#8E8E93" style={{marginRight: 12}} />
                <TextInput
                  style={{flex: 1, color: "#FFFFFF", fontSize: 16}}
                  placeholder="Email Address"
                  placeholderTextColor="#48484A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={{flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, paddingHorizontal: 16, marginBottom: 24, height: 56}}>
                <Ionicons name="lock-closed" size={20} color="#8E8E93" style={{marginRight: 12}} />
                <TextInput
                  style={{flex: 1, color: "#FFFFFF", fontSize: 16}}
                  placeholder="Password"
                  placeholderTextColor="#48484A"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <Pressable
                style={({ pressed }) => [{
                  height: 56,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4
                }, { backgroundColor: isLoggingIn ? "#303030" : (pressed ? "#222" : "#FFFFFF") }]}
                onPress={handleAuth}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Text style={[{fontSize: 16, fontWeight: "700"}, { color: "#000" }]}>{isRegistering ? "Sign Up" : "Continue"}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#000" />
                  </>
                )}
              </Pressable>

              <Pressable 
                onPress={() => setIsRegistering(!isRegistering)}
                style={{alignItems: "center", paddingVertical: 8}}
              >
                <Text style={{color: "#007AFF", fontSize: 14, fontWeight: "600"}}>
                  {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </Text>
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
