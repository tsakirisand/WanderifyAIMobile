import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Icon, Notice } from '../components/UI';
import { colors, ui } from '../theme';
export function Profile({ name, setName, tripCount, reset }: { name: string; setName: (name: string) => void; tripCount: number; reset: () => void }) {
  const [draft, setDraft] = useState(name);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setDraft(name); }, [name]);
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.page}><Text style={ui.title}>Your little corner</Text><View style={[ui.card, { alignItems: 'center', paddingVertical: 28 }]}><View style={{ width: 80, height: 80, borderRadius: 28, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 32, fontWeight: '800', color: colors.primary }}>{name.slice(0, 1).toUpperCase()}</Text></View><Text style={ui.heading}>{name}</Text><Text style={ui.muted}>Curious mind. World explorer.</Text><View style={ui.row}><Icon name="briefcase-outline" color={colors.primary} /><Text style={ui.text}>{tripCount} preview trips</Text></View></View><View style={ui.card}><Text style={ui.heading}>Make yourself at home</Text><Text style={ui.label}>Display name</Text><TextInput accessibilityLabel="Display name" value={draft} onChangeText={v => { setDraft(v); setSaved(false); }} maxLength={40} style={ui.input} /><Button label={saved ? 'Name updated' : 'Update display name'} disabled={!draft.trim()} onPress={() => { setName(draft.trim()); setSaved(true); }} /></View><Notice>Demo profile · no account, authentication or personal data is sent to a server. Changes reset when the app restarts.</Notice><Button secondary label="Reset demo trips" icon="refresh-outline" onPress={reset} /><Text style={[ui.muted, { textAlign: 'center' }]}>Wanderify · Frontend preview 1.0</Text></ScrollView>;
}
