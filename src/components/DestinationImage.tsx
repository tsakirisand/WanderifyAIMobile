import React, { useEffect, useState } from "react";
import { Photo } from "./NativeUI";
import { useAuth } from "../state/AuthProvider";
import { apiRequest } from "../lib/api";
import type { ViewStyle } from "react-native";
import { destinations } from "../data/trips";

export function DestinationImage({ destination, uri, style, children }: React.PropsWithChildren<{ destination: string; uri?: string | null; style?: ViewStyle }>) {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string | null>(uri || destinations.find((item) => destination.toLowerCase().includes(item.name.toLowerCase()))?.photo || null);
  useEffect(() => {
    if (uri || !user || !destination) return;
    let active = true;
    apiRequest<{ photo: string | null }>(user, `/api/mobile/photos?destination=${encodeURIComponent(destination)}`)
      .then((result) => { if (active && result.photo) setPhoto(result.photo); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [destination, uri, user]);
  return <Photo uri={photo} style={style} label={`${destination} destination photo`}>{children}</Photo>;
}
