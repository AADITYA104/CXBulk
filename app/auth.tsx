import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, SlideInUp } from "react-native-reanimated";
import { useAuth } from "../context/auth";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      console.error("Auth error:", e);
      let errorMessage = "An unknown error occurred.";
      
      if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (e.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (e.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (e.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (e.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (e.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      Alert.alert(isRegistering ? "Registration Failed" : "Login Failed", errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      {/* Decorative Blobs — light mode accent circles */}
      <View style={[styles.blob, { top: -100, left: -60, backgroundColor: "rgba(0,122,255,0.08)" }]} />
      <View style={[styles.blob, { bottom: -120, right: -60, width: 300, height: 300, backgroundColor: "rgba(90,200,250,0.1)" }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Logo + Title */}
        <Animated.View entering={FadeInUp.duration(1000).springify()} style={styles.headerSection}>
          <View style={styles.logoWrap}>
            <Image source={require("../assets/images/app-logo.png")} style={styles.logoImage} />
          </View>
          <Text style={styles.title}>{isRegistering ? "Create Account" : "CXBulk Login"}</Text>
          <Text style={styles.subtitle}>{isRegistering ? "Sign up to start broadcasting messages" : "Sign in to manage your SMS gateway"}</Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(800).springify()}>
          <View style={styles.formCard}>

            {/* Email Input */}
            <View style={styles.inputRow}>
              <Ionicons name="mail" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="Email Address"
                placeholderTextColor="#C7C7CC"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputRow, { marginBottom: 24 }]}>
              <Ionicons name="lock-closed" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="Password"
                placeholderTextColor="#C7C7CC"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#8E8E93" />
              </Pressable>
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: isLoggingIn ? "#E5E5EA" : (pressed ? "#005EC4" : "#007AFF") }
              ]}
              onPress={handleAuth}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>{isRegistering ? "Sign Up" : "Continue"}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </Pressable>

            {/* Toggle Register/Login */}
            <Pressable
              onPress={() => setIsRegistering(!isRegistering)}
              style={styles.toggleLink}
            >
              <Text style={styles.toggleText}>
                {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </Text>
            </Pressable>

          </View>
        </Animated.View>

        {/* Footer branding */}
        <Animated.View entering={SlideInUp.delay(500).duration(800)} style={styles.footer}>
          <Text style={styles.footerText}>Developed by Codex Infotech</Text>
        </Animated.View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  blob: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrap: {
    width: 80,
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    color: "#1C1C1E",
    fontSize: 16,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  toggleLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    color: "#8E8E93",
    fontWeight: "600",
  },
});
