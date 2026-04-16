import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { StatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  withSpring,
  Easing,
} from "react-native-reanimated";
import {
  useFonts,
  SpaceGrotesk_700Bold,
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
} from "@expo-google-fonts/space-grotesk";
import { router } from "expo-router";
import { useAuth } from "../context/auth";

const { width } = Dimensions.get("window");

/* ─── Color palette matching the app's blue theme ─────────────────────── */
const COLORS = {
  bg:       "#080D1A",   // deep navy-black
  bgGlow:   "#0A1628",   // slightly lighter navy for glow
  primary:  "#007AFF",   // iOS blue — matches app accent
  accent:   "#5AC8FA",   // light blue complement
  text:     "#FFFFFF",
  muted:    "rgba(255,255,255,0.22)",
  submuted: "rgba(255,255,255,0.12)",
};

/* ─── Each letter animates independently (anime.stagger principle) ──────── */
const LETTERS = ["C", "X", "B", "u", "l", "k"];
const STAGGER_MS = 90; // offset between each letter — organic rhythm

function AnimatedLetter({
  char,
  delayMs,
  isHighlight,
}: {
  char: string;
  delayMs: number;
  isHighlight: boolean;
}) {
  const y   = useSharedValue(48);
  const op  = useSharedValue(0);
  const scl = useSharedValue(0.7);

  useEffect(() => {
    // Spring physics — feels natural, like studio-grade motion
    y.value   = withDelay(delayMs, withSpring(0, { damping: 18, stiffness: 90, mass: 0.9 }));
    scl.value = withDelay(delayMs, withSpring(1, { damping: 16, stiffness: 80,  mass: 0.8 }));
    op.value  = withDelay(delayMs, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity:   op.value,
    transform: [{ translateY: y.value }, { scale: scl.value }],
  }));

  return (
    <Animated.Text style={[ls.letter, isHighlight && ls.letterHighlight, style]}>
      {char}
    </Animated.Text>
  );
}

/* ─── Animated glow orb beneath the name ───────────────────────────────── */
function GlowOrb() {
  const opacity = useSharedValue(0);
  const scl     = useSharedValue(0.6);

  useEffect(() => {
    // Delayed entrance then breathe loop
    opacity.value = withDelay(800,  withTiming(1,    { duration: 1200, easing: Easing.out(Easing.cubic) }));
    scl.value     = withDelay(800,  withTiming(1,    { duration: 1200, easing: Easing.out(Easing.cubic) }));

    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2200, easing: Easing.inOut(Easing.sine) }),
          withTiming(1.0, { duration: 2200, easing: Easing.inOut(Easing.sine) }),
        ),
        -1,
        true
      );
    }, 2000);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scl.value }],
  }));

  return <Animated.View style={[gs.glow, style]} pointerEvents="none" />;
}

/* ─── Animated underline that draws left → right ───────────────────────── */
function UnderlineBar() {
  const w  = useSharedValue(0);
  const op = useSharedValue(0);

  useEffect(() => {
    const totalLetterDuration = 700 + LETTERS.length * STAGGER_MS;
    w.value  = withDelay(totalLetterDuration, withTiming(72, { duration: 700, easing: Easing.out(Easing.cubic) }));
    op.value = withDelay(totalLetterDuration, withTiming(1,  { duration: 400 }));
  }, []);

  const style = useAnimatedStyle(() => ({ width: w.value, opacity: op.value }));
  return <Animated.View style={[gs.underline, style]} />;
}

/* ─── Main screen ───────────────────────────────────────────────────────── */
export default function SplashScreen() {
  const { user, isLoading } = useAuth();
  const [fontsLoaded] = useFonts({ SpaceGrotesk_700Bold, SpaceGrotesk_300Light, SpaceGrotesk_400Regular });

  const taglineOp = useSharedValue(0);
  const taglineY  = useSharedValue(12);
  const creditOp  = useSharedValue(0);

  useEffect(() => {
    const base = 700 + LETTERS.length * STAGGER_MS + 500; // after underline
    taglineOp.value = withDelay(base,       withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    taglineY.value  = withDelay(base,       withSpring(0, { damping: 20, stiffness: 80 }));
    creditOp.value  = withDelay(base + 380, withTiming(1, { duration: 700 }));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => {
        router.replace(user ? "/(app)/dashboard" : "/auth");
      }, 3400); // slower — let the animation breathe
      return () => clearTimeout(t);
    }
  }, [isLoading, user]);

  const taglineStyle = useAnimatedStyle(() => ({
    opacity:   taglineOp.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const creditStyle = useAnimatedStyle(() => ({ opacity: creditOp.value }));

  if (!fontsLoaded) return <View style={gs.root} />;

  return (
    <View style={gs.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Background: top-right blue glow orb */}
      <View style={gs.bgOrbTR} />
      {/* Bottom-left muted glow */}
      <View style={gs.bgOrbBL} />

      {/* Center stage */}
      <View style={gs.stage}>

        {/* Glow under name */}
        <GlowOrb />

        {/* Letter-by-letter name — anime.stagger equivalent */}
        <View style={gs.nameRow}>
          {LETTERS.map((char, i) => (
            <AnimatedLetter
              key={i}
              char={char}
              delayMs={700 + i * STAGGER_MS}   // stagger offset — 90ms per letter
              isHighlight={i < 2}              // "CX" gets the blue accent color
            />
          ))}
        </View>

        {/* Animated underline beneath CX */}
        <UnderlineBar />

        {/* Tagline */}
        <Animated.Text style={[gs.tagline, taglineStyle]}>
          Smart Hybrid Broadcast
        </Animated.Text>
      </View>

      {/* Bottom credit */}
      <Animated.View style={[gs.creditRow, creditStyle]}>
        <View style={gs.creditLine} />
        <Text style={gs.creditText}>Developed by CodeX Infotech</Text>
        <View style={gs.creditLine} />
      </Animated.View>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────── */
const gs = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  // Background orbs
  bgOrbTR: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: COLORS.primary,
    opacity: 0.10,
  },
  bgOrbBL: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.accent,
    opacity: 0.06,
  },

  stage: {
    alignItems: "flex-start",
    paddingHorizontal: 40,
    width: "100%",
  },

  // Glow orb that breathes under the name
  glow: {
    position: "absolute",
    top: -40,
    left: 30,
    width: 200,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    opacity: 0.18,
    // blur approximated by large borderRadius + opacity
  },

  // Letter row
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
    overflow: "hidden",
  },

  // Underline bar beneath "CX" (72px ≈ 2 letter widths)
  underline: {
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 22,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },

  // Tagline
  tagline: {
    fontFamily: "SpaceGrotesk_300Light",
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 3.0,
    textTransform: "uppercase",
  },

  // Credit row
  creditRow: {
    position: "absolute",
    bottom: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  creditLine: {
    width: 20,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.muted,
  },
  creditText: {
    fontFamily: "SpaceGrotesk_300Light",
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.5,
  },
});

/* ─── Letter styles ─────────────────────────────────────────────────────── */
const ls = StyleSheet.create({
  letter: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 64,
    color: COLORS.text,
    letterSpacing: -2,
    lineHeight: 70,
  },
  // "CX" letters get the blue app-theme accent color
  letterHighlight: {
    color: COLORS.primary,
    // subtle glow via text shadow not supported in RN, but accent color carries it
  },
});
