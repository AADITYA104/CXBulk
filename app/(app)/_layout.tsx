import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { BlurView } from "expo-blur";
import { useAuth } from "../../context/auth";


const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext<any, typeof Navigator, any, any>(
  Navigator
);

function GlassTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const { user } = useAuth();

  
  // Filter out 'gateway' if user is not superadmin
  const visibleRoutes = state.routes.filter(route => {
    if (route.name === "gateway" && user?.role !== "superadmin") return false;
    return true;
  });

  return (
    <View style={{ position: "absolute", bottom: 24, left: 24, right: 24, zIndex: 100 }}>
      {/* Container with shadow */}
      <View style={{
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        borderRadius: 40,
        overflow: "hidden"
      }}>
        <BlurView 
          intensity={90} 
          tint="light"
          style={{
            flexDirection: "row",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            paddingHorizontal: 8,
            paddingVertical: 8,
            borderRadius: 40,
            justifyContent: "space-between",
          }}
        >
          {visibleRoutes.map((route, index) => {
            const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);


            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName: any = "home";
            if (route.name === "dashboard") iconName = isFocused ? "grid" : "grid-outline";
            if (route.name === "campaign") iconName = isFocused ? "paper-plane" : "paper-plane-outline";
            if (route.name === "contacts") iconName = isFocused ? "people" : "people-outline";
            if (route.name === "gateway") iconName = isFocused ? "radio" : "radio-outline";
            if (route.name === "settings") iconName = isFocused ? "settings" : "settings-outline";

            return (
              <Pressable
                key={index}
                onPress={onPress}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: isFocused ? "#2D3436" : "transparent",
                }}
              >
                <Ionicons 
                  name={iconName} 
                  size={24} 
                  color={isFocused ? "#ffffff" : "#a1a1aa"} 
                />
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

export default function AppLayout() {
  const { user } = useAuth();
  
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      tabBar={(props: MaterialTopTabBarProps) => <GlassTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
      }}
    >
      <MaterialTopTabs.Screen name="dashboard" />
      <MaterialTopTabs.Screen name="campaign" />
      <MaterialTopTabs.Screen name="contacts" />
      {user?.role === "superadmin" && (
        <MaterialTopTabs.Screen name="gateway" />
      )}
      <MaterialTopTabs.Screen name="settings" />
    </MaterialTopTabs>
  );
}
