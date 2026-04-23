import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert, TextInput, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyCases, sendReporterMessage } from '../services/api';

const STATUS_COLOR = {
  'Pending': '#f59e0b', 'Under Review': '#3b82f6',
  'In Progress': '#8b5cf6', 'Resolved': '#10b981', 'Rejected': '#6b7280', 'Archived': '#64748b',
};
const URGENCY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' };

const NEXT_STEPS = {
  'Pending':       { icon: '⏳', color: '#fef9c3', border: '#fde047', text: 'Your report is waiting to be reviewed. This usually takes 24–48 hours.' },
  'Under Review':  { icon: '🔍', color: '#eff6ff', border: '#bfdbfe', text: 'A case officer is reviewing your report. They may contact you for more information.' },
  'In Progress':   { icon: '⚙️', color: '#f5f3ff', border: '#ddd6fe', text: 'Your case is actively being handled. Check the referral section below for details.' },
  'Resolved':      { icon: '✅', color: '#f0fdf4', border: '#bbf7d0', text: 'Your case has been resolved. If you have further concerns, submit a new report.' },
  'Rejected':      { icon: '❌', color: '#f9fafb', border: '#e5e7eb', text: 'Your case could not be processed. You can submit a new report with more details.' },
};

export default function MyCasesScreen({ navigation }) {
  const [cases, setCases]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser]         = useState({});
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');

  const load = async () => {
    const u = JSON.parse(await AsyncStorage.getItem('currentUser') || '{}');
    setUser(u);
    try {
      const data = await getMyCases();
      if (Array.isArray(data)) setCases(data);
      else if (data.message) Alert.alert('Error', data.message);
    } catch {
      Alert.alert('Connection Error', 'Could not load cases. Please check your connection.');
    }
    setLoading(false);
    setRefreshing(false);
  };

  const sendReply = async (caseId) => {
    if (!replyText.trim()) { setReplyError('Please type a message'); return; }
    if (replyText.trim().length > 500) { setReplyError('Message too long (max 500 chars)'); return; }
    setReplyError('');
    setReplying(true);
    try {
      await sendReporterMessage(caseId, replyText.trim());
      setReplyText('');
      await load();
    } catch { Alert.alert('Error', 'Could not send message. Please try again.'); }
    setReplying(false);
  };

  useEffect(() => { load(); }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('currentUser');
    navigation.replace('Login');
  };

  const selectedCase = cases.find(c => c.caseId === selected);

  if (loading) return (
    <View style={st.center}>
      <Text style={st.loadingText}>Loading your cases...</Text>
    </View>
  );

  if (selected && selectedCase) {
    const stepIndex = ['Pending','Under Review','In Progress','Resolved'].indexOf(selectedCase.status);
    const nextStep = NEXT_STEPS[selectedCase.status];

    return (
      <ScrollView style={st.container}>
        <TouchableOpacity onPress={() => setSelected(null)} style={st.backBtn}>
          <Text style={st.backText}>← Back to My Cases</Text>
        </TouchableOpacity>

  // Detail view — status card (no urgency badge)
        <View style={st.card}>
          <Text style={st.caseIdMono}>{selectedCase.caseId}</Text>
          <Text style={st.classTitle}>{selectedCase.classification}</Text>
          <View style={st.badgeRow}>
            <View style={[st.badge, { backgroundColor: (STATUS_COLOR[selectedCase.status] || '#6b7280') + '22' }]}>
              <Text style={[st.badgeText, { color: STATUS_COLOR[selectedCase.status] || '#6b7280' }]}>{selectedCase.status}</Text>
            </View>
          </View>
          <Text style={st.submittedAt}>Submitted: {new Date(selectedCase.createdAt).toLocaleDateString()}</Text>
        </View>

        {/* Progress bar */}
        <View style={st.card}>
          <Text style={st.sectionTitle}>Case Progress</Text>
          <View style={st.progressRow}>
            {['Pending','Under Review','In Progress','Resolved'].map((s, i) => (
              <View key={s} style={st.stepContainer}>
                <View style={[st.stepDot, i <= stepIndex && st.stepDotDone]}>
                  <Text style={[st.stepNum, i <= stepIndex && st.stepNumDone]}>{i < stepIndex ? '✓' : i + 1}</Text>
                </View>
                <Text style={[st.stepLabel, i <= stepIndex && { color: '#0d9488' }]}>{s.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* What happens next */}
        {nextStep && (
          <View style={[st.nextCard, { backgroundColor: nextStep.color, borderColor: nextStep.border }]}>
            <Text style={st.nextTitle}>{nextStep.icon} What happens next?</Text>
            <Text style={st.nextText}>{nextStep.text}</Text>
          </View>
        )}

        {/* What you reported */}
        {selectedCase.description ? (
          <View style={st.card}>
            <Text style={st.sectionTitle}>📋 What You Reported</Text>
            {(selectedCase.abuseTypes || []).length > 0 && (
              <View style={st.tagsRow}>
                {selectedCase.abuseTypes.map(t => (
                  <View key={t} style={st.tag}><Text style={st.tagText}>{t}</Text></View>
                ))}
              </View>
            )}
            <Text style={st.descText}>{selectedCase.description}</Text>
            <View style={st.metaGrid}>
              {selectedCase.whenDidItHappen && <Text style={st.metaItem}>📅 {selectedCase.whenDidItHappen}</Text>}
              {selectedCase.isVictimSafe && <Text style={st.metaItem}>🛡️ Safe: {selectedCase.isVictimSafe}</Text>}
            </View>
          </View>
        ) : null}

        {/* Referral info */}
        {selectedCase.referral?.type && (
          <View style={[st.referralCard, {
            borderLeftColor: selectedCase.referral.type === 'police' ? '#3b82f6' :
              selectedCase.referral.type === 'court' ? '#f59e0b' : '#f97316'
          }]}>
            <Text style={st.referralTitle}>
              {selectedCase.referral.type === 'police' ? '🚔 Referred to Police Station' :
               selectedCase.referral.type === 'court'  ? '⚖️ Court Date Scheduled' :
               '📋 Additional Information Requested'}
            </Text>
            {selectedCase.referral.stationName  && <Text style={st.referralDetail}>🏢 {selectedCase.referral.stationName}</Text>}
            {selectedCase.referral.stationAddress && <Text style={st.referralDetail}>📍 {selectedCase.referral.stationAddress}</Text>}
            {selectedCase.referral.officerName  && <Text style={st.referralDetail}>👮 {selectedCase.referral.officerName}</Text>}
            {selectedCase.referral.officerPhone && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${selectedCase.referral.officerPhone}`)}>
                <Text style={[st.referralDetail, { color: '#3b82f6', textDecorationLine: 'underline' }]}>
                  📞 {selectedCase.referral.officerPhone}
                </Text>
              </TouchableOpacity>
            )}
            {selectedCase.referral.courtName   && <Text style={st.referralDetail}>⚖️ {selectedCase.referral.courtName}</Text>}
            {selectedCase.referral.courtDate   && <Text style={st.referralDetail}>📅 {selectedCase.referral.courtDate} at {selectedCase.referral.courtTime}</Text>}
            {selectedCase.referral.courtRoom   && <Text style={st.referralDetail}>🚪 Room: {selectedCase.referral.courtRoom}</Text>}
            {selectedCase.referral.infoRequest && <Text style={st.referralDetail}>📋 {selectedCase.referral.infoRequest}</Text>}
            {selectedCase.referral.referralNote && (
              <View style={st.referralNote}>
                <Text style={st.referralNoteText}>Note: {selectedCase.referral.referralNote}</Text>
              </View>
            )}
            {selectedCase.referral.type === 'police' && (
              <Text style={st.referralHint}>Please visit the station and mention Case ID: {selectedCase.caseId}</Text>
            )}
            {selectedCase.referral.type === 'court' && (
              <Text style={[st.referralHint, { color: '#dc2626' }]}>⚠️ Arrive 30 minutes early. Bring a valid ID.</Text>
            )}
          </View>
        )}

        {/* Secure messages */}
        <View style={st.card}>
          <Text style={st.sectionTitle}>💬 Secure Messages</Text>
          {(selectedCase.messages || []).length === 0 ? (
            <Text style={st.emptyText}>No messages yet. The support team will contact you here if needed.</Text>
          ) : (
            (selectedCase.messages || []).map((m, i) => (
              <View key={i} style={[st.msgBubble, m.from === 'admin' ? st.msgAdmin : st.msgReporter]}>
                <Text style={[st.msgText, m.from !== 'admin' && { color: '#fff' }]}>{m.text}</Text>
                <Text style={[st.msgTime, m.from !== 'admin' && { color: 'rgba(255,255,255,0.6)' }]}>
                  {m.from === 'admin' ? 'Support Team' : 'You'} · {new Date(m.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
          <View style={st.replyRow}>
            <TextInput
              style={[st.replyInput, replyError && { borderColor: '#ef4444' }]}
              placeholder="Reply to support team..."
              value={replyText}
              onChangeText={t => { setReplyText(t); setReplyError(''); }}
              placeholderTextColor="#9ca3af"
              maxLength={500}
            />
            <TouchableOpacity style={[st.replyBtn, replying && { opacity: 0.6 }]}
              onPress={() => sendReply(selectedCase.caseId)} disabled={replying}>
              <Text style={st.replyBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
          {replyError ? <Text style={st.errorText}>{replyError}</Text> : null}
          <Text style={st.charCount}>{replyText.length}/500</Text>
        </View>

        {/* Appointments */}
        <View style={st.card}>
          <Text style={st.sectionTitle}>📅 Appointments</Text>
          {(selectedCase.appointments || []).length === 0 ? (
            <Text style={st.emptyText}>No appointments scheduled yet. You will be notified here and by email.</Text>
          ) : (
            selectedCase.appointments.map((a, i) => (
              <View key={i} style={st.apptCard}>
                <View style={st.apptHeader}>
                  <Text style={st.apptType}>
                    {a.type === 'court' ? '⚖️' : a.type === 'safespeak_office' ? '🏢' : '🚔'} {a.date} at {a.time}
                  </Text>
                  <View style={[st.badge, { backgroundColor: a.status === 'Scheduled' ? '#dbeafe' : '#dcfce7' }]}>
                    <Text style={[st.badgeText, { color: a.status === 'Scheduled' ? '#1d4ed8' : '#166534' }]}>{a.status}</Text>
                  </View>
                </View>
                <Text style={st.apptDetail}>📍 {a.location}</Text>
                {a.stationName  && <Text style={st.apptDetail}>🏢 {a.stationName}</Text>}
                {a.officerName  && <Text style={st.apptDetail}>👮 {a.officerName}</Text>}
                {a.officerPhone && (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${a.officerPhone}`)}>
                    <Text style={[st.apptDetail, { color: '#3b82f6', textDecorationLine: 'underline' }]}>📞 {a.officerPhone}</Text>
                  </TouchableOpacity>
                )}
                {a.purpose && (
                  <View style={st.purposeBox}>
                    <Text style={st.purposeTitle}>📋 What to bring:</Text>
                    <Text style={st.purposeText}>{a.purpose}</Text>
                  </View>
                )}
                {a.outcome && a.outcome !== 'pending' && (
                  <View style={st.outcomeBox}>
                    <Text style={st.outcomeText}>Outcome: {a.outcome.replace(/_/g, ' ')}</Text>
                    {a.outcomeNote ? <Text style={st.outcomeNote}>{a.outcomeNote}</Text> : null}
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={st.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>

      {/* Header */}
      <View style={st.header}>
        <View>
          <Text style={st.headerTitle}>My Cases</Text>
          <Text style={st.headerSub}>Welcome, {user.username}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={st.logoutBtn}>
          <Text style={st.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency contacts */}
      <View style={st.emergencyBar}>
        <Text style={st.emergencyLabel}>🚨 Emergency:</Text>
        <TouchableOpacity onPress={() => Linking.openURL('tel:+251965485715')}>
          <Text style={st.emergencyNum}>+251 965 485 715</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={st.reportBtn} onPress={() => navigation.navigate('Main', { screen: 'Report' })}>
        <Text style={st.reportBtnText}>+ Submit New Report</Text>
      </TouchableOpacity>

      {cases.length === 0 ? (
        <View style={st.center}>
          <Text style={st.emptyIcon}>📋</Text>
          <Text style={st.emptyTitle}>No cases yet</Text>
          <Text style={st.emptyText}>Submit a report and it will appear here.</Text>
        </View>
      ) : (
        cases.map(c => (
          <TouchableOpacity key={c.caseId} style={[st.caseCard, { borderLeftColor: STATUS_COLOR[c.status] || '#6b7280' }]}
            onPress={() => setSelected(c.caseId)}>
            <View style={st.caseCardTop}>
              <Text style={st.caseCardId}>{c.caseId}</Text>
              <View style={[st.badge, { backgroundColor: (STATUS_COLOR[c.status] || '#6b7280') + '22' }]}>
                <Text style={[st.badgeText, { color: STATUS_COLOR[c.status] || '#6b7280' }]}>{c.status}</Text>
              </View>
            </View>
            <Text style={st.caseCardClass}>{c.classification}</Text>
            <View style={st.caseCardBottom}>
              <Text style={st.caseCardDate}>{new Date(c.createdAt).toLocaleDateString()}</Text>
            </View>
            {(c.messages || []).filter(m => m.from === 'admin').length > 0 && (
              <Text style={st.alertBadge}>💬 New message</Text>
            )}
            {(c.appointments || []).filter(a => a.status === 'Scheduled').length > 0 && (
              <Text style={st.alertBadge}>📅 Appointment scheduled</Text>
            )}
            {c.referral?.type && (
              <Text style={st.alertBadge}>
                {c.referral.type === 'police' ? '🚔 Referred to Police' :
                 c.referral.type === 'court'  ? '⚖️ Court date scheduled' : '📋 Info requested'}
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}



const st = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f9fafb' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText:    { color: '#6b7280', fontSize: 14 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1a2340' },
  headerTitle:    { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub:      { fontSize: 12, color: '#ffffff80' },
  logoutBtn:      { backgroundColor: '#ffffff20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText:     { color: '#fff', fontSize: 13 },
  emergencyBar:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fee2e2', paddingHorizontal: 16, paddingVertical: 8 },
  emergencyLabel: { fontSize: 12, fontWeight: '600', color: '#dc2626' },
  emergencyNum:   { fontSize: 12, color: '#dc2626', textDecorationLine: 'underline', fontWeight: '700' },
  reportBtn:      { margin: 16, backgroundColor: '#0d9488', padding: 14, borderRadius: 12, alignItems: 'center' },
  reportBtnText:  { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  caseCard:       { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, borderLeftWidth: 4, elevation: 2 },
  caseCardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  caseCardId:     { fontSize: 12, fontWeight: 'bold', color: '#374151', fontFamily: 'monospace' },
  caseCardClass:  { fontSize: 16, fontWeight: '600', color: '#1a2340', marginBottom: 8 },
  caseCardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgencyDot:     { width: 8, height: 8, borderRadius: 4 },
  caseCardUrgency:{ fontSize: 12, color: '#6b7280', flex: 1 },
  caseCardDate:   { fontSize: 11, color: '#9ca3af' },
  alertBadge:     { fontSize: 11, color: '#0d9488', marginTop: 4, fontWeight: '500' },
  badge:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:      { fontSize: 11, fontWeight: '600' },
  backBtn:        { padding: 16 },
  backText:       { color: '#0ea5e9', fontSize: 15 },
  card:           { backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 12, padding: 16, elevation: 2 },
  caseIdMono:     { fontSize: 12, color: '#6b7280', fontFamily: 'monospace' },
  classTitle:     { fontSize: 20, fontWeight: 'bold', color: '#1a2340', marginVertical: 6 },
  badgeRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  submittedAt:    { fontSize: 11, color: '#9ca3af' },
  sectionTitle:   { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  progressRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  stepContainer:  { alignItems: 'center', flex: 1 },
  stepDot:        { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepDotDone:    { backgroundColor: '#0d9488' },
  stepNum:        { fontSize: 11, fontWeight: 'bold', color: '#9ca3af' },
  stepNumDone:    { color: '#fff' },
  stepLabel:      { fontSize: 9, color: '#6b7280', textAlign: 'center' },
  nextCard:       { margin: 16, marginBottom: 0, borderRadius: 12, padding: 14, borderWidth: 1 },
  nextTitle:      { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 4 },
  nextText:       { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  tagsRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag:            { backgroundColor: '#fee2e2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText:        { fontSize: 11, color: '#dc2626', fontWeight: '600' },
  descText:       { fontSize: 13, color: '#374151', lineHeight: 20, backgroundColor: '#f9fafb', borderRadius: 8, padding: 10 },
  metaGrid:       { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaItem:       { fontSize: 11, color: '#6b7280' },
  referralCard:   { margin: 16, marginBottom: 0, borderRadius: 12, padding: 14, backgroundColor: '#f8fafc', borderLeftWidth: 4 },
  referralTitle:  { fontSize: 14, fontWeight: '700', color: '#1a2340', marginBottom: 8 },
  referralDetail: { fontSize: 13, color: '#374151', marginBottom: 4 },
  referralNote:   { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginTop: 6 },
  referralNoteText:{ fontSize: 12, color: '#374151' },
  referralHint:   { fontSize: 12, fontWeight: '600', color: '#1d4ed8', marginTop: 8 },
  msgBubble:      { borderRadius: 10, padding: 12, marginBottom: 8, maxWidth: '90%' },
  msgAdmin:       { backgroundColor: '#f0fdf4', alignSelf: 'flex-start' },
  msgReporter:    { backgroundColor: '#1a2340', alignSelf: 'flex-end' },
  msgText:        { fontSize: 13, color: '#374151', lineHeight: 20 },
  msgTime:        { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  replyRow:       { flexDirection: 'row', gap: 8, marginTop: 8 },
  replyInput:     { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#374151' },
  replyBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0d9488', justifyContent: 'center', alignItems: 'center' },
  replyBtnText:   { color: '#fff', fontSize: 16 },
  errorText:      { fontSize: 11, color: '#ef4444', marginTop: 4 },
  charCount:      { fontSize: 10, color: '#9ca3af', textAlign: 'right', marginTop: 2 },
  apptCard:       { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, marginBottom: 8 },
  apptHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  apptType:       { fontSize: 13, fontWeight: '700', color: '#1e40af', flex: 1 },
  apptDetail:     { fontSize: 13, color: '#374151', marginBottom: 3 },
  purposeBox:     { backgroundColor: '#fef9c3', borderRadius: 8, padding: 8, marginTop: 6 },
  purposeTitle:   { fontSize: 11, fontWeight: '700', color: '#78350f', marginBottom: 2 },
  purposeText:    { fontSize: 12, color: '#78350f' },
  outcomeBox:     { backgroundColor: '#f0fdf4', borderRadius: 8, padding: 8, marginTop: 6 },
  outcomeText:    { fontSize: 12, fontWeight: '600', color: '#166534' },
  outcomeNote:    { fontSize: 12, color: '#374151', marginTop: 2 },
  emptyIcon:      { fontSize: 48, marginBottom: 12 },
  emptyTitle:     { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptyText:      { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
});
