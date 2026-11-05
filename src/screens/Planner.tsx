import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Chip, IconButton, Notice } from '../components/UI';
import { destinations, isValidDate, Trip } from '../data/trips';
import { colors, ui } from '../theme';
export function Planner({ destination: initialDestination, close, save }: { destination: string; close: () => void; save: (trip: Trip) => void }) {
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState(initialDestination);
  const [start, setStart] = useState('2027-05-12');
  const [end, setEnd] = useState('2027-05-14');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState('Comfort');
  const [interests, setInterests] = useState(['Food', 'Culture']);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  function next() {
    if (!destination.trim()) { setError('Please enter a destination.'); return; }
    if (!isValidDate(start) || !isValidDate(end)) { setError('Use valid dates in YYYY-MM-DD format.'); return; }
    if (end < start) { setError('Your end date must be after your start date.'); return; }
    if (end === start) { setError('Choose at least one night away.'); return; }
    const dayCount = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
    if (dayCount > 30) { setError('Choose a trip of up to 30 days for this preview.'); return; }
    setError('');
    if (step < 2) { setStep(step + 1); return; }
    const place = destinations.find(d => d.name.toLowerCase() === destination.trim().toLowerCase());
    save({ id: `preview-${Date.now()}`, destination: destination.trim(), country: place?.country || 'Custom destination', start, end, travelers, budget, interests, notes: notes.trim(), photo: place?.photo || '', demo: false, days: Array.from({ length: dayCount }, () => []) });
  }
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.page}>
    <View style={ui.between}><IconButton name="arrow-back" label={step ? 'Previous step' : 'Close planner'} onPress={() => step ? setStep(step - 1) : close()} /><Text style={ui.heading}>Plan your trip</Text><Text style={{ color: colors.primary, fontWeight: '700' }}>{step + 1} of 3</Text></View>
    <View style={ui.row}>{[0, 1, 2].map(i => <View key={i} style={{ flex: 1, height: 5, borderRadius: 4, backgroundColor: i <= step ? colors.primary : colors.line }} />)}</View>
    <View style={{ gap: 7 }}><Text style={ui.title}>{['Start with the basics', 'Make it yours', 'Ready for adventure?'][step]}</Text><Text style={ui.muted}>{['Where are you headed, and who’s coming along?', 'Choose the things that make a trip feel like you.', 'Review your choices and save a local preview trip.'][step]}</Text></View>
    {step === 0 && <>
      <View><Text style={ui.label}>Destination</Text><TextInput style={ui.input} accessibilityLabel="Destination" value={destination} onChangeText={setDestination} placeholder="City or country" maxLength={80} /></View>
      <View><Text style={ui.label}>Start date · YYYY-MM-DD</Text><TextInput style={ui.input} accessibilityLabel="Start date" value={start} onChangeText={setStart} placeholder="2027-05-12" maxLength={10} autoCapitalize="none" returnKeyType="next" /></View>
      <View><Text style={ui.label}>End date · YYYY-MM-DD</Text><TextInput style={ui.input} accessibilityLabel="End date" value={end} onChangeText={setEnd} placeholder="2027-05-14" maxLength={10} autoCapitalize="none" returnKeyType="done" /></View>
      <View style={ui.card}><Text style={ui.label}>Travelers</Text><View style={ui.between}><Text style={ui.text}>{travelers} {travelers === 1 ? 'traveler' : 'travelers'}</Text><View style={ui.row}><IconButton label="Remove traveler" name="remove" onPress={() => setTravelers(Math.max(1, travelers - 1))} /><IconButton label="Add traveler" name="add" onPress={() => setTravelers(Math.min(12, travelers + 1))} /></View></View></View>
    </>}
    {step === 1 && <><View style={{ gap: 10 }}><Text style={ui.label}>Your travel style</Text><View style={[ui.row, { flexWrap: 'wrap' }]}>{['Budget', 'Comfort', 'Luxury'].map(b => <Chip key={b} label={b} selected={budget === b} onPress={() => setBudget(b)} />)}</View></View><View style={{ gap: 10 }}><Text style={ui.label}>What do you love?</Text><View style={[ui.row, { flexWrap: 'wrap' }]}>{['Food', 'Culture', 'Nature', 'Art', 'Shopping', 'Nightlife', 'Adventure', 'Relaxation'].map(i => <Chip key={i} label={i} selected={interests.includes(i)} onPress={() => setInterests(interests.includes(i) ? interests.filter(v => v !== i) : [...interests, i])} />)}</View></View></>}
    {step === 2 && <><View style={ui.card}><Text style={ui.title}>{destination}</Text><Text style={ui.text}>{start} → {end}</Text><Text style={ui.muted}>{travelers} travelers · {budget}</Text><Text style={ui.text}>{interests.join(' · ') || 'Open to everything'}</Text>{!!notes && <Text style={ui.muted}>{notes}</Text>}</View><View><Text style={ui.label}>Notes</Text><TextInput accessibilityLabel="Trip notes" multiline maxLength={500} value={notes} onChangeText={setNotes} placeholder="Slow mornings, vegetarian food, hidden gems…" textAlignVertical="top" style={[ui.input, { minHeight: 135 }]} /></View><Notice>This saves your choices only. Activities stay empty until a future AI integration.</Notice></>}
    {!!error && <Text accessibilityRole="alert" style={{ color: '#B42318' }}>{error}</Text>}
    <Button label={step === 2 ? 'Save preview trip' : 'Continue'} icon={step === 2 ? 'checkmark' : 'arrow-forward'} onPress={next} />
  </ScrollView></KeyboardAvoidingView>;
}
