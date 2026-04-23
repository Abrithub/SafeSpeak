import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { submitReport } from '../services/api';
import { colors, spacing, radius, font, shadow } from '../theme';

const INITIAL = {
  reportingFor: 'Myself', relationship: '', reporterName: '',
  phone: '', email: '', contactMethod: 'Do not contact me',
  ageRange: 'Prefer not to say', gender: 'Prefer not to say',
  locationTypeOfIncident: 'Prefer not to say',
  whenDidItHappen: 'Today', isVictimSafe: 'Yes',
  description: '', stayAnonymous: true, consentToShare: false,
};

export default function ReportScreen({ navigation }) {
  const [form, setForm]         = useState(INITIAL);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [section, setSection]   = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    AsyncStorage.getItem('token').then(t => { setIsLoggedIn(!!t); setChecking(false); });
  }, []);

  const set = (k, v) => {
    // Email: no spaces
    if (k === 'email') v = v.replace(/\s/g, '');
    // Name: limit special chars
    if (k === 'reporterName') v = v.replace(/[^a-zA-Z\s'-]/g, '').slice(0, 100);
    setForm(f => ({ ...f, [k]: v }));
  };

  const validateSection = (sec) => {
    const e = {};
    if (sec === 1) {
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        e.email = 'Enter a valid email address';
      }
      if (form.phone.trim()) {
        const cleaned = form.phone.replace(/\s/g, '');
        if (!/^(\+251|0)[0-9]{9}$/.test(cleaned)) {
          e.phone = 'Enter valid Ethiopian phone (+251912345678 or 0912345678)';
        }
      }
    }
    if (sec === 3) {
      if (!form.description.trim()) e.description = 'Description is required';
      else if (form.description.trim().length < 20) e.description = 'At least 20 characters needed';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateSection(3)) return;
    if (!form.consentToShare) {
      Alert.alert('Required', 'Please agree to share this report with authorized organizations.');
      return;
    }
    setLoading(true);
    try {
      const res = await submitReport({
        ...form,
        reporterEmail: form.email.trim(),
        location: form.locationTypeOfIncident,
      });
      if (res.caseId) setSubmitted(res.caseId);
      else Alert.alert('Submission Failed', res.message || 'Could not submit report. Please try again.');
    } catch (err) {
      Alert.alert('Connection Error', 'Could not reach the server. Please check your connection and try again.');
    }
    setLoading(false);
  };

  if (checking) return <View style={s.container} />;

  // Gate — require login
  if (!isLoggedIn) {
    return (
      <View style={s.gateWrap}>
        <View style={s.gateLock}><Text style={s.gateLockIcon}>🔒</Text></View>
        <Text style={s.gateTitle}>Account Required</Text>
        <Text style={s.gateSub}>To submit a report, you need an account. This ensures you can track your case and receive updates.</Text>
        <TouchableOpacity style={s.gateBtn} onPress={() => navigation.navigate('SignUp')}>
          <Text style={s.gateBtnText}>👤 Create Free Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.gateOutlineBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={s.gateOutlineBtnText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
        <View style={s.gateInfo}>
          <Text style={s.gateInfoTitle}>Why do I need an account?</Text>
          {['Track your case status in real time', 'Receive messages from the support team',
            'Get notified about appointments', 'Your identity remains protected'].map(t => (
            <Text key={t} style={s.gateInfoItem}>✓ {t}</Text>
          ))}
        </View>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={s.successWrap}>
        <Text style={s.successIcon}>✅</Text>
        <Text style={s.successTitle}>Report Submitted</Text>
        <Text style={s.successSub}>Your Case ID:</Text>
        <Text style={s.caseId}>{submitted}</Text>
        <Text style={s.successNote}>Save this ID. Our AI has analyzed your report and routed it to the right team.</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('MyCases')}>
          <Text style={s.btnText}>View My Cases</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setSubmitted(null); setForm(INITIAL); setSection(1); }}>
          <Text style={s.linkText}>Submit another report</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const RadioGroup = ({ label, options, value, onChange }) => (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.radioRow}>
        {options.map(opt => (
          <TouchableOpacity key={opt} onPress={() => onChange(opt)}
            style={[s.radioBtn, value === opt && s.radioBtnActive]}>
            <Text style={[s.radioText, value === opt && s.radioTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerIcon}>🛡️</Text>
          <Text style={s.headerTitle}>Report an Incident Safely</Text>
          <Text style={s.headerSub}>Confidential. You can stay anonymous.</Text>
        </View>

        {/* AI notice */}
        <View style={s.aiNotice}>
          <Text style={s.aiNoticeIcon}>🤖</Text>
          <Text style={s.aiNoticeText}>Our AI automatically identifies the type of abuse from your description — no need to select categories.</Text>
        </View>

        {/* Progress */}
        <View style={s.progressBar}>
          {[1, 2, 3, 4].map(i => (
            <TouchableOpacity key={i} onPress={() => setSection(i)} style={s.progressDot}>
              <View style={[s.progressCircle, section >= i && { backgroundColor: colors.teal }]}>
                <Text style={[s.progressNum, section >= i && { color: '#fff' }]}>{i}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 1: Your Info */}
        {section === 1 && (
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>1. Your Information <Text style={s.optional}>(Optional)</Text></Text>
            <Text style={s.sectionSub}>Leave empty to stay completely anonymous.</Text>

            <RadioGroup label="Reporting for:" options={['Myself', 'Someone else', 'A child']}
              value={form.reportingFor} onChange={v => set('reportingFor', v)} />

            <Text style={s.label}>Your name (optional)</Text>
            <TextInput style={[s.input, errors.reporterName && s.inputError]} placeholder="Your name" value={form.reporterName}
              onChangeText={v => { set('reporterName', v); setErrors(e => ({ ...e, reporterName: '' })); }}
              maxLength={100} placeholderTextColor={colors.textLight} />
            {errors.reporterName ? <Text style={s.errorText}>{errors.reporterName}</Text> : null}

            <Text style={s.label}>Email (optional — for case updates)</Text>
            <TextInput style={[s.input, errors.email && s.inputError]} placeholder="your@email.com" value={form.email}
              onChangeText={v => { set('email', v); setErrors(e => ({ ...e, email: '' })); }}
              keyboardType="email-address" autoCapitalize="none" maxLength={100}
              placeholderTextColor={colors.textLight} />
            {errors.email ? <Text style={s.errorText}>{errors.email}</Text> : null}

            <Text style={s.label}>Phone (optional)</Text>
            <TextInput
              style={[s.input, errors.phone && s.inputError]}
              placeholder="+251 9xx xxx xxx"
              value={form.phone}
              onChangeText={v => {
                // Block any non-numeric / non-+ / non-space character immediately
                const cleaned = v.replace(/[^0-9+\s]/g, '');
                set('phone', cleaned);
                if (cleaned !== v) {
                  setErrors(e => ({ ...e, phone: 'Only numbers are allowed here' }));
                } else {
                  // Live format check once user has typed enough
                  if (cleaned.replace(/\s/g, '').length >= 10) {
                    const valid = /^(\+251|0)[0-9]{9}$/.test(cleaned.replace(/\s/g, ''));
                    setErrors(e => ({ ...e, phone: valid ? '' : 'Enter valid Ethiopian phone (+251912345678 or 0912345678)' }));
                  } else {
                    setErrors(e => ({ ...e, phone: '' }));
                  }
                }
              }}
              keyboardType="phone-pad"
              maxLength={15}
              placeholderTextColor={colors.textLight}
            />
            {errors.phone ? (
              <View style={s.errorRow}>
                <Text style={s.errorIcon}>⚠️</Text>
                <Text style={s.errorText}>{errors.phone}</Text>
              </View>
            ) : form.phone.length > 0 && /^(\+251|0)[0-9]{9}$/.test(form.phone.replace(/\s/g, '')) ? (
              <View style={s.errorRow}>
                <Text style={s.errorIcon}>✅</Text>
                <Text style={s.validText}>Valid phone number</Text>
              </View>
            ) : null}

            <TouchableOpacity style={s.nextBtn} onPress={() => { if (validateSection(1)) setSection(2); }}
              <Text style={s.nextBtnText}>Next: Victim Info →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 2: Victim Info */}
        {section === 2 && (
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>2. About the Victim <Text style={s.optional}>(Optional)</Text></Text>
            <Text style={s.sectionSub}>Helps responders prioritize support.</Text>

            <RadioGroup label="Age range:" options={['Under 5', '5–12', '13–17', '18–24', '25+']}
              value={form.ageRange} onChange={v => set('ageRange', v)} />
            <RadioGroup label="Gender:" options={['Female', 'Male', 'Other', 'Prefer not to say']}
              value={form.gender} onChange={v => set('gender', v)} />
            <RadioGroup label="When did it happen?" options={['Today', 'This week', 'This month', 'Longer ago']}
              value={form.whenDidItHappen} onChange={v => set('whenDidItHappen', v)} />
            <RadioGroup label="Is the victim currently safe?" options={['Yes', 'No', "I don't know"]}
              value={form.isVictimSafe} onChange={v => set('isVictimSafe', v)} />
            <RadioGroup label="Location type:" options={['Home', 'School', 'Workplace', 'Public', 'Online']}
              value={form.locationTypeOfIncident} onChange={v => set('locationTypeOfIncident', v)} />

            <View style={s.navRow}>
              <TouchableOpacity style={s.backBtn} onPress={() => setSection(1)}>
                <Text style={s.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.nextBtn} onPress={() => setSection(3)}>
                <Text style={s.nextBtnText}>Next: Describe →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Section 3: Description */}
        {section === 3 && (
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>3. Describe What Happened <Text style={s.req}>*</Text></Text>
            <Text style={s.sectionSub}>Write in your own words. Our AI will automatically identify the type of abuse and urgency.</Text>

            <View style={s.aiHint}>
              <Text style={s.aiHintText}>🤖 The more detail you provide, the better our AI can assess and prioritize your case.</Text>
            </View>

            <TextInput style={[s.input, s.textarea, errors.description && s.inputError]}
              placeholder="Example: My neighbor has been hitting his child every night. The child is around 8 years old and I can hear crying through the wall..."
              value={form.description} onChangeText={v => { set('description', v); setErrors(e => ({ ...e, description: '' })); }}
              multiline numberOfLines={7} textAlignVertical="top" maxLength={2000}
              placeholderTextColor={colors.textLight} />
            {errors.description ? <Text style={s.errorText}>{errors.description}</Text> : null}
            <Text style={s.charCount}>{form.description.length}/2000</Text>

            <View style={s.navRow}>
              <TouchableOpacity style={s.backBtn} onPress={() => setSection(2)}>
                <Text style={s.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.nextBtn} onPress={() => { if (validateSection(3)) setSection(4); }}
                <Text style={s.nextBtnText}>Next: Privacy →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Section 4: Privacy */}
        {section === 4 && (
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>4. Privacy</Text>
            <Text style={s.sectionSub}>Choose whether you want to remain anonymous.</Text>

            <TouchableOpacity style={s.checkRow} onPress={() => set('stayAnonymous', !form.stayAnonymous)}>
              <View style={[s.checkbox, form.stayAnonymous && s.checkboxChecked]}>
                {form.stayAnonymous && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkLabel}>Yes — stay anonymous</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.checkRow} onPress={() => set('consentToShare', !form.consentToShare)}>
              <View style={[s.checkbox, form.consentToShare && s.checkboxChecked]}>
                {form.consentToShare && <Text style={s.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.checkLabel}>I agree to share this report with authorized support organizations. <Text style={s.req}>*</Text></Text>
                <Text style={s.checkSub}>Your identity will remain protected.</Text>
              </View>
            </TouchableOpacity>

            <View style={s.navRow}>
              <TouchableOpacity style={s.backBtn} onPress={() => setSection(3)}>
                <Text style={s.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.submitBtn, loading && s.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
                <Text style={s.submitBtnText}>{loading ? 'Submitting...' : 'Submit Report'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.bg },
  content:          { padding: spacing.md },
  header:           { backgroundColor: colors.teal, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  headerIcon:       { fontSize: 40, marginBottom: spacing.sm },
  headerTitle:      { fontSize: font.xl, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 4 },
  headerSub:        { fontSize: font.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  aiNotice:         { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#bbf7d0' },
  aiNoticeIcon:     { fontSize: 20 },
  aiNoticeText:     { flex: 1, fontSize: font.xs, color: '#065f46', lineHeight: 18 },
  aiHint:           { backgroundColor: '#eff6ff', borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  aiHintText:       { fontSize: font.xs, color: '#1e40af', lineHeight: 18 },
  progressBar:      { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.md },
  progressDot:      { alignItems: 'center' },
  progressCircle:   { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  progressNum:      { fontSize: font.sm, fontWeight: 'bold', color: colors.textSub },
  sectionCard:      { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadow },
  sectionTitle:     { fontSize: font.lg, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  sectionSub:       { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.md, lineHeight: 20 },
  optional:         { fontWeight: 'normal', color: colors.textLight },
  req:              { color: colors.danger },
  fieldWrap:        { marginBottom: spacing.sm },
  label:            { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input:            { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: font.md, color: colors.text },
  inputError:       { borderColor: colors.danger },
  errorRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  errorIcon:        { fontSize: 12 },
  errorText:        { fontSize: font.xs, color: colors.danger, flex: 1 },
  validText:        { fontSize: font.xs, color: colors.success, flex: 1 },
  charCount:        { fontSize: font.xs, color: colors.textLight, textAlign: 'right', marginTop: 2 },
  textarea:         { height: 140, textAlignVertical: 'top' },
  radioRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  radioBtn:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  radioBtnActive:   { backgroundColor: colors.teal, borderColor: colors.teal },
  radioText:        { fontSize: font.xs, color: colors.textSub },
  radioTextActive:  { color: '#fff', fontWeight: '600' },
  checkRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  checkbox:         { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxChecked:  { backgroundColor: colors.teal, borderColor: colors.teal },
  checkmark:        { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checkLabel:       { flex: 1, fontSize: font.sm, color: colors.text, lineHeight: 20 },
  checkSub:         { fontSize: font.xs, color: colors.textSub, marginTop: 2 },
  navRow:           { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, gap: spacing.sm },
  backBtn:          { flex: 1, paddingVertical: 13, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  backBtnText:      { color: colors.textSub, fontWeight: '600', fontSize: font.sm },
  nextBtn:          { flex: 2, backgroundColor: colors.accent, paddingVertical: 13, borderRadius: radius.full, alignItems: 'center' },
  nextBtnText:      { color: '#fff', fontWeight: 'bold', fontSize: font.sm },
  submitBtn:        { flex: 2, backgroundColor: colors.teal, paddingVertical: 13, borderRadius: radius.full, alignItems: 'center' },
  submitBtnDisabled:{ opacity: 0.6 },
  submitBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: font.sm },
  // Gate styles
  gateWrap:         { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  gateLock:         { width: 72, height: 72, borderRadius: 36, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  gateLockIcon:     { fontSize: 32 },
  gateTitle:        { fontSize: font.xxl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  gateSub:          { fontSize: font.sm, color: colors.textSub, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  gateBtn:          { width: '100%', backgroundColor: colors.teal, paddingVertical: 15, borderRadius: radius.full, alignItems: 'center', marginBottom: spacing.sm },
  gateBtnText:      { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  gateOutlineBtn:   { width: '100%', borderWidth: 1.5, borderColor: colors.teal, paddingVertical: 13, borderRadius: radius.full, alignItems: 'center', marginBottom: spacing.lg },
  gateOutlineBtnText: { color: colors.teal, fontWeight: '600', fontSize: font.sm },
  gateInfo:         { width: '100%', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md },
  gateInfoTitle:    { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  gateInfoItem:     { fontSize: font.sm, color: colors.textSub, marginBottom: 4 },
  // Success styles
  successWrap:      { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  successIcon:      { fontSize: 56, marginBottom: spacing.md },
  successTitle:     { fontSize: font.xxl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  successSub:       { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.xs },
  caseId:           { fontSize: 28, fontWeight: 'bold', color: colors.teal, fontFamily: 'monospace', marginBottom: spacing.sm },
  successNote:      { fontSize: font.sm, color: colors.textSub, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  btn:              { backgroundColor: colors.teal, paddingVertical: 14, paddingHorizontal: 40, borderRadius: radius.full, marginBottom: spacing.md },
  btnText:          { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  linkText:         { color: colors.accent, fontSize: font.sm, textDecorationLine: 'underline' },
});
