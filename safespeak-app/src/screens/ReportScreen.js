import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView,
} from 'react-native';
import { submitReport } from '../services/api';
import { colors, spacing, radius, font, shadow } from '../theme';

const ABUSE_TYPES = ['Physical', 'Sexual', 'Emotional / Psychological', 'Harassment / Threats', 'Child labor', 'Neglect', 'Human trafficking concerns', 'Online / Digital abuse', 'Other'];

const INITIAL = {
  reportingFor: 'Myself', relationship: '', reporterName: '', phone: '', email: '', contactMethod: 'Do not contact me',
  ageRange: 'Prefer not to say', gender: 'Prefer not to say', locationTypeOfIncident: 'Prefer not to say',
  abuseTypes: [], whenDidItHappen: 'Today', isVictimSafe: 'Yes',
  description: '', evidence: [],
  stayAnonymous: true, consentToShare: false,
};

export default function ReportScreen({ navigation }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [section, setSection] = useState(1); // 1-5

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleType = (t) => set('abuseTypes', form.abuseTypes.includes(t) ? form.abuseTypes.filter(x => x !== t) : [...form.abuseTypes, t]);

  const pickFiles = () => {
    Alert.alert('File Upload', 'To enable file uploads, run:\nnpx expo install expo-document-picker\n\nThen reload the app.');
  };

  const handleSubmit = async () => {
    if (form.abuseTypes.length === 0) { Alert.alert('Required', 'Please select at least one type of abuse'); return; }
    if (!form.consentToShare) { Alert.alert('Required', 'Please agree to share this report'); return; }
    setLoading(true);
    try {
      const res = await submitReport({
        ...form,
        reporterEmail: form.email,
        classification: form.abuseTypes[0],
        location: form.locationTypeOfIncident,
      });
      if (res.caseId) setSubmitted(res.caseId);
      else Alert.alert('Error', res.message || 'Submission failed');
    } catch {
      Alert.alert('Error', 'Server unreachable.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <View style={s.successWrap}>
        <Text style={s.successIcon}>✅</Text>
        <Text style={s.successTitle}>Report Submitted</Text>
        <Text style={s.successSub}>Your Case ID:</Text>
        <Text style={s.caseId}>{submitted}</Text>
        <Text style={s.successNote}>Save this ID. Log in to track your case status.</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={s.btnText}>Go to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setSubmitted(null); setForm(INITIAL); setSection(1); }}>
          <Text style={s.linkText}>Submit another report</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Dropdown = ({ label, value, options, onChange, required }) => (
    <View style={s.field}>
      <Text style={s.label}>{label} {required && <Text style={s.req}>*</Text>}</Text>
      <View style={s.pickerWrap}>
        <Text style={s.pickerText}>{value || '-- Select --'}</Text>
        <Text style={s.pickerArrow}>▼</Text>
      </View>
      {/* Note: React Native doesn't have native select — use a modal picker or library like @react-native-picker/picker */}
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerIcon}>🛡️</Text>
        <Text style={s.headerTitle}>Report an Incident Safely</Text>
        <Text style={s.headerSub}>This form is confidential. You can stay anonymous. Provide only what you're comfortable sharing.</Text>
      </View>

      {/* Section progress */}
      <View style={s.progressBar}>
        {[1,2,3,4,5].map(i => (
          <TouchableOpacity key={i} onPress={() => setSection(i)} style={s.progressDot}>
            <View style={[s.progressCircle, section >= i && { backgroundColor: colors.teal }]}>
              <Text style={[s.progressNum, section >= i && { color: '#fff' }]}>{i}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section 1: Your Information */}
      {section === 1 && (
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>1. Your Information <Text style={s.optional}>(Optional)</Text></Text>
          <Text style={s.sectionSub}>You can leave this section empty to stay anonymous.</Text>

          <Text style={s.label}>Are you reporting for:</Text>
          <View style={s.radioRow}>
            {['Myself', 'Someone else', 'A child'].map(opt => (
              <TouchableOpacity key={opt} onPress={() => set('reportingFor', opt)}
                style={[s.radioBtn, form.reportingFor === opt && s.radioBtnActive]}>
                <Text style={[s.radioText, form.reportingFor === opt && s.radioTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Your name (optional)</Text>
          <TextInput style={s.input} placeholder="Your name" value={form.reporterName} onChangeText={v => set('reporterName', v)} placeholderTextColor={colors.textLight} />

          <Text style={s.label}>Email (optional — for case updates)</Text>
          <TextInput style={s.input} placeholder="your@email.com" value={form.email} onChangeText={v => set('email', v)}
            keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textLight} />

          <Text style={s.label}>Phone (optional)</Text>
          <TextInput style={s.input} placeholder="+251 9xx xxx xxx" value={form.phone} onChangeText={v => set('phone', v)}
            keyboardType="phone-pad" placeholderTextColor={colors.textLight} />

          <TouchableOpacity style={s.nextBtn} onPress={() => setSection(2)}>
            <Text style={s.nextBtnText}>Next: Victim Info →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Section 2: About the Victim */}
      {section === 2 && (
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>2. About the Victim <Text style={s.optional}>(Optional)</Text></Text>
          <Text style={s.sectionSub}>These details help responders prioritize support.</Text>

          <Text style={s.label}>Age range</Text>
          <View style={s.radioRow}>
            {['Under 5', '5–12', '13–17', '18–24', '25+'].map(opt => (
              <TouchableOpacity key={opt} onPress={() => set('ageRange', opt)}
                style={[s.radioBtn, form.ageRange === opt && s.radioBtnActive]}>
                <Text style={[s.radioText, form.ageRange === opt && s.radioTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Gender</Text>
          <View style={s.radioRow}>
            {['Female', 'Male', 'Other', 'Prefer not to say'].map(opt => (
              <TouchableOpacity key={opt} onPress={() => set('gender', opt)}
                style={[s.radioBtn, form.gender === opt && s.radioBtnActive]}>
                <Text style={[s.radioText, form.gender === opt && s.radioTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Location type of incident</Text>
          <View style={s.radioRow}>
            {['Home', 'School', 'Workplace', 'Public', 'Online'].map(opt => (
              <TouchableOpacity key={opt} onPress={() => set('locationTypeOfIncident', opt)}
                style={[s.radioBtn, form.locationTypeOfIncident === opt && s.radioBtnActive]}>
                <Text style={[s.radioText, form.locationTypeOfIncident === opt && s.radioTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.navRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => setSection(1)}>
              <Text style={s.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.nextBtn} onPress={() => setSection(3)}>
              <Text style={s.nextBtnText}>Next: Incident →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Section 3: Incident Details */}
      {section === 3 && (
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>3. Incident Details <Text style={s.req}>*</Text></Text>
          <Text style={s.sectionSub}>Select the options that best describe the incident.</Text>

          <Text style={s.label}>Type of abuse (select one or more) <Text style={s.req}>*</Text></Text>
          <View style={s.typesGrid}>
            {ABUSE_TYPES.map(type => (
              <TouchableOpacity key={type} onPress={() => toggleType(type)}
                style={[s.typeBtn, form.abuseTypes.includes(type) && s.typeBtnActive]}>
                <Text style={[s.typeBtnText, form.abuseTypes.includes(type) && s.typeBtnTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>When did it happen?</Text>
          <View style={s.radioRow}>
            {['Today', 'This week', 'This month', 'Longer ago'].map(opt => (
              <TouchableOpacity key={opt} onPress={() => set('whenDidItHappen', opt)}
                style={[s.radioBtn, form.whenDidItHappen === opt && s.radioBtnActive]}>
                <Text style={[s.radioText, form.whenDidItHappen === opt && s.radioTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Is the victim currently safe?</Text>
          <View style={s.radioRow}>
            {['Yes', 'No', "I don't know"].map(opt => (
              <TouchableOpacity key={opt} onPress={() => set('isVictimSafe', opt)}
                style={[s.radioBtn, form.isVictimSafe === opt && s.radioBtnActive]}>
                <Text style={[s.radioText, form.isVictimSafe === opt && s.radioTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.navRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => setSection(2)}>
              <Text style={s.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.nextBtn} onPress={() => setSection(4)}>
              <Text style={s.nextBtnText}>Next: Description →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Section 4: Tell Us More */}
      {section === 4 && (
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>4. Tell Us More <Text style={s.optional}>(Optional)</Text></Text>
          <Text style={s.sectionSub}>Share any extra details. Write only what you're comfortable with.</Text>

          <Text style={s.label}>Short description</Text>
          <TextInput style={[s.input, s.textarea]} placeholder="Describe what happened (optional)"
            value={form.description} onChangeText={v => set('description', v)} multiline numberOfLines={5}
            textAlignVertical="top" placeholderTextColor={colors.textLight} />

          <Text style={s.label}>Upload evidence (optional)</Text>
          <TouchableOpacity style={s.uploadBtn} onPress={pickFiles}>
            <Text style={s.uploadBtnText}>📎 Choose Files</Text>
          </TouchableOpacity>
          {form.evidence.length > 0 && (
            <View style={s.filesList}>
              {form.evidence.map((f, i) => (
                <View key={i} style={s.fileRow}>
                  <Text style={s.fileName}>{f.name || 'File'}</Text>
                  <TouchableOpacity onPress={() => set('evidence', form.evidence.filter((_, idx) => idx !== i))}>
                    <Text style={s.fileRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <Text style={s.hint}>Files are visible only to authorized support organizations.</Text>

          <View style={s.navRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => setSection(3)}>
              <Text style={s.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.nextBtn} onPress={() => setSection(5)}>
              <Text style={s.nextBtnText}>Next: Privacy →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Section 5: Privacy */}
      {section === 5 && (
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>5. Privacy and Follow-up</Text>
          <Text style={s.sectionSub}>Choose whether you want to remain anonymous and how you prefer to be contacted.</Text>

          <Text style={s.label}>Do you want to stay anonymous?</Text>
          <TouchableOpacity style={s.checkRow} onPress={() => set('stayAnonymous', !form.stayAnonymous)}>
            <View style={[s.checkbox, form.stayAnonymous && s.checkboxChecked]}>
              {form.stayAnonymous && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkLabel}>Yes - stay anonymous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.checkRow} onPress={() => set('consentToShare', !form.consentToShare)}>
            <View style={[s.checkbox, form.consentToShare && s.checkboxChecked]}>
              {form.consentToShare && <Text style={s.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.checkLabel}>I agree to share this report securely with authorized support organizations. <Text style={s.req}>*</Text></Text>
              <Text style={s.checkSub}>Your identity will remain protected. Personal contact info is optional.</Text>
            </View>
          </TouchableOpacity>

          <View style={s.navRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => setSection(4)}>
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
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: colors.bg },
  content:           { padding: spacing.md },
  header:            { backgroundColor: colors.teal, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  headerIcon:        { fontSize: 40, marginBottom: spacing.sm },
  headerTitle:       { fontSize: font.xl, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 4 },
  headerSub:         { fontSize: font.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20 },
  progressBar:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, paddingHorizontal: spacing.md },
  progressDot:       { alignItems: 'center' },
  progressCircle:    { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  progressNum:       { fontSize: font.sm, fontWeight: 'bold', color: colors.textSub },
  sectionCard:       { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, ...shadow },
  sectionTitle:      { fontSize: font.lg, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  sectionSub:        { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.md, lineHeight: 20 },
  optional:          { fontWeight: 'normal', color: colors.textLight },
  req:               { color: colors.danger },
  field:             { marginBottom: spacing.md },
  label:             { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input:             { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: font.md, color: colors.text },
  textarea:          { height: 100, textAlignVertical: 'top' },
  pickerWrap:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13 },
  pickerText:        { fontSize: font.md, color: colors.text },
  pickerArrow:       { fontSize: font.xs, color: colors.textLight },
  radioRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  radioBtn:          { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
  radioBtnActive:    { backgroundColor: colors.teal, borderColor: colors.teal },
  radioText:         { fontSize: font.sm, color: colors.text },
  radioTextActive:   { color: '#fff', fontWeight: '600' },
  typesGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  typeBtn:           { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
  typeBtnActive:     { backgroundColor: colors.teal, borderColor: colors.teal },
  typeBtnText:       { fontSize: font.xs, color: colors.text },
  typeBtnTextActive: { color: '#fff', fontWeight: '600' },
  uploadBtn:         { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', marginBottom: spacing.sm },
  uploadBtnText:     { fontSize: font.sm, color: colors.text, fontWeight: '600' },
  filesList:         { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  fileRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  fileName:          { fontSize: font.xs, color: colors.text, flex: 1 },
  fileRemove:        { fontSize: font.md, color: colors.danger, paddingHorizontal: spacing.sm },
  hint:              { fontSize: font.xs, color: colors.textLight, marginBottom: spacing.md },
  checkRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  checkbox:          { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxChecked:   { backgroundColor: colors.teal, borderColor: colors.teal },
  checkmark:         { color: '#fff', fontWeight: 'bold', fontSize: font.sm },
  checkLabel:        { flex: 1, fontSize: font.sm, color: colors.text, lineHeight: 20 },
  checkSub:          { fontSize: font.xs, color: colors.textSub, marginTop: 2, lineHeight: 17 },
  navRow:            { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  backBtn:           { flex: 1, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center' },
  backBtnText:       { color: colors.text, fontSize: font.sm },
  nextBtn:           { flex: 2, backgroundColor: colors.teal, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center' },
  nextBtnText:       { color: '#fff', fontWeight: 'bold', fontSize: font.sm },
  submitBtn:         { flex: 2, backgroundColor: colors.teal, paddingVertical: 14, borderRadius: radius.full, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  btn:               { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: radius.full, alignItems: 'center', marginBottom: spacing.sm },
  btnText:           { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  linkText:          { color: colors.accent, fontSize: font.sm, textAlign: 'center', marginTop: spacing.sm },
  successWrap:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.card },
  successIcon:       { fontSize: 60, marginBottom: spacing.md },
  successTitle:      { fontSize: font.xxl, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  successSub:        { fontSize: font.sm, color: colors.textSub },
  caseId:            { fontSize: 28, fontWeight: 'bold', color: colors.teal, fontFamily: 'monospace', marginVertical: spacing.md },
  successNote:       { fontSize: font.sm, color: colors.textSub, textAlign: 'center', marginBottom: spacing.lg },
});
