import React from "react";
import { View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { colors } from "../theme";

type Point = { lat: number; lon: number };
type Props = { destination: string; points: Point[]; places: string[] };

export function MapPreview({ destination, points, places }: Props) {
  const first = points[0];
  const region = {
    latitude: first.lat,
    longitude: first.lon,
    latitudeDelta: 0.07,
    longitudeDelta: 0.07,
  };
  return (
    <View style={{ height: 215, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: colors.line }}>
      <MapView style={{ flex: 1 }} initialRegion={region} accessibilityLabel={`Route preview map for ${destination}`}>
        <Polyline coordinates={points.map((point) => ({ latitude: point.lat, longitude: point.lon }))} strokeColor={colors.primary} strokeWidth={4} />
        {points.map((point, index) => (
          <Marker
            key={`${point.lat}-${point.lon}-${index}`}
            coordinate={{ latitude: point.lat, longitude: point.lon }}
            title={`${index + 1}. ${places[index] || destination}`}
            pinColor={colors.primary}
          />
        ))}
      </MapView>
    </View>
  );
}
