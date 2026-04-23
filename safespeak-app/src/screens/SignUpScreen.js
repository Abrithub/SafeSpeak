import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar, Image } from 'react-native';
import { registerUser } from '../services/api';
import { validateSignUp } from '../utils/validation';
import { colors, spacing, radius, font, shadow } from '../theme';

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username)) newErrors.username = '3-30 chars, letters/numbers/underscore only';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'At least 6 characters';
    if (form.password !== form.confirm) newErrors.confirm = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await registerUser(form.username.trim(), form.password, form.email.trim());
      if (res.token) {
        Alert.alert('✅ Account Created', 'Your account has been created. Please sign in.', [
          { text: 'Sign In', onPress: () => navigation.replace('Login') }
        ]);
      } else {
        Alert.alert('Registration Failed', res.message || 'Could not create account');
      }
    } catch (err) {
      Alert.alert('Connection Error', 'Could not reach the server. Please try again.');
    }
    setLoading(false);
  };

  const Field = ({ label, field, placeholder, keyboard, secure, maxLength }) => {
    const handleChange = (v) => {
      // Username: only letters, numbers, underscore
      if (field === 'username') v = v.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
      // Email: no spaces
      if (field === 'email') v = v.replace(/\s/g, '');
      set(field, v);
    };

    return (
      <View style={s.fieldWrap}>
        <Text style={s.label}>{label}</Text>
        <View style={[s.inputRow, errors[field] && s.inputError]}>
          <TextInput
            style={s.input}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={handleChange}
            secureTextEntry={secure && !showPw}
            keyboardType={keyboard || 'default'}
            autoCapitalize="none"
            maxLength={maxLength || (field === 'username' ? 30 : field === 'email' ? 100 : 50)}
            placeholderTextColor={colors.textLight}
          />
          {secure && (
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={s.eyeIcon}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {errors[field] ? <Text style={s.errorText}>{errors[field]}</Text> : null}
        {field === 'username' && form[field] && (
          <Text style={s.charCount}>{form[field].length}/30</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.topBar}>
          <Image source={require('../../assets/newsafe.png')} style={s.logoImg} resizeMode="contain" onError={() => {}} />
          <Text style={s.topSub}>Create your account</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Join SafeSpeak</Text>
          <Text style={s.cardSub}>Submit reports securely and track your cases</Text>

          <Field label="Username" field="username" placeholder="Choose a username (3-30 chars)" />
          <Field label="Email" field="email" placeholder="your@email.com" keyboard="email-address" />
          <Field label="Password" field="password" placeholder="Min. 6 characters" secure />
          <Field label="Confirm Password" field="confirm" placeholder="Repeat your password" secure />

          <View style={s.infoBox}>
            <Text style={s.infoText}>📧 Your email is used for case updates and password recovery.</Text>
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
  container:   { flex: 1, backgroundColor: colors.primary },
  content:     { flexGrow: 1, padding: spacing.lg },
  topBar:      { alignItems: 'center', paddingVertical: spacing.xl },
  logoImg:     { width: 80, height: 80, marginBottom: spacing.sm },
  topSub:      { fontSize: font.sm, color: 'rgba(255,255,255,0.6)' },
  card:        { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, ...shadow },
  cardTitle:   { fontSize: font.xl, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  cardSub:     { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.md },
  fieldWrap:   { marginBottom: spacing.sm },
  label:       { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  inputError:  { borderColor: colors.danger },
  input:       { flex: 1, paddingVertical: 14, fontSize: font.md, color: colors.text },
  eyeIcon:     { fontSize: 16, paddingHorizontal: 4 },
  errorText:   { fontSize: font.xs, color: colors.danger, marginTop: 3 },
  charCount:   { fontSize: font.xs, color: colors.textLight, textAlign: 'right', marginTop: 2 },
  infoBox:     { backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.teal },
  infoText:    { fontSize: font.xs, color: colors.teal, lineHeight: 18 },
  btn:         { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.lg },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  footer:      { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText:  { color: 'rgba(255,255,255,0.7)', fontSize: font.sm },
  footerLink:  { color: colors.accent, fontWeight: 'bold', fontSize: font.sm },
});
