import { Tabs } from "expo-router";
import { Text } from "react-native";

const C = {
  background: "#090A0D",
  surface: "#121419",
  border: "#252832",
  muted: "#858B98",
  red: "#F04444",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.red,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          height: 66,
          paddingTop: 8,
          paddingBottom: 9,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 19 }}>⌂</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Security",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 19 }}>◈</Text>
          ),
        }}
      />
    </Tabs>
  );
}
