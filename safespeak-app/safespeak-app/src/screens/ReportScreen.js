import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { submitReport } from '../services/api';

const ABUSE_TYPES = ['Physical', 'Sexual', 'Emotional / Psychological', 'Harassment / Threats', 'Child labor', 'Neglect', 'Human trafficking concerns', 'Online / Digital abuse', 'Other'];

export default function ReportScreen({ navigation }) {
  const [abuseTypes, setAbuseTypes] = useState([]);
  const [description, setDescription] = useState('');
  const [isVictimSafe, setIsVictimSafe] = useState('Yes');
  const [reporterName, setReporterName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const toggleType = (type) => {
    setAbuseTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSubmit = async () => {
    if (abuseTypes.length === 0) { Alert.alert('Required', 'Please select at least one type of abuse'); return; }
    if (!consent) { Alert.alert('Required', 'Please agree to share this report'); return; }
    setLoading(true);
    try {
      const res = await submitReport({
        abuseTypes, description, isVictimSafe,
        reporterName, reporterEmail: email,
        classification: abuseTypes[0],
        location: 'Mobile Report',
        consentToShare: true,
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
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Report Submitted</Text>
        <Text style={styles.successSub}>Your Case ID:</Text>
        <Text style={styles.caseId}>{submitted}</Text>
        <Text style={styles.successNote}>Save this ID. Log in to track your case status.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report an Incident</Text>
      <Text style={styles.subtitle}>Confidential. You can stay anonymous.</Text>

      <Text style={styles.label}>Type of abuse (select one or more) *</Text>
      <View style={styles.typesGrid}>
        {ABUSE_TYPES.map(type => (
          <TouchableOpacity key={type} onPress={() => toggleType(type)}
            style={[styles.typeBtn, abuseTypes.includes(type) && styles.typeBtnActive]}>
            <Text style={[styles.typeBtnText, abuseTypes.includes(type) && styles.typeBtnTextActive]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Is the victim currently safe?</Text>
      <View style={styles.row}>
        {['Yes', 'No', "I don't know"].map(opt => (
          <TouchableOpacity key={opt} onPress={() => setIsVictimSafe(opt)}
            style={[styles.radioBtn, isVictimSafe === opt && styles.radioBtnActive]}>
            <Text style={[styles.radioText, isVictimSafe === opt && styles.radioTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput style={[styles.input, styles.textarea]} placeholder="Describe what happened..."
        value={description} onChangeText={setDescription} multiline numberOfLines={4} />

      <Text style={styles.label}>Your name (optional)</Text>
      <TextInput style={styles.input} placeholder="Your name" value={reporterName} onChangeText={setReporterName} />

      <Text style={styles.label}>Email (optional — for case updates)</Text>
      <TextInput style={styles.input} placeholder="your@email.com" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <TouchableOpacity onPress={() => setConsent(!consent)} style={styles.consentRow}>
        <Text style={styles.checkbox}>{consent ? '☑' : '☐'}</Text>
        <Text style={styles.consentText}>I agree to share this report with authorized support organizations.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Report'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a2340', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 14 },
  textarea: { height: 100, textAlignVertical: 'top' },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  typeBtnActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  typeBtnText: { fontSize: 12, color: '#374151' },
  typeBtnTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 8 },
  radioBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  radioBtnActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  radioText: { fontSize: 12, color: '#374151' },
  radioTextActive: { color: '#fff' },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, gap: 8 },
  checkbox: { fontSize: 20, color: '#0d9488' },
  consentText: { flex: 1, fontSize: 12, color: '#6b7280', lineHeight: 18 },
  button: { backgroundColor: '#0d9488', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  successIcon: { fontSize: 60, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a2340', marginBottom: 8 },
  successSub: { fontSize: 14, color: '#6b7280' },
  caseId: { fontSize: 28, fontWeight: 'bold', color: '#0d9488', fontFamily: 'monospace', marginVertical: 12 },
  successNote: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
});
