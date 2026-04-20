import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { registerUser } from '../services/api';
import { colors, spacing, radius, font, shadow } from '../theme';

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSignUp = async () => {
    if (!form.username || !form.password) { Alert.alert('Required', 'Username and password required'); return; }
    if (form.password !== form.confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (form.password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await registerUser(form.username, form.password, form.email);
      if (res.token) {
        Alert.alert('✅ Account Created', 'Please sign in with your new account.', [
          { text: 'Sign In', onPress: () => navigation.navigate('Login') }
        ]);
      } else { Alert.alert('Error', res.message || 'Registration failed'); }
    } catch { Alert.alert('Error', 'Server unreachable.'); }
    setLoading(false);
  };

  const Field = ({ label, icon, placeholder, value, onChange, secure, keyboard }) => (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputRow}>
        <Text style={s.inputIcon}>{icon}</Text>
        <TextInput style={s.input} placeholder={placeholder} value={value} onChangeText={onChange}
          secureTextEntry={secure && !showPw} keyboardType={keyboard || 'default'}
          autoCapitalize="none" placeholderTextColor={colors.textLight} />
        {secure && <TouchableOpacity onPress={() => setShowPw(!showPw)}>
          <Text style={s.inputIcon}>{showPw ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.topBar}>
          <Text style={s.appName}>🛡️ SafeSpeak</Text>
          <Text style={s.topSub}>Create your account</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Join SafeSpeak</Text>
          <Text style={s.cardSub}>Submit reports securely and track your cases</Text>

          <Field label="Username" icon="👤" placeholder="Choose a username" value={form.username} onChange={v => set('username', v)} />
          <Field label="Email (optional)" icon="✉️" placeholder="your@email.com" value={form.email} onChange={v => set('email', v)} keyboard="email-address" />
          <Field label="Password" icon="🔒" placeholder="Min. 6 characters" value={form.password} onChange={v => set('password', v)} secure />
          <Field label="Confirm Password" icon="🔒" placeholder="Repeat your password" value={form.confirm} onChange={v => set('confirm', v)} secure />

          <View style={s.infoBox}>
            <Text style={s.infoText}>📧 Providing your email allows us to notify you about case updates and appointments.</Text>
          </View>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSignUp} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={s.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  content: { flexGrow: 1, padding: spacing.lg },
  topBar: { alignItems: 'center', paddingVertical: spacing.xl },
  appName: { fontSize: font.xl, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  topSub: { fontSize: font.sm, color: 'rgba(255,255,255,0.6)' },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, ...shadow },
  cardTitle: { fontSize: font.xl, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.md },
  fieldWrap: { marginBottom: spacing.xs },
  label: { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  inputIcon: { fontSize: 16, marginRight: spacing.xs },
  input: { flex: 1, paddingVertical: 14, fontSize: font.md, color: colors.text },
  infoBox: { backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.teal },
  infoText: { fontSize: font.xs, color: colors.teal, lineHeight: 18 },
  btn: { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.lg },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: 'rgba(255,255,255,0.7)', fontSize: font.sm },
  footerLink: { color: colors.accent, fontWeight: 'bold', fontSize: font.sm },
});
