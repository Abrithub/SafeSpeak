import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyCases } from '../services/api';

const statusColor = {
  'Pending': '#f59e0b', 'Under Review': '#3b82f6',
  'In Progress': '#8b5cf6', 'Resolved': '#10b981', 'Rejected': '#6b7280',
};

const urgencyColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' };

export default function MyCasesScreen({ navigation }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState({});
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const u = JSON.parse(await AsyncStorage.getItem('currentUser') || '{}');
    setUser(u);
    const data = await getMyCases();
    if (Array.isArray(data)) setCases(data);
    else if (data.message) Alert.alert('Error', data.message);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('currentUser');
    navigation.replace('Login');
  };

  const selectedCase = cases.find(c => c.caseId === selected);

  if (loading) return <View style={styles.center}><Text>Loading your cases...</Text></View>;

  if (selected && selectedCase) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.caseId}>{selectedCase.caseId}</Text>
          <Text style={styles.classification}>{selectedCase.classification}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor[selectedCase.status] + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColor[selectedCase.status] }]}>{selectedCase.status}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Case Progress</Text>
          <View style={styles.progressRow}>
            {['Pending', 'Under Review', 'In Progress', 'Resolved'].map((s, i) => {
              const steps = ['Pending', 'Under Review', 'In Progress', 'Resolved'];
              const current = steps.indexOf(selectedCase.status);
              const done = i <= current;
              return (
                <View key={s} style={styles.stepContainer}>
                  <View style={[styles.stepDot, done && styles.stepDotDone]}>
                    <Text style={[styles.stepNum, done && styles.stepNumDone]}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepLabel}>{s}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Messages */}
        {(selectedCase.messages || []).filter(m => m.from === 'admin').length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Messages from Support</Text>
            {selectedCase.messages.filter(m => m.from === 'admin').map((m, i) => (
              <View key={i} style={styles.message}>
                <Text style={styles.messageText}>{m.text}</Text>
                <Text style={styles.messageTime}>{new Date(m.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Appointments */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Appointments</Text>
          {(selectedCase.appointments || []).length === 0 ? (
            <Text style={styles.emptyText}>No appointments scheduled yet.</Text>
          ) : (
            selectedCase.appointments.map((a, i) => (
              <View key={i} style={styles.appt}>
                <Text style={styles.apptDate}>{a.date} at {a.time}</Text>
                <Text style={styles.apptLocation}>📍 {a.location}</Text>
                {a.notes ? <Text style={styles.apptNotes}>{a.notes}</Text> : null}
                <Text style={[styles.apptStatus, { color: a.status === 'Scheduled' ? '#3b82f6' : '#10b981' }]}>{a.status}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Cases</Text>
          <Text style={styles.headerSub}>Welcome, {user.username}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('Report')}>
        <Text style={styles.reportBtnText}>+ Submit New Report</Text>
      </TouchableOpacity>

      {cases.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No cases yet</Text>
          <Text style={styles.emptyText}>Submit a report and it will appear here.</Text>
        </View>
      ) : (
        cases.map(c => (
          <TouchableOpacity key={c.caseId} style={styles.caseCard} onPress={() => setSelected(c.caseId)}>
            <View style={styles.caseCardTop}>
              <Text style={styles.caseCardId}>{c.caseId}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor[c.status] + '20' }]}>
                <Text style={[styles.badgeText, { color: statusColor[c.status] }]}>{c.status}</Text>
              </View>
            </View>
            <Text style={styles.caseCardClass}>{c.classification}</Text>
            <View style={styles.caseCardBottom}>
              <View style={[styles.urgencyDot, { backgroundColor: urgencyColor[c.urgency] }]} />
              <Text style={styles.caseCardUrgency}>{c.urgency}</Text>
              <Text style={styles.caseCardDate}>{new Date(c.createdAt).toLocaleDateString()}</Text>
            </View>
            {(c.appointments || []).filter(a => a.status === 'Scheduled').length > 0 && (
              <Text style={styles.apptAlert}>📅 Appointment scheduled</Text>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1a2340' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 12, color: '#ffffff80' },
  logoutBtn: { backgroundColor: '#ffffff20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 13 },
  reportBtn: { margin: 16, backgroundColor: '#0d9488', padding: 14, borderRadius: 12, alignItems: 'center' },
  reportBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  caseCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  caseCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  caseCardId: { fontSize: 12, fontWeight: 'bold', color: '#374151', fontFamily: 'monospace' },
  caseCardClass: { fontSize: 16, fontWeight: '600', color: '#1a2340', marginBottom: 8 },
  caseCardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgencyDot: { width: 8, height: 8, borderRadius: 4 },
  caseCardUrgency: { fontSize: 12, color: '#6b7280', flex: 1 },
  caseCardDate: { fontSize: 11, color: '#9ca3af' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  apptAlert: { fontSize: 12, color: '#3b82f6', marginTop: 6, fontWeight: '500' },
  card: { backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  caseId: { fontSize: 13, color: '#6b7280', fontFamily: 'monospace' },
  classification: { fontSize: 20, fontWeight: 'bold', color: '#1a2340', marginVertical: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepContainer: { alignItems: 'center', flex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepDotDone: { backgroundColor: '#0d9488' },
  stepNum: { fontSize: 12, fontWeight: 'bold', color: '#9ca3af' },
  stepNumDone: { color: '#fff' },
  stepLabel: { fontSize: 9, color: '#6b7280', textAlign: 'center' },
  message: { backgroundColor: '#f0fdf4', borderRadius: 8, padding: 12, marginBottom: 8 },
  messageText: { fontSize: 14, color: '#374151' },
  messageTime: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  appt: { backgroundColor: '#eff6ff', borderRadius: 8, padding: 12, marginBottom: 8 },
  apptDate: { fontSize: 14, fontWeight: '600', color: '#1e40af' },
  apptLocation: { fontSize: 13, color: '#374151', marginTop: 4 },
  apptNotes: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  apptStatus: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  backBtn: { padding: 16 },
  backText: { color: '#0ea5e9', fontSize: 15 },
});
