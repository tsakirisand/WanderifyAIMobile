import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, ui } from "../theme";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export function Icon({ name, color = colors.ink, size = 22 }: { name: IconName; color?: string; size?: number }) {
  return <Ionicons name={name} color={color} size={size} />;
}

export function Screen({ children, scroll = true, style }: React.PropsWithChildren<{ scroll?: boolean; style?: StyleProp<ViewStyle> }>) {
  return <SafeAreaView edges={["top", "left", "right"]} style={s.safe}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[ui.page, style]}>{children}</ScrollView> : <View style={[s.fill, style]}>{children}</View>}
  </SafeAreaView>;
}

export function Card({ children, style }: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[ui.card, style]}>{children}</View>;
}

export function AppButton({ label, onPress, icon, secondary, disabled, loading, accessibilityLabel }: { label: string; onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean; loading?: boolean; accessibilityLabel?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel || label} accessibilityState={{ disabled: !!disabled, busy: !!loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [s.button, secondary ? s.secondary : s.primary, (disabled || loading) && s.disabled, pressed && !disabled && !loading && s.pressed]}>
    {loading ? <ActivityIndicator color={secondary ? colors.primary : "white"} /> : icon ? <Icon name={icon} color={secondary ? colors.primary : "white"} /> : null}
    <Text style={[s.buttonText, { color: secondary ? colors.primary : "white" }]}>{label}</Text>
  </Pressable>;
}

export function IconButton({ label, icon, onPress, danger = false }: { label: string; icon: IconName; onPress: () => void; danger?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.iconButton, pressed && s.pressed]}><Icon name={icon} color={danger ? colors.danger : colors.ink} /></Pressable>;
}

export function Input({ label, error, multiline, style, ...props }: TextInputProps & { label?: string; error?: string }) {
  return <View style={{ gap: 7 }}>
    {label ? <Text style={ui.label}>{label}</Text> : null}
    <TextInput {...props} multiline={multiline} placeholderTextColor={colors.muted} accessibilityLabel={props.accessibilityLabel || label} style={[ui.input, multiline && s.multiline, style]} />
    {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
  </View>;
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: IconName }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [s.chip, selected && s.chipSelected, pressed && s.pressed]}>
    {icon ? <Icon name={icon} color={selected ? colors.primary : colors.muted} size={17} /> : null}
    <Text style={{ color: selected ? colors.primary : colors.muted, fontWeight: "700", fontSize: 13 }}>{label}</Text>
  </Pressable>;
}

export function Photo({ uri, style, children, label }: React.PropsWithChildren<{ uri?: string | null; style?: ViewStyle; label?: string }>) {
  const [failed, setFailed] = useState(!uri);
  return <View style={[s.photo, style]} accessibilityLabel={label}>
    {!!uri && !failed ? <Image source={{ uri }} onError={() => setFailed(true)} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <View style={s.photoFallback}><Icon name="earth-outline" color={colors.primary} size={35} /><Text style={s.fallbackText}>Your next escape</Text></View>}
    {children}
  </View>;
}

export function ScreenTitle({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return <View style={{ gap: 6 }}>
    {eyebrow ? <Text style={s.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
    <Text style={ui.title}>{title}</Text>
    {subtitle ? <Text style={ui.muted}>{subtitle}</Text> : null}
  </View>;
}

export function Notice({ children, icon = "information-circle-outline" }: React.PropsWithChildren<{ icon?: IconName }>) {
  return <View style={s.notice}><Icon name={icon} color={colors.primary} size={19} /><Text style={[ui.muted, { flex: 1, color: colors.ink }]}>{children}</Text></View>;
}

export function FormFeedback({ children, tone = "info" }: React.PropsWithChildren<{ tone?: "info" | "error" | "success" }>) {
  const color = tone === "error" ? colors.danger : tone === "success" ? colors.success : colors.primary;
  const background = tone === "error" ? "#FEF3F2" : tone === "success" ? "#ECFDF3" : colors.pale;
  return <View accessibilityRole={tone === "error" ? "alert" : undefined} accessibilityLiveRegion={tone === "error" ? "assertive" : "polite"} style={{ backgroundColor: background, borderRadius: 14, borderWidth: 1, borderColor: `${color}30`, padding: 13 }}>
    <Text style={{ color, fontSize: 14, lineHeight: 21, fontWeight: "600" }}>{children}</Text>
  </View>;
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={ui.muted}>{label}</Text></View>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <View style={s.empty}><View style={s.emptyIcon}><Icon name="airplane-outline" color={colors.primary} size={30} /></View><Text style={ui.heading}>{title}</Text><Text style={[ui.muted, { textAlign: "center" }]}>{body}</Text>{action}</View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, fill: { flex: 1 },
  button: { borderRadius: 16, minHeight: 54, paddingHorizontal: 17, flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.primary }, secondary: { backgroundColor: colors.pale, borderWidth: 1, borderColor: "#E4D7FF" },
  buttonText: { fontSize: 15, fontWeight: "800" }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.72 },
  iconButton: { width: 46, height: 46, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: "white", alignItems: "center", justifyContent: "center" },
  multiline: { minHeight: 112, textAlignVertical: "top" }, error: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  chip: { minHeight: 44, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  chipSelected: { backgroundColor: colors.pale, borderColor: colors.primary },
  photo: { backgroundColor: colors.pale, overflow: "hidden", borderRadius: 20 }, photoFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }, fallbackText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  eyebrow: { fontSize: 11, color: colors.primary, letterSpacing: 1.4, fontWeight: "800" },
  notice: { backgroundColor: colors.pale, borderRadius: 15, padding: 13, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  empty: { alignItems: "center", padding: 25, gap: 12, backgroundColor: "white", borderRadius: 22, borderWidth: 1, borderColor: colors.line },
  emptyIcon: { width: 60, height: 60, borderRadius: 22, backgroundColor: colors.pale, alignItems: "center", justifyContent: "center" },
});
