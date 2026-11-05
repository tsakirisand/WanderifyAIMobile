import React from "react";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = [
    { label: "Home", route: "/(tabs)", icon: "home-outline" as const, activeIcon: "home" as const, active: pathname === "/" || pathname === "/(tabs)" },
    { label: "My Trips", route: "/trips", icon: "calendar-outline" as const, activeIcon: "calendar" as const, active: pathname.startsWith("/trips") },
    { label: "Profile", route: "/profile", icon: "person-outline" as const, activeIcon: "person" as const, active: pathname.startsWith("/profile") },
  ];
  return <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 7) }]}>
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: items[0].active }} onPress={() => router.replace("/(tabs)")} style={s.item}><Ionicons name={items[0].active ? items[0].activeIcon : items[0].icon} size={22} color={items[0].active ? colors.primary : colors.muted} /><Text style={[s.label, items[0].active && s.active]}>{items[0].label}</Text></Pressable>
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: items[1].active }} onPress={() => router.replace("/trips")} style={s.item}><Ionicons name={items[1].active ? items[1].activeIcon : items[1].icon} size={22} color={items[1].active ? colors.primary : colors.muted} /><Text style={[s.label, items[1].active && s.active]}>{items[1].label}</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Plan a new trip" onPress={() => router.push("/plan")} style={({ pressed }) => [s.plus, pressed && { opacity: 0.8 }]}><Ionicons name="add" size={29} color="white" /></Pressable>
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: items[2].active }} onPress={() => router.replace("/profile")} style={s.item}><Ionicons name={items[2].active ? items[2].activeIcon : items[2].icon} size={22} color={items[2].active ? colors.primary : colors.muted} /><Text style={[s.label, items[2].active && s.active]}>{items[2].label}</Text></Pressable>
  </View>;
}

export default function TabLayout() {
  return <Tabs tabBar={() => <BottomNavigation />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
    <Tabs.Screen name="trips" options={{ title: "My Trips" }} />
    <Tabs.Screen name="profile" options={{ title: "Profile" }} />
  </Tabs>;
}

const s = StyleSheet.create({ bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 10, paddingTop: 8, backgroundColor: "white", borderTopWidth: 1, borderColor: colors.line }, item: { minWidth: 63, height: 54, alignItems: "center", justifyContent: "center", gap: 3 }, label: { color: colors.muted, fontSize: 10, fontWeight: "600" }, active: { color: colors.primary, fontWeight: "800" }, plus: { width: 53, height: 53, borderRadius: 19, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginHorizontal: 8, marginTop: -10 } });
