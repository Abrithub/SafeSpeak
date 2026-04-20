import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Linking,
} from 'react-native';
import { trackCase, getReporterAppointments } from '../services/api';
import { colors, spacing, radius, font, shadow } from '../theme';

const STATUS_STEPS = ['Pending', 'Under Review', 'In Progress', 'Resolved'];
const STATUS_COLOR = { Pending: '#f59e0b', 'Under Review': '#3b82f6', 'In Progress': '#8b5cf6', Resolved: '#10b981', Rejected: '#6b7280' };
const URGENCY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' };
const APPT_COLOR = { Scheduled: { bg: '#dbeafe', text: '#1d4ed8' }, Confirmed: { bg: '#dcfce7', text: '#166534' }, Cancelled: { bg: '#fee2e2', text: '#dc2626' }, Completed: { bg: '#f3f4f6', text: '#6b7280' } };

export default function TrackCaseScreen({ navigation }) {
  const [caseId, setCaseId]         = useState('');
  const [email, setEmail]           = useState('');
  const [result, setResult]         = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [tab, setTab]               = useState('case'); // 'case' | 'appointments'

  const handleTrack = async () => {
    const id = caseId.trim().toUpperCase();
    if (!id) { setError('Please enter your Case ID'); return; }
    setLoading(true); setError(''); setResult(null); setAppointments([]);
    try {
      const [caseRes, apptRes] = await Promise.all([
        trackCase(id, email.trim()),
        email.trim() ? getReporterAppointments(email.trim()) : Promise.resolve([]),
      ]);
      if (caseRes.caseId) {
        setResult(caseRes);
        setAppointments(Array.isArray(apptRes) ? apptRes : []);
        setTab('case');
      } else {
        setError(caseRes.message || 'Case not found. Check your Case ID.');
      }
    } catch {
      setError('Server unreachable. Make sure you are connected.');
    }
    setLoading(false);
  };

  const stepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;
  const upcomingAppts = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed');

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>🔍 Track Your Case</Text>
        <Text style={s.headerSub}>Enter your Case ID to check the status of your report</Text>
      </View>

      {/* Search card */}
      <View style={s.card}>
        <Text style={s.label}>Case ID <Text style={s.req}>*</Text></Text>
        <TextInput style={s.input} placeholder="e.g. CASE-1001" value={caseId}
          onChangeText={t => { setCaseId(t); setError(''); }}
          autoCapitalize="characters" placeholderTextColor={colors.textLight} />

        <Text style={s.label}>Email (optional — for verification & appointments)</Text>
        <TextInput style={s.input} placeholder="your@email.com" value={email}
          onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
          placeholderTextColor={colors.textLight} />

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleTrack} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Track Case</Text>}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {result && (
        <View>
          {/* Tabs */}
          <View style={s.tabs}>
            <TouchableOpacity style={[s.tab, tab === 'case' && s.tabActive]} onPress={() => setTab('case')}>
              <Text style={[s.tabText, tab === 'case' && s.tabTextActive]}>📋 Case Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tab, tab === 'appointments' && s.tabActive]} onPress={() => setTab('appointments')}>
              <Text style={[s.tabText, tab === 'appointments' && s.tabTextActive]}>
                📅 Appointments {appointments.length > 0 ? `(${appointments.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── CASE TAB ── */}
          {tab === 'case' && (
            <View>
              {/* Status header */}
              <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: STATUS_COLOR[result.status] || '#6b7280' }]}>
                <Text style={s.caseIdText}>{result.caseId}</Text>
                <Text style={s.classText}>{result.classification}</Text>
                <View style={s.badgeRow}>
                  <View style={[s.badge, { backgroundColor: (STATUS_COLOR[result.status] || '#6b7280') + '22' }]}>
                    <Text style={[s.badgeText, { color: STATUS_COLOR[result.status] || '#6b7280' }]}>{result.status}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: (URGENCY_COLOR[result.urgency] || '#6b7280') + '22' }]}>
                    <Text style={[s.badgeText, { color: URGENCY_COLOR[result.urgency] || '#6b7280' }]}>{result.urgency} Priority</Text>
                  </View>
                </View>
                <Text style={s.submittedText}>Submitted: {new Date(result.submittedAt).toLocaleDateString()}</Text>
              </View>

              {/* Progress */}
              {result.status !== 'Rejected' && (
                <View style={s.card}>
                  <Text style={s.cardTitle}>Case Progress</Text>
                  <View style={s.progressRow}>
                    {STATUS_STEPS.map((step, i) => (
                      <React.Fragment key={step}>
                        <View style={s.stepWrap}>
                          <View style={[s.stepDot, i <= stepIndex && { backgroundColor: colors.teal }]}>
                            <Text style={[s.stepNum, i <= stepIndex && { color: '#fff' }]}>
                              {i < stepIndex ? '✓' : i + 1}
                            </Text>
                          </View>
                          <Text style={[s.stepLabel, i <= stepIndex && { color: colors.teal, fontWeight: '700' }]}>
                            {step.split(' ')[0]}
                          </Text>
                        </View>
                        {i < STATUS_STEPS.length - 1 && (
                          <View style={[s.stepLine, i < stepIndex && { backgroundColor: colors.teal }]} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              )}

              {/* Upcoming appointment alert */}
              {upcomingAppts.length > 0 && (
                <TouchableOpacity style={s.apptAlert} onPress={() => setTab('appointments')}>
                  <Text style={s.apptAlertText}>📅 You have an upcoming appointment</Text>
                  <Text style={s.apptAlertSub}>{upcomingAppts[0].date} at {upcomingAppts[0].time} — {upcomingAppts[0].location}</Text>
                  <Text style={s.apptAlertLink}>View details →</Text>
                </TouchableOpacity>
              )}

              {/* Messages from support */}
              {(result.messages || []).length > 0 && (
                <View style={s.card}>
                  <Text style={s.cardTitle}>💬 Messages from Support Team</Text>
                  {result.messages.map((m, i) => (
                    <View key={i} style={s.messageBox}>
                      <Text style={s.messageText}>{m.text}</Text>
                      <Text style={s.messageTime}>{new Date(m.time).toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={s.actionsRow}>
                <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Report')}>
                  <Text style={s.actionBtnText}>📋 New Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.teal }]}
                  onPress={() => Linking.openURL('tel:+251911123456')}>
                  <Text style={s.actionBtnText}>📞 Call Support</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.privacyNote}>Your identity remains protected. Case details are only visible with your Case ID.</Text>
            </View>
          )}

          {/* ── APPOINTMENTS TAB ── */}
          {tab === 'appointments' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>📅 Your Appointments</Text>
              {appointments.length === 0 ? (
                <View style={s.emptyAppt}>
                  <Text style={s.emptyApptIcon}>📅</Text>
                  <Text style={s.emptyApptTitle}>No appointments yet</Text>
                  <Text style={s.emptyApptSub}>If a physical meeting is needed, the support team will notify you by email.</Text>
                </View>
              ) : (
                appointments.map((a, i) => {
                  const ac = APPT_COLOR[a.status] || APPT_COLOR.Scheduled;
                  return (
                    <View key={i} style={s.apptCard}>
                      <View style={s.apptCardTop}>
                        <Text style={s.apptCaseId}>{a.caseId}</Text>
                        <View style={[s.badge, { backgroundColor: ac.bg }]}>
                          <Text style={[s.badgeText, { color: ac.text }]}>{a.status}</Text>
                        </View>
                      </View>
                      <View style={s.apptDetail}>
                        <Text style={s.apptDetailText}>📅 {a.date}</Text>
                        <Text style={s.apptDetailText}>🕐 {a.time}</Text>
                        <Text style={s.apptDetailText}>📍 {a.location}</Text>
                        {a.notes ? <Text style={s.apptNotes}>{a.notes}</Text> : null}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>
      )}

      {/* Help tip */}
      {!result && (
        <View style={s.tipBox}>
          <Text style={s.tipTitle}>💡 Where is my Case ID?</Text>
          <Text style={s.tipText}>Your Case ID was shown on screen after you submitted your report (e.g. CASE-1001). If you provided an email, it was also sent there.</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.bg },
  content:        { padding: spacing.md },
  header:         { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  headerTitle:    { fontSize: font.xl, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSub:      { fontSize: font.sm, color: 'rgba(255,255,255,0.65)', lineHeight: 20 },
  card:           { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadow },
  label:          { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  req:            { color: colors.danger },
  input:          { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: font.md, color: colors.text },
  errorText:      { color: colors.danger, fontSize: font.sm, marginTop: spacing.sm },
  btn:            { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.md },
  btnDisabled:    { opacity: 0.6 },
  btnText:        { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  tabs:           { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: spacing.sm, overflow: 'hidden', ...shadow },
  tab:            { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:      { borderBottomColor: colors.teal },
  tabText:        { fontSize: font.sm, color: colors.textSub, fontWeight: '500' },
  tabTextActive:  { color: colors.teal, fontWeight: '700' },
  caseIdText:     { fontSize: font.xs, color: colors.textSub, fontFamily: 'monospace', marginBottom: 4 },
  classText:      { fontSize: font.xl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  badgeRow:       { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.sm },
  badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeText:      { fontSize: font.xs, fontWeight: '700' },
  submittedText:  { fontSize: font.xs, color: colors.textSub },
  cardTitle:      { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  progressRow:    { flexDirection: 'row', alignItems: 'center' },
  stepWrap:       { alignItems: 'center' },
  stepDot:        { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepNum:        { fontSize: font.xs, fontWeight: 'bold', color: colors.textSub },
  stepLine:       { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 18 },
  stepLabel:      { fontSize: 9, color: colors.textSub, textAlign: 'center', maxWidth: 50 },
  apptAlert:      { backgroundColor: '#eff6ff', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
  apptAlertText:  { fontSize: font.sm, fontWeight: '700', color: '#1e40af' },
  apptAlertSub:   { fontSize: font.xs, color: '#3b82f6', marginTop: 4 },
  apptAlertLink:  { fontSize: font.xs, color: '#3b82f6', marginTop: 4, textDecorationLine: 'underline' },
  messageBox:     { backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  messageText:    { fontSize: font.sm, color: colors.text, lineHeight: 20 },
  messageTime:    { fontSize: font.xs, color: colors.textSub, marginTop: 4 },
  actionsRow:     { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  actionBtn:      { flex: 1, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center' },
  actionBtnText:  { color: '#fff', fontWeight: '700', fontSize: font.sm },
  privacyNote:    { fontSize: font.xs, color: colors.textSub, textAlign: 'center', marginBottom: spacing.md },
  emptyAppt:      { alignItems: 'center', paddingVertical: spacing.xl },
  emptyApptIcon:  { fontSize: 40, marginBottom: spacing.sm },
  emptyApptTitle: { fontSize: font.md, fontWeight: '600', color: colors.text, marginBottom: 4 },
  emptyApptSub:   { fontSize: font.sm, color: colors.textSub, textAlign: 'center', lineHeight: 20 },
  apptCard:       { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  apptCardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  apptCaseId:     { fontSize: font.xs, color: colors.textSub, fontFamily: 'monospace' },
  apptDetail:     { gap: 4 },
  apptDetailText: { fontSize: font.sm, color: colors.text },
  apptNotes:      { fontSize: font.xs, color: colors.textSub, backgroundColor: colors.card, borderRadius: radius.sm, padding: spacing.sm, marginTop: 4 },
  tipBox:         { backgroundColor: '#fefce8', borderRadius: radius.lg, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  tipTitle:       { fontSize: font.sm, fontWeight: '700', color: '#92400e', marginBottom: 6 },
  tipText:        { fontSize: font.sm, color: '#78350f', lineHeight: 20 },
});
