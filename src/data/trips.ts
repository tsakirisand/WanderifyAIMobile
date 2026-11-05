export type Activity = { time: string; title: string; detail: string; icon: 'camera-outline' | 'restaurant-outline' | 'leaf-outline' };
export type Trip = { id: string; destination: string; country: string; start: string; end: string; travelers: number; budget: string; interests: string[]; notes: string; photo: string; days: Activity[][]; demo: boolean };
export const destinations = [
  { name: 'Rome', country: 'Italy', photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000&q=85' },
  { name: 'Kyoto', country: 'Japan', photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=85' },
  { name: 'Paris', country: 'France', photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=85' },
];
export const romeDays: Activity[][] = [
  [{ time: '09:00', title: 'Colosseum', detail: 'Explore the iconic amphitheatre · 2 hours', icon: 'camera-outline' }, { time: '12:30', title: 'Lunch in Monti', detail: 'Fresh pasta and a slow afternoon · 1 hour', icon: 'restaurant-outline' }, { time: '15:00', title: 'Roman Forum', detail: 'Walk through ancient Rome · 2 hours', icon: 'leaf-outline' }],
  [{ time: '09:30', title: 'Vatican Museums', detail: 'Art, history and the Sistine Chapel', icon: 'camera-outline' }, { time: '13:00', title: 'Lunch in Prati', detail: 'A relaxed neighbourhood lunch', icon: 'restaurant-outline' }, { time: '16:00', title: 'Castel Sant’Angelo', detail: 'River views and a golden-hour walk', icon: 'leaf-outline' }],
  [{ time: '10:00', title: 'Trevi Fountain', detail: 'Start early and enjoy the piazza', icon: 'camera-outline' }, { time: '13:00', title: 'Trastevere', detail: 'Explore colourful lanes and local food', icon: 'restaurant-outline' }, { time: '17:00', title: 'Villa Borghese', detail: 'A peaceful walk through the gardens', icon: 'leaf-outline' }],
];
export const initialTrips: Trip[] = [
  { id: 'rome-demo', destination: 'Rome', country: 'Italy', start: '2027-05-12', end: '2027-05-14', travelers: 2, budget: 'Comfort', interests: ['Food', 'Culture'], notes: '', photo: destinations[0].photo, days: romeDays, demo: true },
  { id: 'kyoto-demo', destination: 'Kyoto', country: 'Japan', start: '2027-06-03', end: '2027-06-05', travelers: 2, budget: 'Comfort', interests: ['Nature'], notes: '', photo: destinations[1].photo, demo: true, days: [[{ time: '09:00', title: 'Fushimi Inari', detail: 'Walk beneath the red torii gates', icon: 'camera-outline' }, { time: '13:00', title: 'Nishiki Market', detail: 'Discover local flavours', icon: 'restaurant-outline' }], [{ time: '10:00', title: 'Arashiyama', detail: 'A morning in the bamboo grove', icon: 'leaf-outline' }], [{ time: '10:00', title: 'Gion', detail: 'Explore traditional Kyoto', icon: 'camera-outline' }]] },
];
export function formatDate(value: string) { return new Date(value + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
export function formatDateInput(value: string) { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); return match ? `${match[3]}/${match[2]}/${match[1]}` : value; }
export function isValidDate(value: string) { const d = new Date(value + 'T12:00:00Z'); return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value; }
