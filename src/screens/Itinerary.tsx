import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Chip, Icon, IconButton, Notice, Photo } from '../components/UI';
import { Trip, formatDate } from '../data/trips';
import { colors, ui } from '../theme';
export function Itinerary({ trip, close, remove }: { trip: Trip; close: () => void; remove: () => void }) {
  const [day, setDay] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const activities = trip.days[day] || [];
  const date = new Date(trip.start + 'T12:00:00'); date.setDate(date.getDate() + day);
  return <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
    <Photo uri={trip.photo} style={{ height: 265, borderRadius: 0 }}><View style={{ flex: 1, padding: 22, justifyContent: 'space-between', backgroundColor: '#19152638' }}><View style={ui.between}><IconButton name="arrow-back" label="Back to trips" onPress={close} /><View style={{ backgroundColor: 'white', padding: 9, borderRadius: 10 }}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{trip.demo ? 'SAMPLE ITINERARY' : 'TRIP PREVIEW'}</Text></View></View><View style={{ gap: 7, backgroundColor: '#1915269C', padding: 14, borderRadius: 18 }}><Text style={[ui.title, { color: 'white' }]}>{trip.destination} escape</Text><Text style={{ color: 'white', fontSize: 13 }}>{formatDate(trip.start)} – {formatDate(trip.end)}</Text><Text style={{ color: 'white', fontSize: 13 }}>{trip.travelers} travelers · {trip.budget}</Text></View></View></Photo>
    <View style={ui.page}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{trip.days.map((_, i) => <Chip key={i} label={`Day ${i + 1}`} selected={day === i} onPress={() => { setDay(i); setExpanded(null); }} />)}</ScrollView>
    <View style={ui.between}><Text style={ui.heading}>Your daily route</Text><Text style={{ color: colors.primary, fontSize: 12 }}>ILLUSTRATION</Text></View>
    <View accessibilityLabel="Decorative route illustration, not a live map" style={{ height: 180, borderRadius: 22, overflow: 'hidden', backgroundColor: '#EEECE5', borderWidth: 1, borderColor: colors.line }}>
      {[15, 55, 100, 145].map((top, i) => <View key={i} style={{ position: 'absolute', top, left: -20, right: -20, height: 12, backgroundColor: 'white', transform: [{ rotate: i % 2 ? '-15deg' : '12deg' }] }} />)}
      <View style={{ position: 'absolute', width: 60, height: 240, left: '66%', top: -30, backgroundColor: '#BCDDEB', transform: [{ rotate: '24deg' }] }} />
      <View style={{ position: 'absolute', width: 70, height: 60, left: 15, top: 15, borderRadius: 20, backgroundColor: '#D4E4CE' }} />
      <View style={{ position: 'absolute', width: '48%', borderTopWidth: 3, borderColor: colors.primary, borderStyle: 'dashed', top: 95, left: '23%', transform: [{ rotate: '-20deg' }] }} />
      {[{ left: '22%', top: 108 }, { left: '45%', top: 67 }, { left: '69%', top: 39 }].map((p, i) => <View key={i} style={{ position: 'absolute', left: p.left as `${number}%`, top: p.top, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>{i + 1}</Text></View>)}
    </View>
    <Text style={ui.heading}>Day {day + 1} · {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
    {activities.map((a, i) => <Pressable key={`${day}-${i}`} accessibilityRole="button" accessibilityState={{ expanded: expanded === i }} onPress={() => setExpanded(expanded === i ? null : i)} style={[ui.card, { gap: 12 }]}><View style={ui.row}><View style={{ paddingVertical: 8, paddingHorizontal: 9, backgroundColor: colors.pale, borderRadius: 10 }}><Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>{a.time}</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={[ui.text, { fontWeight: '700' }]}>{a.title}</Text><Text style={ui.muted}>{expanded === i ? a.detail : 'Tap to see the plan'}</Text></View><Icon name={a.icon} color={colors.primary} /></View>{expanded === i && <Text style={ui.muted}>Sample activity for this UI preview. Times, availability and bookings have not been checked.</Text>}</Pressable>)}
    {!activities.length && <View style={[ui.card, { alignItems: 'center', paddingVertical: 30 }]}><Icon name="calendar-outline" size={35} color={colors.primary} /><Text style={ui.heading}>A day full of possibilities</Text><Text style={[ui.muted, { textAlign: 'center' }]}>Your trip preferences are saved in this session. AI activities will be connected in a later stage.</Text></View>}
    {trip.demo && <Notice>Sample activities for this frontend preview. Map, weather and PDF services are not connected.</Notice>}
    <View style={ui.card}><Text style={ui.heading}>Your travel style</Text><Text style={ui.text}>{trip.interests.join(' · ') || 'Open to everything'}</Text>{!!trip.notes && <Text style={ui.muted}>{trip.notes}</Text>}</View>
    <Button secondary label="Remove preview trip" icon="trash-outline" onPress={() => Alert.alert('Remove this trip?', 'This only removes the preview from this session.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: remove }])} />
    </View>
  </ScrollView>;
}
