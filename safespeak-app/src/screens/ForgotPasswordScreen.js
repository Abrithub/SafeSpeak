import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { forgotPassword, resetPassword } from '../services/api';
import { colors, spacing, radius, font, shadow } from '../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep]         = useState(1); // 1=email, 2=code+newpw
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');
  const [newPw, setNewPw]       = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address'); return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res.message && !res.error) {
        Alert.alert('Code Sent', 'Check your email for the 6-digit reset code.');
        setStep(2);
      } else {
        Alert.alert('Error', res.message || 'Failed to send reset code.');
      }
    } catch {
      Alert.alert('Connection Error', 'Could not reach the server. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!code.trim()) { Alert.alert('Required', 'Please enter the reset code'); return; }
    if (!/^\d{6}$/.test(code.trim())) { Alert.alert('Invalid Code', 'Reset code must be 6 digits'); return; }
    if (!newPw) { Alert.alert('Required', 'Please enter a new password'); return; }
    if (newPw.length < 6) { Alert.alert('Too Short', 'Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { Alert.alert('Mismatch', 'Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await resetPassword(email.trim(), code.trim(), newPw);
      if (res.message && !res.error) {
        Alert.alert('✅ Password Reset', 'Your password has been updated. Please sign in.', [
          { text: 'Sign In', onPress: () => navigation.replace('Login') },
        ]);
      } else {
        Alert.alert('Error', res.message || 'Invalid or expired code.');
      }
    } catch {
      Alert.alert('Connection Error', 'Could not reach the server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerIcon}>🔑</Text>
        <Text style={s.headerTitle}>Reset Password</Text>
        <Text style={s.headerSub}>
          {step === 1
            ? 'Enter your email and we\'ll send you a reset code.'
            : `Enter the code sent to ${email}`}
        </Text>
      </View>

      {/* Step indicators */}
      <View style={s.steps}>
        {['Send Code', 'Reset'].map((label, i) => (
          <React.Fragment key={label}>
            <View style={s.stepItem}>
              <View style={[s.stepDot, step > i && s.stepDotDone, step === i + 1 && s.stepDotActive]}>
                <Text style={[s.stepNum, (step > i || step === i + 1) && { color: '#fff' }]}>
                  {step > i + 1 ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={[s.stepLabel, step === i + 1 && { color: colors.accent, fontWeight: '700' }]}>{label}</Text>
            </View>
            {i === 0 && <View style={[s.stepLine, step > 1 && { backgroundColor: colors.accent }]} />}
          </React.Fragment>
        ))}
      </View>

      <View style={s.card}>
        {step === 1 ? (
          <>
            <Text style={s.label}>Email Address</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>✉️</Text>
              <TextInput
                style={s.input}
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSendCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send Reset Code</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.label}>Reset Code</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>🔢</Text>
              <TextInput
                style={s.input}
                placeholder="Enter 6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <Text style={s.label}>New Password</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput
                style={s.input}
                placeholder="Min. 6 characters"
                value={newPw}
                onChangeText={setNewPw}
                secureTextEntry={!showPw}
                placeholderTextColor={colors.textLight}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <Text style={s.inputIcon}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.label}>Confirm New Password</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput
                style={s.input}
                placeholder="Repeat new password"
                value={confirmPw}
                onChangeText={setConfirmPw}
                secureTextEntry={!showPw}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleReset} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Reset Password</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.resendBtn} onPress={() => { setStep(1); setCode(''); setNewPw(''); setConfirmPw(''); }}>
              <Text style={s.resendText}>← Use a different email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={s.backLink} onPress={() => navigation.goBack()}>
        <Text style={s.backLinkText}>← Back to Sign In</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.primary },
  content:        { flexGrow: 1, padding: spacing.lg },
  header:         { alignItems: 'center', paddingVertical: spacing.xl },
  headerIcon:     { fontSize: 48, marginBottom: spacing.sm },
  headerTitle:    { fontSize: font.xxl, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  headerSub:      { fontSize: font.sm, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20 },
  steps:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, gap: 0 },
  stepItem:       { alignItems: 'center', width: 80 },
  stepDot:        { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepDotActive:  { backgroundColor: colors.accent },
  stepDotDone:    { backgroundColor: colors.teal },
  stepNum:        { fontSize: font.sm, fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' },
  stepLabel:      { fontSize: font.xs, color: 'rgba(255,255,255,0.5)' },
  stepLine:       { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 20 },
  card:           { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, ...shadow },
  label:          { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  inputRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  inputIcon:      { fontSize: 16, marginRight: spacing.xs },
  input:          { flex: 1, paddingVertical: 14, fontSize: font.md, color: colors.text },
  btn:            { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.lg },
  btnDisabled:    { opacity: 0.6 },
  btnText:        { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  resendBtn:      { alignItems: 'center', marginTop: spacing.md },
  resendText:     { color: colors.accent, fontSize: font.sm },
  backLink:       { alignItems: 'center', marginTop: spacing.lg },
  backLinkText:   { color: 'rgba(255,255,255,0.6)', fontSize: font.sm },
});
