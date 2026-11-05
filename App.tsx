import React, { useState } from 'react';
import { Alert, BackHandler, Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Home } from './src/screens/Home';
import { Trips } from './src/screens/Trips';
import { Planner } from './src/screens/Planner';
import { Itinerary } from './src/screens/Itinerary';
import { Profile } from './src/screens/Profile';
import { Icon, IconName } from './src/components/UI';
import { initialTrips, Trip } from './src/data/trips';
import { colors } from './src/theme';
type Tab = 'Home' | 'My Trips' | 'Profile';
type Route = { screen: 'tabs' } | { screen: 'planner'; destination: string } | { screen: 'itinerary'; tripId: string };
export default function App() {
  const [tab, setTab] = useState<Tab>('Home');
  const [route, setRoute] = useState<Route>({ screen: 'tabs' });
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [name, setName] = useState('Andreas');
  const close = () => setRoute({ screen: 'tabs' });
  React.useEffect(() => { if (Platform.OS !== 'android') return; const sub = BackHandler.addEventListener('hardwareBackPress', () => { if (route.screen !== 'tabs') { close(); return true; } if (tab !== 'Home') { setTab('Home'); return true; } return false; }); return () => sub.remove(); }, [route, tab]);
  const plan = (destination = '') => setRoute({ screen: 'planner', destination });
  const open = (trip: Trip) => setRoute({ screen: 'itinerary', tripId: trip.id });
  const currentTrip = route.screen === 'itinerary' ? trips.find(t => t.id === route.tripId) : undefined;
  function reset() { Alert.alert('Reset demo trips?', 'Your preview trips will be replaced with the original examples.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', onPress: () => setTrips(initialTrips) }]); }
  const tabs: { label: Tab; icon: IconName; active: IconName }[] = [{ label: 'Home', icon: 'home-outline', active: 'home' }, { label: 'My Trips', icon: 'calendar-outline', active: 'calendar' }, { label: 'Profile', icon: 'person-outline', active: 'person' }];
  function tabButton(item: typeof tabs[number]) { const active = tab === item.label; return <Pressable key={item.label} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => { setTab(item.label); close(); }} style={s.tab}><Icon name={active ? item.active : item.icon} color={active ? colors.primary : colors.muted} size={23} /><Text style={{ color: active ? colors.primary : colors.muted, fontSize: 11, fontWeight: active ? '700' : '500' }}>{item.label}</Text></Pressable>; }
  return <SafeAreaProvider><SafeAreaView edges={['top', 'bottom']} style={s.app}><StatusBar barStyle="dark-content" backgroundColor={colors.background} /><View style={{ flex: 1 }}>
    {route.screen === 'planner' ? <Planner destination={route.destination} close={close} save={trip => { setTrips(prev => [trip, ...prev]); setTab('My Trips'); open(trip); }} /> : currentTrip ? <Itinerary key={currentTrip.id} trip={currentTrip} close={close} remove={() => { setTrips(prev => prev.filter(t => t.id !== currentTrip.id)); setTab('My Trips'); close(); }} /> : tab === 'Home' ? <Home name={name} trips={trips} plan={plan} open={open} /> : tab === 'My Trips' ? <Trips trips={trips} open={open} plan={plan} remove={trip => setTrips(prev => prev.filter(t => t.id !== trip.id))} /> : <Profile name={name} setName={setName} tripCount={trips.length} reset={reset} />}
    </View>{route.screen === 'tabs' && <View style={s.nav}>{tabButton(tabs[0])}{tabButton(tabs[1])}<Pressable accessibilityRole="button" accessibilityLabel="Plan a new trip" onPress={() => plan()} style={s.plus}><Icon name="add" size={29} color="white" /></Pressable>{tabButton(tabs[2])}</View>}</SafeAreaView></SafeAreaProvider>;
}
const s = StyleSheet.create({ app: { flex: 1, backgroundColor: colors.background }, nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 14, paddingTop: 9, paddingBottom: 6, backgroundColor: 'white', borderTopWidth: 1, borderColor: colors.line }, tab: { alignItems: 'center', justifyContent: 'center', minHeight: 52, minWidth: 65, gap: 5 }, plus: { width: 51, height: 51, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 } });
