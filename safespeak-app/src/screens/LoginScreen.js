import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/api';
import { colors, spacing, radius, font, shadow } from '../theme';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { Alert.alert('Required', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await loginUser(username, password);
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
        Alert.alert('Error', res.message || 'Invalid credentials');
      }
    } catch { Alert.alert('Error', 'Server unreachable. Make sure the server is running.'); }
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

          <Text style={s.label}>Username</Text>
          <View style={s.inputRow}>
            <Text style={s.inputIcon}>👤</Text>
            <TextInput style={s.input} placeholder="Enter your username" value={username}
              onChangeText={setUsername} autoCapitalize="none" placeholderTextColor={colors.textLight} />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={s.inputRow}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="Enter your password" value={password}
              onChangeText={setPassword} secureTextEntry={!showPw} placeholderTextColor={colors.textLight} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={s.inputIcon}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={s.divider}><View style={s.dividerLine} /><Text style={s.dividerText}>or</Text><View style={s.dividerLine} /></View>

          <TouchableOpacity style={s.outlineBtn} onPress={() => navigation.navigate('Report')}>
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
  container: { flex: 1, backgroundColor: colors.primary },
  content: { flexGrow: 1, padding: spacing.lg },
  header: { alignItems: 'center', paddingVertical: spacing.xl },
  logo: { width: 64, height: 64, marginBottom: spacing.sm },
  appName: { fontSize: font.xxl, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  tagline: { fontSize: font.sm, color: 'rgba(255,255,255,0.6)' },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, ...shadow },
  cardTitle: { fontSize: font.xl, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.lg },
  label: { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.border },
  inputIcon: { fontSize: 16, marginRight: spacing.xs },
  input: { flex: 1, paddingVertical: 14, fontSize: font.md, color: colors.text },
  btn: { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.md },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.sm, color: colors.textLight, fontSize: font.sm },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.teal, paddingVertical: 13, borderRadius: radius.full, alignItems: 'center' },
  outlineBtnText: { color: colors.teal, fontWeight: '600', fontSize: font.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  forgotBtn: { alignItems: 'center', marginTop: spacing.sm },
  forgotText: { color: 'rgba(255,255,255,0.55)', fontSize: font.sm },
  footerText: { color: 'rgba(255,255,255,0.7)', fontSize: font.sm },
  footerLink: { color: colors.accent, fontWeight: 'bold', fontSize: font.sm },
  note: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: font.xs, marginTop: spacing.md, marginBottom: spacing.lg },
});
