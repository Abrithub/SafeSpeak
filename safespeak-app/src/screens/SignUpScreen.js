import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { registerUser, BASE_URL } from '../services/api';
import { colors, spacing, radius, font, shadow } from '../theme';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '379588616058-cb5dfqtqqn5bl5j0hbm4r2j2ntuep2ch.apps.googleusercontent.com';
const BACKEND_REDIRECT = 'http://192.168.45.165:5000/api/auth/google/callback';
const APP_SCHEME = 'safespeak-app://auth';

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${WEB_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(BACKEND_REDIRECT)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, APP_SCHEME);

      if (result.type === 'success' && result.url) {
        const params = new URLSearchParams(result.url.split('?')[1] || '');
        const accessToken = params.get('access_token');
        const error = params.get('error');

        if (error) { Alert.alert('Error', error); setLoading(false); return; }
        if (!accessToken) throw new Error('No access token');

        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then(r => r.json());

        const res = await fetch(`${BASE_URL}/auth/google-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInfo }),
        }).then(r => r.json());

        if (res.token) {
          await AsyncStorage.setItem('token', res.token);
          await AsyncStorage.setItem('currentUser', JSON.stringify({ username: res.username, role: res.role }));
          navigation.replace('MyCases');
        } else {
          Alert.alert('Error', res.message || 'Google sign-in failed');
        }
      } else if (result.type !== 'cancel') {
        Alert.alert('Error', 'Google sign-in failed. Please try again.');
      }
    } catch (e) {
      console.log('Google sign-in error:', e.message);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!form.username || !form.password) { Alert.alert('Required', 'Username and password required'); return; }
    if (!form.email) { Alert.alert('Required', 'Email is required'); return; }
    if (form.password !== form.confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (form.password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await registerUser(form.username, form.password, form.email);
      if (res.token) {
        await AsyncStorage.setItem('token', res.token);
        await AsyncStorage.setItem('currentUser', JSON.stringify({ username: res.username, role: res.role }));
        navigation.replace('MyCases');
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
          <Image source={require('../../assets/newsafe.png')} style={s.logoImg} resizeMode="contain" />
          <Text style={s.topSub}>Create your account</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Join SafeSpeak</Text>
          <Text style={s.cardSub}>Submit reports securely and track your cases</Text>

          {/* Google sign-in disabled in development — enable when deployed with HTTPS domain
          <TouchableOpacity style={s.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
            <Text style={s.googleG}>G</Text>
            <Text style={s.googleText}>Continue with Google</Text>
          </TouchableOpacity>
          */}

          {/* Divider hidden while Google sign-in is disabled
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or sign up with email</Text>
            <View style={s.dividerLine} />
          </View>
          */}

          <Field label="Username" icon="👤" placeholder="Choose a username" value={form.username} onChange={v => set('username', v)} />
          <Field label="Email (required)" icon="✉️" placeholder="your@email.com" value={form.email} onChange={v => set('email', v)} keyboard="email-address" />
          <Field label="Password" icon="🔒" placeholder="Min. 6 characters" value={form.password} onChange={v => set('password', v)} secure />
          <Field label="Confirm Password" icon="🔒" placeholder="Repeat your password" value={form.confirm} onChange={v => set('confirm', v)} secure />

          <View style={s.infoBox}>
            <Text style={s.infoText}>📧 Your email is used to send case updates and appointment notifications.</Text>
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
  container:  { flex: 1, backgroundColor: colors.primary },
  content:    { flexGrow: 1, padding: spacing.lg },
  topBar:     { alignItems: 'center', paddingVertical: spacing.xl },
  logoImg:    { width: 100, height: 100, marginBottom: spacing.sm },
  topSub:     { fontSize: font.sm, color: 'rgba(255,255,255,0.6)' },
  card:       { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, ...shadow },
  cardTitle:  { fontSize: font.xl, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  cardSub:    { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.md },
  fieldWrap:  { marginBottom: spacing.xs },
  label:      { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  inputIcon:  { fontSize: 16, marginRight: spacing.xs },
  input:      { flex: 1, paddingVertical: 14, fontSize: font.md, color: colors.text },
  infoBox:    { backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.teal },
  infoText:   { fontSize: font.xs, color: colors.teal, lineHeight: 18 },
  googleBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: radius.full, paddingVertical: 13, marginBottom: spacing.sm, backgroundColor: '#fff' },
  googleG:    { fontSize: 18, fontWeight: 'bold', color: '#4285F4' },
  googleText: { fontSize: font.sm, fontWeight: '600', color: '#374151' },
  divider:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  dividerLine:{ flex: 1, height: 1, backgroundColor: colors.border },
  dividerText:{ fontSize: font.xs, color: colors.textLight },
  btn:        { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.lg },
  btnDisabled:{ opacity: 0.6 },
  btnText:    { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: 'rgba(255,255,255,0.7)', fontSize: font.sm },
  footerLink: { color: colors.accent, fontWeight: 'bold', fontSize: font.sm },
});
