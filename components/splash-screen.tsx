import React, { useEffect } from "react";
import { View, Dimensions, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
  useAnimatedProps,
  withDelay,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, {
  Path,
  Text as SvgText,
  Defs,
  ClipPath,
} from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  
  const progress = useSharedValue(0);
  const drift = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const SVG_WIDTH = 1340;
  const SVG_HEIGHT = 300;
  
  const createWavePath = (p: number, driftVal: number, phaseOffset: number, amplitude: number) => {
    "worklet";
    const startY = 320;
    const endY = -50;
    const fillY = startY - p * (startY - endY);
    
    const waveLen = 400;
    const xStart = -50;
    const xEnd = 1400;
    const step = 20;
    
    let d = `M ${xStart} ${startY} L ${xStart} ${fillY}`;
    for (let x = xStart; x <= xEnd; x += step) {
      const y = fillY + Math.sin((x + driftVal + phaseOffset) * Math.PI * 2 / waveLen) * amplitude;
      d += ` L ${x} ${y}`;
    }
    d += ` L ${xEnd} ${startY} Z`;
    return d;
  };

  const animatedProps1 = useAnimatedProps(() => {
    return { d: createWavePath(progress.value, drift.value, 0, Math.max(5, 35 * (1 - progress.value))) };
  });

  const animatedProps2 = useAnimatedProps(() => {
    return { d: createWavePath(progress.value, drift.value * 1.2, 50, Math.max(5, 55 * (1 - progress.value))) };
  });

  useEffect(() => {
    // Infinite wave translation
    drift.value = withRepeat(withTiming(1500, { duration: 6000, easing: Easing.linear }), -1, false);

    // Fill progress
    progress.value = withTiming(1, {
      duration: 5500,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        // Zoom-through cinematic exit
        scale.value = withTiming(25, {
          duration: 700,
          easing: Easing.in(Easing.cubic),
        });
        
        opacity.value = withDelay(150, withTiming(0, {
          duration: 500,
          easing: Easing.out(Easing.quad),
        }, (done) => {
          if (done && onComplete) {
            runOnJS(onComplete)();
          }
        }));
      }
    });

    return () => {
      cancelAnimation(progress);
      cancelAnimation(drift);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedCounterStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const [percent, setPercent] = React.useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const displayVal = Math.min(100, Math.max(0, Math.round(progress.value * 100)));
      setPercent(displayVal);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.stage, { 
        width: 1920, 
        height: 1080,
        transform: [
          { scale: Math.min((windowWidth || 375) / 1920, (windowHeight || 812) / 1080) }
        ]
      }]}>
        <Animated.View style={[styles.logo, animatedLogoStyle]}>
          <View style={styles.logoInner}>
            <Svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={styles.svg}>
               <Defs>
                 {/* Text acts as the mask for the animated waves */}
                 <ClipPath id="textMask">
                   <SvgText x="50%" y="50%" textAnchor="middle" alignmentBaseline="middle" fontFamily={Platform.OS === "ios" ? "System" : "sans-serif"} fontSize="240" fontWeight="900">
                     CXBULK
                   </SvgText>
                 </ClipPath>
               </Defs>
               
               {/* Background text — light muted tone on the light background */}
               <SvgText x="50%" y="50%" textAnchor="middle" alignmentBaseline="middle" fontFamily={Platform.OS === "ios" ? "System" : "sans-serif"} fontSize="240" fontWeight="900" fill="#D1D1D6">
                 CXBULK
               </SvgText>

               {/* Back Wave (light blue) clipped inside the text */}
               <AnimatedPath animatedProps={animatedProps2} fill="#5AC8FA" clipPath="url(#textMask)" />

               {/* Front Wave (primary blue) clipped inside the text */}
               <AnimatedPath animatedProps={animatedProps1} fill="#007AFF" clipPath="url(#textMask)" />
            </Svg>

            <Animated.Text style={[styles.counter, animatedCounterStyle]}>
              LOADING.. {percent}%
            </Animated.Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    overflow: "hidden",
  },
  stage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -540,
    marginLeft: -960,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 1340,
    height: 500,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 1340,
    height: 300,
    position: "relative",
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  counter: {
    position: "absolute",
    bottom: -60, 
    right: 220, 
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    opacity: 0.9,
    letterSpacing: 4,
  },
});
