import { useEffect, useRef } from "react";
import { Animated, View, ViewStyle, DimensionValue } from "react-native";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#E5E5EA",
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCircle({ size = 48 }: { size?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#E5E5EA",
        opacity,
      }}
    />
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    }}>
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: index < rows - 1 ? 1 : 0,
            borderBottomColor: "#F2F2F7",
          }}
        >
          <SkeletonCircle size={48} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Skeleton width="60%" height={14} borderRadius={4} />
            <View style={{ height: 6 }} />
            <Skeleton width="40%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonBarChart() {
  const maxVal = Math.max(...[380, 620, 420, 890, 710, 530, 310]);
  
  return (
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    }}>
      <Skeleton width={120} height={16} borderRadius={4} />
      
      <View style={{ flexDirection: "row", marginTop: 24, height: 160 }}>
        <View style={{ justifyContent: "space-between", marginRight: 12 }}>
          <Skeleton width={30} height={12} borderRadius={4} />
          <Skeleton width={30} height={12} borderRadius={4} />
          <Skeleton width={30} height={12} borderRadius={4} />
        </View>
        
        <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around" }}>
          {[380, 620, 420, 890, 710, 530, 310].map((val, i) => {
            const ratio = val / maxVal;
            return (
              <View key={i} style={{ alignItems: "center", flex: 1 }}>
                <Skeleton
                  width={24}
                  height={Math.round(ratio * 120)}
                  borderRadius={8}
                />
              </View>
            );
          })}
        </View>
      </View>
      
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
          <Skeleton key={i} width={24} height={12} borderRadius={4} />
        ))}
      </View>
    </View>
  );
}

export function SkeletonStatCard({ width }: { width?: DimensionValue }) {
  return (
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 24,
      padding: 20,
      width: width,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Skeleton width={40} height={40} borderRadius={12} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="70%" height={12} borderRadius={4} />
        </View>
      </View>
      <Skeleton width="50%" height={28} borderRadius={4} />
    </View>
  );
}

export function SkeletonProfileCard() {
  return (
    <View style={{
      alignItems: "center",
      marginBottom: 32,
    }}>
      <SkeletonCircle size={88} />
      <View style={{ height: 16 }} />
      <Skeleton width={150} height={20} borderRadius={4} />
      <View style={{ height: 8 }} />
      <Skeleton width={120} height={14} borderRadius={4} />
    </View>
  );
}

export function SkeletonSettingsList() {
  return (
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 8,
    }}>
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 16,
            borderBottomWidth: item < 3 ? 1 : 0,
            borderBottomColor: "#F2F2F7",
          }}
        >
          <Skeleton width={32} height={32} borderRadius={8} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Skeleton width="60%" height={14} borderRadius={4} />
          </View>
          <Skeleton width={20} height={20} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}