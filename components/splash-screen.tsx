import React, { useEffect } from "react";
import { View, Text, Dimensions, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedProps,
  withDelay,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, {
  Path,
  Defs,
  ClipPath,
  Text as SvgText,
  G,
  Use,
} from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);
const AnimatedG = Animated.createAnimatedComponent(G);

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  
  // Animation state
  const time = useSharedValue(0);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const displayProgress = useSharedValue(0);

  // SVG dimensions
  const SVG_WIDTH = 1340;
  const SVG_HEIGHT = 300;
  const TEXT_X = 670;
  const TEXT_Y = 150;
  
  // Bounding box approximation for "CXBulk" at fontSize 220
  // In the HTML it's roughly center-aligned.
  const BBOX = {
    x: 200, 
    y: 50,
    width: 940,
    height: 200,
  };
  const Y_BASE = BBOX.y + BBOX.height + 30;

  // Keyframes from HTML (extended to 8s)
  const keyframes = [
    { t: 0, v: 0 },
    { t: 1.0, v: 0.13 },
    { t: 2.0, v: 0.29 },
    { t: 3.5, v: 0.46 },
    { t: 5.0, v: 0.62 },
    { t: 6.5, v: 0.79 },
    { t: 7.5, v: 0.96 },
    { t: 8.0, v: 1.0 },
  ];

  const ease = (u: number) => {
    "worklet";
    return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  };

  const getProgressVal = (t: number) => {
    "worklet";
    if (t <= 0) return 0;
    if (t >= 8.0) return 1;
    for (let i = 0; i < keyframes.length - 1; i++) {
      const k0 = keyframes[i];
      const k1 = keyframes[i + 1];
      if (t >= k0.t && t <= k1.t) {
        const u = (t - k0.t) / (k1.t - k0.t);
        return k0.v + (k1.v - k0.v) * ease(u);
      }
    }
    return 1;
  };

  const animatedProps = useAnimatedProps(() => {
    const p = getProgressVal(time.value);
    displayProgress.value = Math.round(p * 100);
    
    const fillY = BBOX.y + BBOX.height * (1 - p);
    const drift = time.value * 30; // Even slower drift for 8s
    const amp = 12; // Even lower amplitude for calm 8s waves
    const waveLen = 500;
    const xStart = BBOX.x - 120;
    const xEnd = BBOX.x + BBOX.width + 120;
    const step = 6;
    
    let d = `M ${xStart} ${Y_BASE} L ${xStart} ${fillY}`;
    for (let x = xStart; x <= xEnd; x += step) {
      const y = fillY + Math.sin((x + drift) * Math.PI * 2 / waveLen) * amp;
      d += ` L ${x} ${y}`;
    }
    d += ` L ${xEnd} ${Y_BASE} Z`;
    
    return { d };
  });

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedCounterProps = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    // Start the time animation (now 8 seconds)
    time.value = withTiming(8.0, {
      duration: 8000,
      easing: Easing.bezier(0.42, 0, 0.58, 1),
    }, (finished) => {
      if (finished) {
        // Deliberate exit sequence
        scale.value = withTiming(1.25, {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        });
        
        opacity.value = withDelay(600, withTiming(0, {
          duration: 800,
          easing: Easing.inOut(Easing.cubic),
        }, (done) => {
          if (done) {
            runOnJS(onComplete!)();
          }
        }));
      }
    });

    return () => {
      cancelAnimation(time);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  // Use a state for the counter text since we need to display it as a string
  // but Reanimated 3+ can update text via useAnimatedProps if we use a special Text component
  // For simplicity and compatibility, we use a small hack or just a Reanimated value display
  const [percent, setPercent] = React.useState(0);
  
  // We'll update the percent state periodically from a worklet if needed, 
  // but let's try to keep it mostly in the UI thread for "high quality".
  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(Math.floor(displayProgress.value));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.stage, { 
        width: 1920, 
        height: 1080,
        transform: [
          { scale: Math.min(windowWidth / 1920, windowHeight / 1080) }
        ]
      }]}>
        <Animated.View style={[styles.logo, animatedLogoStyle]}>
          <View style={styles.logoInner}>
            <Svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              style={styles.svg}
            >
              <Defs>
                <ClipPath id="textClip">
                  <SvgText
                    x={TEXT_X}
                    y={TEXT_Y}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontSize="220"
                    fontWeight="900"
                    letterSpacing="-1.5"
                    fontFamily="Inter_900Black"
                  >
                    CXBulk
                  </SvgText>
                </ClipPath>
              </Defs>
              
              {/* Background text */}
              <SvgText
                x={TEXT_X}
                y={TEXT_Y}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize="220"
                fontWeight="900"
                letterSpacing="-1.5"
                fill="#262626"
                fontFamily="Inter_900Black"
              >
                CXBulk
              </SvgText>
              
              {/* Filled text via ClipPath */}
              <G clipPath="url(#textClip)">
                <AnimatedPath
                    animatedProps={animatedProps}
                    fill="#FFFFFF"
                />
              </G>
            </Svg>
            
            <Animated.Text style={[styles.counter, animatedCounterProps]}>
              loading... {percent} %
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
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  stage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -540,
    marginLeft: -960,
    backgroundColor: "#000000",
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
    bottom: 0, 
    right: 200, 
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontSize: 12,
    fontWeight: "400",
    color: "#FFFFFF",
    opacity: 0.8,
  },
});

