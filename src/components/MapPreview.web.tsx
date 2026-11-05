import React from "react";
import { Text, View } from "react-native";
import { colors, ui } from "../theme";

type Point = { lat: number; lon: number };
type Props = { destination: string; points: Point[]; places: string[] };

// Keep the web route tree free of react-native-maps native modules.
export function MapPreview({ destination, points, places }: Props) {
  return (
    <View accessibilityLabel={`Static route preview for ${destination}`} style={{ minHeight: 160, borderRadius: 20, padding: 16, backgroundColor: colors.pale, borderWidth: 1, borderColor: colors.line, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={[ui.heading, { marginBottom: 0 }]}>Route preview</Text>
        <Text style={{ color: colors.muted, fontSize: 11 }}>Static preview · no live map</Text>
      </View>
      <View style={{ gap: 0 }}>
        {points.map((point, index) => (
          <View key={`${point.lat}-${point.lon}-${index}`} style={{ minHeight: 38, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 25, height: 25, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.primary }}>
              <Text style={{ color: "white", fontSize: 12, fontWeight: "800" }}>{index + 1}</Text>
            </View>
            <Text style={[ui.text, { fontWeight: "700" }]}>{places[index] || destination}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
