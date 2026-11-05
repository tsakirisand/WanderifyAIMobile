import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Icon, Photo, Notice } from '../components/UI';
import { destinations, formatDate, Trip } from '../data/trips';
import { colors, ui } from '../theme';
export function Home({ name, trips, plan, open }: { name: string; trips: Trip[]; plan: (destination?: string) => void; open: (trip: Trip) => void }) {
  const [search, setSearch] = useState('');
  const today = new Date(); today.setHours(0, 0, 0, 0); const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const upcoming = [...trips].filter(t => t.end >= todayKey).sort((a, b) => a.start.localeCompare(b.start))[0];
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.page}>
    <View style={ui.between}><View style={ui.row}><View style={{ padding: 10, backgroundColor: colors.primary, borderRadius: 14 }}><Icon name="navigate" color="white" /></View><Text style={ui.heading}>Wanderify</Text></View><Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>UI PREVIEW</Text></View>
    <View style={{ gap: 7 }}><Text style={ui.muted}>Hey, {name || 'traveler'} 👋</Text><Text style={[ui.title, { fontSize: 37 }]}>Where to next?</Text><Text style={ui.muted}>A little inspiration. A whole new adventure.</Text></View>
    <View style={[ui.row, ui.input]}><Icon name="search-outline" color={colors.muted} /><TextInput accessibilityLabel="Search destinations" placeholder="Try Rome, Kyoto, Paris…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} onSubmitEditing={() => { if (search.trim()) plan(search.trim()); }} returnKeyType="search" style={{ flex: 1, fontSize: 15, color: colors.ink }} /></View>
    <View style={{ gap: 14 }}><Text style={ui.heading}>Discover destinations</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>{destinations.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(d => <Pressable key={d.name} accessibilityRole="button" accessibilityLabel={`Plan a trip to ${d.name}`} onPress={() => plan(d.name)}><Photo uri={d.photo} style={{ width: 205, height: 247 }}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000018', padding: 16 }}><View style={{ backgroundColor: '#191526A6', padding: 10, borderRadius: 12 }}><Text style={{ color: 'white', fontSize: 25, fontWeight: '800' }}>{d.name}</Text><Text style={{ color: '#FFFFFFDC' }}>{d.country}</Text></View></View></Photo></Pressable>)}</ScrollView>{search.trim() && !destinations.some(d => d.name.toLowerCase().includes(search.toLowerCase())) && <Button secondary label={`Plan a trip to ${search.trim()}`} onPress={() => plan(search.trim())} />}</View>
    <View style={{ gap: 14 }}><Text style={ui.heading}>Your next escape</Text>{upcoming ? <Pressable accessibilityRole="button" onPress={() => open(upcoming)} style={[ui.card, ui.row]}><Photo uri={upcoming.photo} style={{ width: 78, height: 85 }} /><View style={{ flex: 1, gap: 4 }}><Text style={ui.heading}>{upcoming.destination}</Text><Text style={ui.muted}>{formatDate(upcoming.start)}</Text><Text style={ui.muted}>{upcoming.travelers} travelers · {upcoming.days.length} days</Text></View><Icon name="chevron-forward" size={18} /></Pressable> : <View style={ui.card}><Text style={ui.text}>Your next chapter starts here.</Text><Text style={ui.muted}>Create your first preview trip below.</Text></View>}</View>
    <Button label="Plan a trip" icon="add" onPress={() => plan()} />
    <Notice>Frontend preview · sample trips, no bookings or AI connected.</Notice>
  </ScrollView>;
}
