import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { loginUser, BASE_URL } from '../services/api';
import { colors, spacing, radius, font, shadow } from '../theme';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '379588616058-cb5dfqtqqn5bl5j0hbm4r2j2ntuep2ch.apps.googleusercontent.com';
// Use the deployed backend as the OAuth redirect
const BACKEND_REDIRECT = 'https://safespeak-api-vkw6.onrender.com/api/auth/google/callback';
const APP_SCHEME = 'safespeak-app://auth';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [waking, setWaking] = useState(false);

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
      console.log('Auth result:', result.type, result.url);

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const params = new URLSearchParams(url.split('?')[1] || '');
        const accessToken = params.get('access_token');
        const error = params.get('error');

        if (error) { Alert.alert('Error', error); setLoading(false); return; }
        if (!accessToken) { Alert.alert('Error', 'No access token received'); setLoading(false); return; }

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
          if (res.role === 'admin') {
            await AsyncStorage.setItem('adminAuth', 'true');
            navigation.replace('Dashboard');
          } else {
            navigation.replace('MyCases');
          }
        } else {
          Alert.alert('Error', res.message || 'Google sign-in failed');
        }
      } else if (result.type === 'cancel') {
        // user cancelled
      } else {
        Alert.alert('Error', 'Google sign-in failed. Please try again.');
      }
    } catch (e) {
      console.log('Google sign-in error:', e.message);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setWaking(false);
    try {
      // Ping the server first — Render free tier sleeps after inactivity
      try {
        await fetch(`${BASE_URL.replace('/api', '')}/api/ping`, { signal: AbortSignal.timeout(5000) });
      } catch {
        // Server may be waking up — show friendly message and keep trying
        setWaking(true);
      }

      const res = await loginUser(username.trim(), password);
      setWaking(false);
      if (res.token) {
        await AsyncStorage.setItem('token', res.token);
        await AsyncStorage.setItem('currentUser', JSON.stringify({ username: res.username, role: res.role }));
        if (res.role === 'admin') {
          await AsyncStorage.setItem('adminAuth', 'true');
          navigation.replace('Dashboard');
        } else {
          navigation.replace('MyCases');
        }
      } else {
        Alert.alert('Login Failed', res.message || 'Invalid username or password');
      }
    } catch (err) {
      setWaking(false);
      if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
        Alert.alert(
          'Server Starting Up',
          'The server is waking up from sleep. Please wait 30 seconds and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Connection Error', 'Could not reach the server. Please check your internet connection and try again.');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Image source={require('../../assets/newsafe.png')} style={s.logo} resizeMode="contain" onError={() => {}} />
          <Text style={s.appName}>SafeSpeak</Text>
          <Text style={s.tagline}>Secure. Anonymous. Trusted.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome Back</Text>
          <Text style={s.cardSub}>Sign in to view your cases and appointments</Text>

          {/* Google sign-in disabled in development — enable when deployed with HTTPS domain
          <TouchableOpacity style={s.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
            <Text style={s.googleG}>G</Text>
            <Text style={s.googleText}>Continue with Google</Text>
          </TouchableOpacity>
          */}

          {/* Divider hidden while Google sign-in is disabled
          <View style={s.divider}><View style={s.dividerLine} /><Text style={s.dividerText}>or sign in with username</Text><View style={s.dividerLine} /></View>
          */}

          <Text style={s.label}>Username</Text>
          <View style={[s.inputRow, errors.username && s.inputError]}>
            <Text style={s.inputIcon}>👤</Text>
            <TextInput style={s.input} placeholder="Enter your username" value={username}
              onChangeText={v => { setUsername(v.replace(/\s/g, '')); setErrors(e => ({ ...e, username: '' })); }}
              autoCapitalize="none" autoCorrect={false} maxLength={30}
              placeholderTextColor={colors.textLight} />
          </View>
          {errors.username ? <Text style={s.fieldError}>{errors.username}</Text> : null}

          <Text style={s.label}>Password</Text>
          <View style={[s.inputRow, errors.password && s.inputError]}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="Enter your password" value={password}
              onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
              secureTextEntry={!showPw} autoCapitalize="none" autoCorrect={false} maxLength={50}
              placeholderTextColor={colors.textLight} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={s.inputIcon}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={s.fieldError}>{errors.password}</Text> : null}

          {waking && (
            <View style={s.wakingBox}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={s.wakingText}>Server is waking up, please wait...</Text>
            </View>
          )}

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={s.divider}><View style={s.dividerLine} /><Text style={s.dividerText}>or</Text><View style={s.dividerLine} /></View>

          <TouchableOpacity style={s.outlineBtn} onPress={() => navigation.navigate('Main', { screen: 'Report' })}>
            <Text style={s.outlineBtnText}>📋 Submit Report Anonymously</Text>
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={s.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.note}>*All sessions are encrypted and monitored</Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.primary },
  content:      { flexGrow: 1, padding: spacing.lg },
  header:       { alignItems: 'center', paddingVertical: spacing.xl },
  logo:         { width: 64, height: 64, marginBottom: spacing.sm },
  appName:      { fontSize: font.xxl, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  tagline:      { fontSize: font.sm, color: 'rgba(255,255,255,0.6)' },
  card:         { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, ...shadow },
  cardTitle:    { fontSize: font.xl, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  cardSub:      { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.lg },
  label:        { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  inputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.border },
  inputError:   { borderColor: colors.danger },
  inputIcon:    { fontSize: 16, marginRight: spacing.xs },
  input:        { flex: 1, paddingVertical: 14, fontSize: font.md, color: colors.text },
  fieldError:   { color: colors.danger, fontSize: font.xs, marginBottom: spacing.xs, marginTop: -4 },
  wakingBox:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#eff6ff', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  wakingText:   { fontSize: font.xs, color: colors.accent, flex: 1 },
  btn:          { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.md },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  divider:      { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine:  { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText:  { marginHorizontal: spacing.sm, color: colors.textLight, fontSize: font.xs },
  googleBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: radius.full, paddingVertical: 13, marginBottom: spacing.sm, backgroundColor: '#fff' },
  googleG:      { fontSize: 18, fontWeight: 'bold', color: '#4285F4' },
  googleText:   { fontSize: font.sm, fontWeight: '600', color: '#374151' },
  outlineBtn:   { borderWidth: 1.5, borderColor: colors.teal, paddingVertical: 13, borderRadius: radius.full, alignItems: 'center' },
  outlineBtnText: { color: colors.teal, fontWeight: '600', fontSize: font.sm },
  footer:       { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  forgotBtn:    { alignItems: 'center', marginTop: spacing.sm },
  forgotText:   { color: 'rgba(255,255,255,0.55)', fontSize: font.sm },
  footerText:   { color: 'rgba(255,255,255,0.7)', fontSize: font.sm },
  footerLink:   { color: colors.accent, fontWeight: 'bold', fontSize: font.sm },
  note:         { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: font.xs, marginTop: spacing.md, marginBottom: spacing.lg },
});
