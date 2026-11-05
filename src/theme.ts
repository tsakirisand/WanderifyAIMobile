import { StyleSheet } from 'react-native';
export const colors = { primary: '#7C3AED', ink: '#191526', muted: '#807A8D', line: '#ECE8F2', pale: '#F3EDFF', background: '#FCFAFF', surface: '#FFFFFF', danger: '#B42318', success: '#16805D' };
export const ui = StyleSheet.create({
  page: { padding: 20, gap: 20, paddingBottom: 34, width: '100%', maxWidth: 650, alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  heading: { fontSize: 20, fontWeight: '700', color: colors.ink },
  text: { fontSize: 15, color: colors.ink, lineHeight: 23 },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  card: { backgroundColor: 'white', borderRadius: 22, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 12 },
  input: { backgroundColor: 'white', borderColor: colors.line, borderWidth: 1, borderRadius: 14, padding: 15, fontSize: 16, color: colors.ink, minHeight: 52 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 8 },
});
