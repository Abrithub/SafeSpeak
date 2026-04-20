import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCases, updateStatus, addNote } from '../services/api';

const statusColor = {
  'Pending': '#f59e0b', 'Under Review': '#3b82f6',
  'In Progress': '#8b5cf6', 'Resolved': '#10b981', 'Rejected': '#6b7280',
};
const urgencyColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' };

export default function DashboardScreen({ navigation }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({});

  const load = async () => {
    const u = JSON.parse(await AsyncStorage.getItem('currentUser') || '{}');
    setUser(u);
    const data = await fetchCases();
    if (Array.isArray(data)) setCases(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('currentUser');
    await AsyncStorage.removeItem('adminAuth');
    navigation.replace('Login');
  };

  const handleStatus = async (caseId, status) => {
    setSaving(true);
    await updateStatus(caseId, status);
    await load();
    setSaving(false);
  };

  const handleNote = async (caseId) => {
    if (!note.trim()) return;
    setSaving(true);
    await addNote(caseId, note.trim());
    setNote('');
    await load();
    setSaving(false);
  };

  const selectedCase = cases.find(c => c.caseId === selected);
  const critical = cases.filter(c => c.urgency === 'High' && c.status === 'Pending');

  if (loading) return <View style={styles.center}><Text>Loading dashboard...</Text></View>;

  // Case detail view
  if (selected && selectedCase) {
    const stepIndex = ['Pending','Under Review','In Progress','Resolved'].indexOf(selectedCase.status);
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Cases</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.card}>
          <Text style={styles.caseIdText}>{selectedCase.caseId}</Text>
          <Text style={styles.classText}>{selectedCase.classification}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: (urgencyColor[selectedCase.urgency] || '#6b7280') + '20' }]}>
              <Text style={[styles.badgeText, { color: urgencyColor[selectedCase.urgency] }]}>{selectedCase.urgency} Priority</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: (statusColor[selectedCase.status] || '#6b7280') + '20' }]}>
              <Text style={[styles.badgeText, { color: statusColor[selectedCase.status] }]}>{selectedCase.status}</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Case Progress</Text>
          <View style={styles.progressRow}>
            {['Pending','Under Review','In Progress','Resolved'].map((s, i) => (
              <View key={s} style={styles.stepContainer}>
                <View style={[styles.stepDot, i <= stepIndex && styles.stepDotDone]}>
                  <Text style={[styles.stepNum, i <= stepIndex && styles.stepNumDone]}>{i+1}</Text>
                </View>
                <Text style={styles.stepLabel}>{s.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Score */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#1a2340' }]}>
          <Text style={styles.cardTitle}>🤖 AI Risk Score</Text>
          <Text style={styles.aiScore}>{selectedCase.aiScore} / 100</Text>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, { width: `${selectedCase.aiScore}%` }]} />
          </View>
          <Text style={styles.aiReason}>{selectedCase.aiReason}</Text>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.descText}>{selectedCase.description || 'No description provided.'}</Text>
        </View>

        {/* Status actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Status</Text>
          <View style={styles.statusBtns}>
            {['Under Review','In Progress','Resolved','Rejected'].map(s => (
              <TouchableOpacity key={s} onPress={() => handleStatus(selectedCase.caseId, s)} disabled={saving}
                style={[styles.statusBtn, selectedCase.status === s && styles.statusBtnActive]}>
                <Text style={[styles.statusBtnText, selectedCase.status === s && styles.statusBtnTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Internal Notes</Text>
          {(selectedCase.notes || []).length === 0 && <Text style={styles.emptyText}>No notes yet.</Text>}
          {(selectedCase.notes || []).map((n, i) => (
            <View key={i} style={styles.noteItem}>
              <Text style={styles.noteText}>{n.text}</Text>
              <Text style={styles.noteAuthor}>{n.author} · {new Date(n.createdAt).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.noteInput}>
            <TextInput value={note} onChangeText={setNote} placeholder="Add a note..."
              style={styles.noteField} multiline />
            <TouchableOpacity onPress={() => handleNote(selectedCase.caseId)} disabled={saving} style={styles.noteBtn}>
              <Text style={styles.noteBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // Main dashboard
  return (
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>

      {/* Header */}
      <View style={styles.dashHeader}>
        <View>
          <Text style={styles.dashTitle}>SafeSpeak Dashboard</Text>
          <Text style={styles.dashSub}>Signed in as {user.username}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Critical alert */}
      {critical.length > 0 && (
        <View style={styles.criticalBanner}>
          <Text style={styles.criticalText}>⚠️ {critical.length} Critical Case{critical.length > 1 ? 's' : ''} Need Immediate Attention</Text>
          <Text style={styles.criticalIds}>{critical.map(c => c.caseId).join(', ')}</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          ['Total', cases.length, '#1a2340'],
          ['Active', cases.filter(c => !['Resolved','Rejected'].includes(c.status)).length, '#3b82f6'],
          ['Resolved', cases.filter(c => c.status === 'Resolved').length, '#10b981'],
          ['Critical', critical.length, '#ef4444'],
        ].map(([label, val, color]) => (
          <View key={label} style={styles.statCard}>
            <Text style={[styles.statVal, { color }]}>{val}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Cases */}
      <Text style={styles.sectionHeader}>Case Queue</Text>
      {cases.map(c => (
        <TouchableOpacity key={c.caseId} style={[styles.caseCard, { borderLeftColor: urgencyColor[c.urgency] }]}
          onPress={() => setSelected(c.caseId)}>
          <View style={styles.caseCardTop}>
            <Text style={styles.caseCardId}>{c.caseId}</Text>
            <View style={[styles.badge, { backgroundColor: (statusColor[c.status] || '#6b7280') + '20' }]}>
              <Text style={[styles.badgeText, { color: statusColor[c.status] }]}>{c.status}</Text>
            </View>
          </View>
          <Text style={styles.caseCardClass}>{c.classification}</Text>
          <View style={styles.caseCardBottom}>
            <View style={[styles.urgencyDot, { backgroundColor: urgencyColor[c.urgency] }]} />
            <Text style={styles.caseCardUrgency}>{c.urgency}</Text>
            <Text style={styles.aiScoreSmall}>🤖 {c.aiScore}/100</Text>
            <Text style={styles.caseCardDate}>{new Date(c.createdAt).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8edf2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dashHeader: { backgroundColor: '#1a2340', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dashTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  dashSub: { fontSize: 11, color: '#ffffff70', marginTop: 2 },
  logoutBtn: { backgroundColor: '#ffffff20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 12 },
  criticalBanner: { backgroundColor: '#fef2f2', borderLeftWidth: 4, borderLeftColor: '#ef4444', margin: 12, borderRadius: 10, padding: 12 },
  criticalText: { fontSize: 13, fontWeight: 'bold', color: '#dc2626' },
  criticalIds: { fontSize: 11, color: '#ef4444', marginTop: 2 },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statVal: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#1a2340', paddingHorizontal: 12, marginBottom: 8 },
  caseCard: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 12, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  caseCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  caseCardId: { fontSize: 11, fontWeight: 'bold', color: '#374151', fontFamily: 'monospace' },
  caseCardClass: { fontSize: 15, fontWeight: '600', color: '#1a2340', marginBottom: 6 },
  caseCardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgencyDot: { width: 8, height: 8, borderRadius: 4 },
  caseCardUrgency: { fontSize: 11, color: '#6b7280', flex: 1 },
  aiScoreSmall: { fontSize: 11, color: '#1a2340', fontWeight: '600' },
  caseCardDate: { fontSize: 10, color: '#9ca3af' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  backBtn: { padding: 16 },
  backText: { color: '#0ea5e9', fontSize: 14 },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  caseIdText: { fontSize: 12, color: '#6b7280', fontFamily: 'monospace' },
  classText: { fontSize: 20, fontWeight: 'bold', color: '#1a2340', marginVertical: 6 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepContainer: { alignItems: 'center', flex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepDotDone: { backgroundColor: '#1a2340' },
  stepNum: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af' },
  stepNumDone: { color: '#fff' },
  stepLabel: { fontSize: 9, color: '#6b7280', textAlign: 'center' },
  aiScore: { fontSize: 28, fontWeight: 'bold', color: '#1a2340', marginBottom: 8 },
  scoreBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 8 },
  scoreBarFill: { height: 8, backgroundColor: '#1a2340', borderRadius: 4 },
  aiReason: { fontSize: 12, color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, lineHeight: 18 },
  descText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  statusBtnActive: { backgroundColor: '#1a2340', borderColor: '#1a2340' },
  statusBtnText: { fontSize: 12, color: '#374151' },
  statusBtnTextActive: { color: '#fff' },
  noteItem: { backgroundColor: '#fefce8', borderRadius: 8, padding: 10, marginBottom: 8 },
  noteText: { fontSize: 13, color: '#374151' },
  noteAuthor: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  noteInput: { flexDirection: 'row', gap: 8, marginTop: 8 },
  noteField: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 13, backgroundColor: '#f9fafb' },
  noteBtn: { backgroundColor: '#1a2340', paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center' },
  noteBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyText: { fontSize: 12, color: '#9ca3af' },
});
