import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCases, updateStatus, addNote, sendAdminMessage, fetchStats, BASE_URL } from '../services/api';

const scheduleAppointment = async (data) => {
  const token = await AsyncStorage.getItem('token');
  return fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then(r => r.json());
};

const referCaseAPI = async (caseId, data) => {
  const token = await AsyncStorage.getItem('token');
  return fetch(`${BASE_URL}/cases/${caseId}/refer`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then(r => r.json());
};

const statusColor = {
  'Pending': '#f59e0b', 'Under Review': '#3b82f6',
  'In Progress': '#8b5cf6', 'Resolved': '#10b981', 'Rejected': '#6b7280',
};
const urgencyColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' };

const NAV_TABS = [
  { key: 'home',     icon: '🏠', label: 'Home' },
  { key: 'cases',    icon: '📋', label: 'Cases' },
  { key: 'analytics',icon: '📊', label: 'Analytics' },
  { key: 'activity', icon: '📜', label: 'Activity' },
  { key: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function DashboardScreen({ navigation }) {
  const [cases, setCases]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [note, setNote]         = useState('');
  const [msg, setMsg]           = useState('');
  const [saving, setSaving]     = useState(false);
  const [user, setUser]         = useState({});
  const [notifOpen, setNotifOpen] = useState(false);
  const [filterUrgency, setFilterUrgency] = useState('All');

  // Appointment modal state
  const [apptModal, setApptModal] = useState(false);
  const [appt, setAppt] = useState({ type: 'police_station', date: '', time: '', location: '', stationName: '', officerName: '', officerPhone: '', courtName: '', courtRoom: '', judge: '', purpose: '' });

  // Referral modal state
  const [referModal, setReferModal] = useState(false);
  const [refer, setRefer] = useState({ type: 'police', stationName: '', stationAddress: '', officerName: '', officerPhone: '', referralNote: '' });

  const load = async () => {
    const u = JSON.parse(await AsyncStorage.getItem('currentUser') || '{}');
    setUser(u);
    const [data, statsData] = await Promise.all([fetchCases(), fetchStats().catch(() => null)]);
    if (Array.isArray(data)) setCases(data);
    if (statsData) setStats(statsData);
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

  const handleMessage = async (caseId) => {
    if (!msg.trim()) return;
    setSaving(true);
    await sendAdminMessage(caseId, msg.trim());
    setMsg('');
    await load();
    setSaving(false);
  };

  const handleScheduleAppt = async (caseId) => {
    if (!appt.date || !appt.time || !appt.location) {
      Alert.alert('Required', 'Please fill in date, time, and location'); return;
    }
    setSaving(true);
    try {
      await scheduleAppointment({ ...appt, caseId });
      setApptModal(false);
      setAppt({ type: 'police_station', date: '', time: '', location: '', stationName: '', officerName: '', officerPhone: '', courtName: '', courtRoom: '', judge: '', purpose: '' });
      await load();
      Alert.alert('✅ Done', 'Appointment scheduled and reporter notified by email.');
    } catch { Alert.alert('Error', 'Failed to schedule appointment'); }
    setSaving(false);
  };

  const handleRefer = async (caseId) => {
    if (!refer.stationName && refer.type === 'police') {
      Alert.alert('Required', 'Please enter station name'); return;
    }
    setSaving(true);
    try {
      await referCaseAPI(caseId, refer);
      setReferModal(false);
      setRefer({ type: 'police', stationName: '', stationAddress: '', officerName: '', officerPhone: '', referralNote: '' });
      await load();
      Alert.alert('✅ Done', 'Case referred and reporter notified.');
    } catch { Alert.alert('Error', 'Failed to refer case'); }
    setSaving(false);
  };

  const selectedCase = cases.find(c => c.caseId === selected);
  const critical = cases.filter(c => c.urgency === 'High' && c.status === 'Pending');
  const filtered = filterUrgency === 'All' ? cases : cases.filter(c => c.urgency === filterUrgency);

  if (loading) return <View style={st.center}><Text>Loading dashboard...</Text></View>;

  // ── CASE DETAIL ──────────────────────────────────────────────────────────
  if (selected && selectedCase) {
    const stepIndex = ['Pending','Under Review','In Progress','Resolved'].indexOf(selectedCase.status);
    return (
      <ScrollView style={st.container}>
        <TouchableOpacity onPress={() => setSelected(null)} style={st.backBtn}>
          <Text style={st.backText}>← Back to Cases</Text>
        </TouchableOpacity>
        <View style={st.card}>
          <Text style={st.caseIdText}>{selectedCase.caseId}</Text>
          <Text style={st.classText}>{selectedCase.classification}</Text>
          <View style={st.badgeRow}>
            <View style={[st.badge, { backgroundColor: (urgencyColor[selectedCase.urgency]||'#6b7280')+'20' }]}>
              <Text style={[st.badgeText, { color: urgencyColor[selectedCase.urgency] }]}>{selectedCase.urgency} Priority</Text>
            </View>
            <View style={[st.badge, { backgroundColor: (statusColor[selectedCase.status]||'#6b7280')+'20' }]}>
              <Text style={[st.badgeText, { color: statusColor[selectedCase.status] }]}>{selectedCase.status}</Text>
            </View>
          </View>
        </View>
        <View style={st.card}>
          <Text style={st.cardTitle}>Case Progress</Text>
          <View style={st.progressRow}>
            {['Pending','Under Review','In Progress','Resolved'].map((s,i) => (
              <View key={s} style={st.stepContainer}>
                <View style={[st.stepDot, i<=stepIndex && st.stepDotDone]}>
                  <Text style={[st.stepNum, i<=stepIndex && st.stepNumDone]}>{i+1}</Text>
                </View>
                <Text style={st.stepLabel}>{s.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[st.card, { borderLeftWidth:4, borderLeftColor:'#1a2340' }]}>
          <Text style={st.cardTitle}>🤖 AI Risk Score</Text>
          <Text style={st.aiScore}>{selectedCase.aiScore} / 100</Text>
          <View style={st.scoreBar}><View style={[st.scoreBarFill, { width:`${selectedCase.aiScore}%` }]} /></View>
          <Text style={st.aiReason}>{selectedCase.aiReason}</Text>
        </View>
        <View style={st.card}>
          <Text style={st.cardTitle}>Description</Text>
          <Text style={st.descText}>{selectedCase.description || 'No description provided.'}</Text>
        </View>
        <View style={st.card}>
          <Text style={st.cardTitle}>Update Status</Text>
          <View style={st.statusBtns}>
            {['Under Review','In Progress','Resolved','Rejected'].map(s => (
              <TouchableOpacity key={s} onPress={() => handleStatus(selectedCase.caseId, s)} disabled={saving}
                style={[st.statusBtn, selectedCase.status===s && st.statusBtnActive]}>
                <Text style={[st.statusBtnText, selectedCase.status===s && st.statusBtnTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={st.card}>
          <Text style={st.cardTitle}>📝 Internal Notes</Text>
          {(selectedCase.notes||[]).length===0 && <Text style={st.emptyText}>No notes yet.</Text>}
          {(selectedCase.notes||[]).map((n,i) => (
            <View key={i} style={st.noteItem}>
              <Text style={st.noteText}>{n.text}</Text>
              <Text style={st.noteAuthor}>{n.author} · {new Date(n.createdAt).toLocaleString()}</Text>
            </View>
          ))}
          <View style={st.noteInput}>
            <TextInput value={note} onChangeText={setNote} placeholder="Add a note..." style={st.noteField} multiline />
            <TouchableOpacity onPress={() => handleNote(selectedCase.caseId)} disabled={saving} style={st.noteBtn}>
              <Text style={st.noteBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Message Reporter */}
        <View style={st.card}>
          <Text style={st.cardTitle}>💬 Message Reporter</Text>
          <View style={st.msgList}>
            {(selectedCase.messages||[]).map((m,i) => (
              <View key={i} style={[st.msgBubble, m.from==='admin' ? st.msgAdmin : st.msgReporter]}>
                <Text style={[st.msgText, m.from!=='admin' && { color:'#374151' }]}>{m.text}</Text>
                <Text style={[st.msgTime, m.from!=='admin' && { color:'#9ca3af' }]}>{m.from==='admin'?'You':'Reporter'} · {new Date(m.createdAt).toLocaleTimeString()}</Text>
              </View>
            ))}
          </View>
          <View style={st.noteInput}>
            <TextInput value={msg} onChangeText={setMsg} placeholder="Type message..." style={st.noteField} multiline />
            <TouchableOpacity onPress={() => handleMessage(selectedCase.caseId)} disabled={saving} style={[st.noteBtn,{backgroundColor:'#10b981'}]}>
              <Text style={st.noteBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action buttons */}
        <View style={st.card}>
          <Text style={st.cardTitle}>⚡ Actions</Text>          <View style={st.actionBtns}>
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#3b82f6' }]} onPress={() => setApptModal(true)}>
              <Text style={st.actionBtnText}>📅 Schedule Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#8b5cf6' }]} onPress={() => setReferModal(true)}>
              <Text style={st.actionBtnText}>🚔 Refer / Assign Officer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Appointment Modal */}
        <Modal visible={apptModal} transparent animationType="slide" onRequestClose={() => setApptModal(false)}>
          <View style={st.modalBg2}>
            <ScrollView style={st.modalSheet} keyboardShouldPersistTaps="handled">
              <Text style={st.modalTitle}>📅 Schedule Appointment</Text>
              <Text style={st.mLabel}>Type</Text>
              <View style={st.radioRow}>
                {[['police_station','🚔 Police'],['court','⚖️ Court'],['safespeak_office','🏢 Office']].map(([v,l]) => (
                  <TouchableOpacity key={v} onPress={() => setAppt(a => ({ ...a, type: v }))}
                    style={[st.radioBtn, appt.type === v && st.radioBtnActive]}>
                    <Text style={[st.radioText, appt.type === v && { color: '#fff' }]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {[['date','Date (e.g. 2025-05-20)'],['time','Time (e.g. 10:00 AM)'],['location','Location / Address']].map(([k,p]) => (
                <View key={k}>
                  <Text style={st.mLabel}>{p} *</Text>
                  <TextInput style={st.mInput} placeholder={p} value={appt[k]} onChangeText={v => setAppt(a => ({ ...a, [k]: v }))} placeholderTextColor="#9ca3af" />
                </View>
              ))}
              {appt.type === 'police_station' && [['stationName','Station Name'],['officerName','Officer Name'],['officerPhone','Officer Phone']].map(([k,p]) => (
                <View key={k}>
                  <Text style={st.mLabel}>{p}</Text>
                  <TextInput style={st.mInput} placeholder={p} value={appt[k]} onChangeText={v => setAppt(a => ({ ...a, [k]: v }))} placeholderTextColor="#9ca3af" />
                </View>
              ))}
              {appt.type === 'court' && [['courtName','Court Name'],['courtRoom','Room / Hall'],['judge','Judge Name']].map(([k,p]) => (
                <View key={k}>
                  <Text style={st.mLabel}>{p}</Text>
                  <TextInput style={st.mInput} placeholder={p} value={appt[k]} onChangeText={v => setAppt(a => ({ ...a, [k]: v }))} placeholderTextColor="#9ca3af" />
                </View>
              ))}
              <Text style={st.mLabel}>What to bring / Purpose</Text>
              <TextInput style={[st.mInput, { height: 80 }]} placeholder="e.g. Bring valid ID" value={appt.purpose}
                onChangeText={v => setAppt(a => ({ ...a, purpose: v }))} multiline textAlignVertical="top" placeholderTextColor="#9ca3af" />
              <View style={st.modalBtns}>
                <TouchableOpacity style={st.modalCancelBtn} onPress={() => setApptModal(false)}>
                  <Text style={st.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[st.modalConfirmBtn, saving && { opacity: 0.6 }]}
                  onPress={() => handleScheduleAppt(selectedCase.caseId)} disabled={saving}>
                  <Text style={st.modalConfirmText}>{saving ? 'Scheduling...' : 'Schedule & Notify'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* Refer / Assign Officer Modal */}
        <Modal visible={referModal} transparent animationType="slide" onRequestClose={() => setReferModal(false)}>
          <View style={st.modalBg2}>
            <ScrollView style={st.modalSheet} keyboardShouldPersistTaps="handled">
              <Text style={st.modalTitle}>🚔 Refer Case / Assign Officer</Text>
              <Text style={st.mLabel}>Referral Type</Text>
              <View style={st.radioRow}>
                {[['police','🚔 Police'],['court','⚖️ Court'],['info_request','📋 Info Request']].map(([v,l]) => (
                  <TouchableOpacity key={v} onPress={() => setRefer(r => ({ ...r, type: v }))}
                    style={[st.radioBtn, refer.type === v && st.radioBtnActive]}>
                    <Text style={[st.radioText, refer.type === v && { color: '#fff' }]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {refer.type === 'police' && [['stationName','Station Name *'],['stationAddress','Station Address'],['officerName','Officer Name'],['officerPhone','Officer Phone']].map(([k,p]) => (
                <View key={k}>
                  <Text style={st.mLabel}>{p}</Text>
                  <TextInput style={st.mInput} placeholder={p.replace(' *','')} value={refer[k] || ''} onChangeText={v => setRefer(r => ({ ...r, [k]: v }))} placeholderTextColor="#9ca3af" />
                </View>
              ))}
              {refer.type === 'court' && [['courtName','Court Name'],['courtDate','Court Date'],['courtTime','Court Time'],['courtRoom','Room'],['judge','Judge']].map(([k,p]) => (
                <View key={k}>
                  <Text style={st.mLabel}>{p}</Text>
                  <TextInput style={st.mInput} placeholder={p} value={refer[k] || ''} onChangeText={v => setRefer(r => ({ ...r, [k]: v }))} placeholderTextColor="#9ca3af" />
                </View>
              ))}
              {refer.type === 'info_request' && <>
                <Text style={st.mLabel}>Information Required</Text>
                <TextInput style={[st.mInput, { height: 80 }]} placeholder="What info is needed?"
                  value={refer.infoRequest || ''} onChangeText={v => setRefer(r => ({ ...r, infoRequest: v }))} multiline textAlignVertical="top" placeholderTextColor="#9ca3af" />
                <Text style={st.mLabel}>Deadline</Text>
                <TextInput style={st.mInput} placeholder="e.g. 2025-05-25" value={refer.infoDeadline || ''} onChangeText={v => setRefer(r => ({ ...r, infoDeadline: v }))} placeholderTextColor="#9ca3af" />
              </>}
              <Text style={st.mLabel}>Note to Reporter</Text>
              <TextInput style={[st.mInput, { height: 80 }]} placeholder="Optional note"
                value={refer.referralNote} onChangeText={v => setRefer(r => ({ ...r, referralNote: v }))} multiline textAlignVertical="top" placeholderTextColor="#9ca3af" />
              <View style={st.modalBtns}>
                <TouchableOpacity style={st.modalCancelBtn} onPress={() => setReferModal(false)}>
                  <Text style={st.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[st.modalConfirmBtn, { backgroundColor: '#8b5cf6' }, saving && { opacity: 0.6 }]}
                  onPress={() => handleRefer(selectedCase.caseId)} disabled={saving}>
                  <Text style={st.modalConfirmText}>{saving ? 'Referring...' : 'Refer & Notify'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        <View style={{ height: 80 }} />
      </ScrollView>
    );
  }

  // ── ANALYTICS TAB ────────────────────────────────────────────────────────
  const AnalyticsView = () => {
    const byType = stats?.byType || [];
    const byUrgency = [
      { label: 'High', value: cases.filter(c=>c.urgency==='High').length, color: '#ef4444' },
      { label: 'Medium', value: cases.filter(c=>c.urgency==='Medium').length, color: '#f59e0b' },
      { label: 'Low', value: cases.filter(c=>c.urgency==='Low').length, color: '#3b82f6' },
    ];
    const maxVal = Math.max(...byUrgency.map(d=>d.value), 1);
    return (
      <ScrollView style={st.container}>
        <View style={st.tabHeader}><Text style={st.tabHeaderTitle}>📊 Analytics</Text></View>
        <View style={st.statsGrid}>
          {[
            ['Total Cases', cases.length, '#1a2340'],
            ['Resolved', cases.filter(c=>c.status==='Resolved').length, '#10b981'],
            ['Pending', cases.filter(c=>c.status==='Pending').length, '#f59e0b'],
            ['Critical', critical.length, '#ef4444'],
          ].map(([l,v,c]) => (
            <View key={l} style={st.statCard}>
              <Text style={[st.statVal,{color:c}]}>{v}</Text>
              <Text style={st.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={st.card}>
          <Text style={st.cardTitle}>Cases by Urgency</Text>
          <View style={st.chartRow}>
            {byUrgency.map(d => (
              <View key={d.label} style={st.chartBar}>
                <View style={[st.chartBarFill, { height: Math.max((d.value/maxVal)*120, 4), backgroundColor: d.color }]} />
                <Text style={st.chartBarVal}>{d.value}</Text>
                <Text style={st.chartBarLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={st.card}>
          <Text style={st.cardTitle}>Cases by Status</Text>
          {['Pending','Under Review','In Progress','Resolved','Rejected'].map(s => {
            const count = cases.filter(c=>c.status===s).length;
            const pct = cases.length ? (count/cases.length)*100 : 0;
            return (
              <View key={s} style={st.statRow}>
                <Text style={st.statRowLabel}>{s}</Text>
                <View style={st.statRowBar}>
                  <View style={[st.statRowFill, { width:`${pct}%`, backgroundColor: statusColor[s] }]} />
                </View>
                <Text style={st.statRowVal}>{count}</Text>
              </View>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ── ACTIVITY LOG TAB ─────────────────────────────────────────────────────
  const ActivityView = () => {
    const events = cases.slice(0,20).map(c => ({
      id: c.caseId, type: 'case', text: `${c.caseId} — ${c.classification}`,
      sub: `Status: ${c.status} · ${c.urgency} priority`,
      time: new Date(c.createdAt).toLocaleString(),
      color: urgencyColor[c.urgency] || '#6b7280',
    }));
    return (
      <ScrollView style={st.container}>
        <View style={st.tabHeader}><Text style={st.tabHeaderTitle}>📜 Activity Log</Text></View>
        <View style={st.card}>
          {events.length === 0 && <Text style={st.emptyText}>No activity yet.</Text>}
          {events.map((e,i) => (
            <TouchableOpacity key={i} style={st.activityRow} onPress={() => { setSelected(e.id); }}>
              <View style={[st.activityDot, { backgroundColor: e.color }]} />
              <View style={st.activityContent}>
                <Text style={st.activityText}>{e.text}</Text>
                <Text style={st.activitySub}>{e.sub}</Text>
                <Text style={st.activityTime}>{e.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ── SETTINGS TAB ─────────────────────────────────────────────────────────
  const SettingsView = () => (
    <ScrollView style={st.container}>
      <View style={st.tabHeader}><Text style={st.tabHeaderTitle}>⚙️ Settings</Text></View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Account Info</Text>
        {[['Username', user.username], ['Role', user.role || 'admin'], ['Organization', 'Organization A']].map(([l,v]) => (
          <View key={l} style={st.settingRow}>
            <Text style={st.settingLabel}>{l}</Text>
            <Text style={st.settingVal}>{v}</Text>
          </View>
        ))}
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Admin Registration</Text>
        <Text style={st.settingNote}>To add new admin accounts, use the Admin Register screen or visit /admin/register on the web dashboard.</Text>
      </View>
      <TouchableOpacity style={st.logoutBtnFull} onPress={logout}>
        <Text style={st.logoutBtnText}>🚪 Sign Out</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── HOME TAB ─────────────────────────────────────────────────────────────
  const HomeView = () => (
    <ScrollView style={st.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      {critical.length > 0 && (
        <View style={st.criticalBanner}>
          <Text style={st.criticalText}>⚠️ {critical.length} Critical Case{critical.length>1?'s':''} Need Immediate Attention</Text>
          <Text style={st.criticalIds}>{critical.map(c=>c.caseId).join(', ')}</Text>
        </View>
      )}
      <View style={st.statsRow}>
        {[['Total',cases.length,'#1a2340'],['Active',cases.filter(c=>!['Resolved','Rejected'].includes(c.status)).length,'#3b82f6'],['Resolved',cases.filter(c=>c.status==='Resolved').length,'#10b981'],['Critical',critical.length,'#ef4444']].map(([l,v,c]) => (
          <View key={l} style={st.statCard}><Text style={[st.statVal,{color:c}]}>{v}</Text><Text style={st.statLabel}>{l}</Text></View>
        ))}
      </View>
      <View style={st.card}>
        <Text style={st.cardTitle}>Cases by Urgency</Text>
        <View style={st.miniChart}>
          {[['High','#ef4444'],['Medium','#f59e0b'],['Low','#3b82f6']].map(([u,c]) => {
            const count = cases.filter(x=>x.urgency===u).length;
            const pct = cases.length ? (count/cases.length)*100 : 0;
            return (
              <View key={u} style={st.miniChartRow}>
                <Text style={st.miniChartLabel}>{u}</Text>
                <View style={st.miniChartBar}><View style={[st.miniChartFill,{width:`${pct}%`,backgroundColor:c}]} /></View>
                <Text style={st.miniChartVal}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <Text style={st.sectionHeader}>Case Queue</Text>
      <View style={st.filterRow}>
        {['All','High','Medium','Low'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilterUrgency(f)}
            style={[st.filterBtn, filterUrgency===f && st.filterBtnActive]}>
            <Text style={[st.filterBtnText, filterUrgency===f && st.filterBtnTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {filtered.map(c => (
        <TouchableOpacity key={c.caseId} style={[st.caseCard,{borderLeftColor:urgencyColor[c.urgency]}]} onPress={() => setSelected(c.caseId)}>
          <View style={st.caseCardTop}>
            <Text style={st.caseCardId}>{c.caseId}</Text>
            <View style={[st.badge,{backgroundColor:(statusColor[c.status]||'#6b7280')+'20'}]}>
              <Text style={[st.badgeText,{color:statusColor[c.status]}]}>{c.status}</Text>
            </View>
          </View>
          <Text style={st.caseCardClass}>{c.classification}</Text>
          <View style={st.caseCardBottom}>
            <View style={[st.urgencyDot,{backgroundColor:urgencyColor[c.urgency]}]} />
            <Text style={st.caseCardUrgency}>{c.urgency}</Text>
            <Text style={st.aiScoreSmall}>🤖 {c.aiScore}/100</Text>
            <Text style={st.caseCardDate}>{new Date(c.createdAt).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <View style={st.root}>
      {/* Header */}
      <View style={st.dashHeader}>
        <View>
          <Text style={st.dashTitle}>SafeSpeak Dashboard</Text>
          <Text style={st.dashSub}>Signed in as {user.username}</Text>
        </View>
        <View style={st.headerRight}>
          {/* Notification bell */}
          <TouchableOpacity onPress={() => setNotifOpen(true)} style={st.bellBtn}>
            <Text style={st.bellIcon}>🔔</Text>
            {critical.length > 0 && (
              <View style={st.bellBadge}><Text style={st.bellBadgeText}>{critical.length}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={st.logoutBtn}>
            <Text style={st.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification modal */}
      <Modal visible={notifOpen} transparent animationType="fade" onRequestClose={() => setNotifOpen(false)}>
        <TouchableOpacity style={st.modalBg} activeOpacity={1} onPress={() => setNotifOpen(false)}>
          <View style={st.notifPanel}>
            <Text style={st.notifTitle}>🔔 Notifications</Text>
            {critical.length === 0 && <Text style={st.emptyText}>No critical alerts</Text>}
            {critical.map(c => (
              <TouchableOpacity key={c.caseId} style={st.notifItem} onPress={() => { setSelected(c.caseId); setNotifOpen(false); }}>
                <Text style={st.notifItemTitle}>⚠️ {c.caseId} — {c.classification}</Text>
                <Text style={st.notifItemSub}>High urgency · Pending · {c.location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Content */}
      <View style={st.content}>
        {activeTab === 'home'      && <HomeView />}
        {activeTab === 'cases'     && <HomeView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'activity'  && <ActivityView />}
        {activeTab === 'settings'  && <SettingsView />}
      </View>

      {/* Bottom nav */}
      <View style={st.bottomNav}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={st.navTab} onPress={() => setActiveTab(tab.key)}>
            <Text style={st.navTabIcon}>{tab.icon}</Text>
            <Text style={[st.navTabLabel, activeTab===tab.key && st.navTabLabelActive]}>{tab.label}</Text>
            {tab.key==='cases' && critical.length>0 && (
              <View style={st.navBadge}><Text style={st.navBadgeText}>{critical.length}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// old duplicate removed



const st = StyleSheet.create({
  root:             { flex: 1, backgroundColor: '#e8edf2' },
  container:        { flex: 1, backgroundColor: '#e8edf2' },
  content:          { flex: 1 },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dashHeader:       { backgroundColor: '#1a2340', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dashTitle:        { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  dashSub:          { fontSize: 10, color: '#ffffff70', marginTop: 1 },
  headerRight:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn:          { position: 'relative', padding: 4 },
  bellIcon:         { fontSize: 20 },
  bellBadge:        { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  bellBadgeText:    { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  logoutBtn:        { backgroundColor: '#ffffff20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  logoutBtnFull:    { margin: 16, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  logoutBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  logoutText:       { color: '#fff', fontSize: 12 },
  bottomNav:        { flexDirection: 'row', backgroundColor: '#1a2340', paddingBottom: 4 },
  navTab:           { flex: 1, alignItems: 'center', paddingVertical: 8, position: 'relative' },
  navTabIcon:       { fontSize: 18, marginBottom: 2 },
  navTabLabel:      { fontSize: 9, color: 'rgba(255,255,255,0.5)' },
  navTabLabelActive:{ color: '#0ea5e9', fontWeight: '700' },
  navBadge:         { position: 'absolute', top: 4, right: 8, backgroundColor: '#ef4444', borderRadius: 8, width: 14, height: 14, justifyContent: 'center', alignItems: 'center' },
  navBadgeText:     { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  tabHeader:        { backgroundColor: '#1a2340', padding: 16 },
  tabHeaderTitle:   { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  modalBg:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 12 },
  notifPanel:       { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: 280, maxHeight: 300 },
  notifTitle:       { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 12 },
  notifItem:        { backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, marginBottom: 8 },
  notifItemTitle:   { fontSize: 12, fontWeight: '600', color: '#dc2626' },
  notifItemSub:     { fontSize: 10, color: '#ef4444', marginTop: 2 },
  criticalBanner:   { backgroundColor: '#fef2f2', borderLeftWidth: 4, borderLeftColor: '#ef4444', margin: 12, borderRadius: 10, padding: 12 },
  criticalText:     { fontSize: 13, fontWeight: 'bold', color: '#dc2626' },
  criticalIds:      { fontSize: 11, color: '#ef4444', marginTop: 2 },
  statsRow:         { flexDirection: 'row', padding: 12, gap: 8 },
  statsGrid:        { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard:         { flex: 1, minWidth: '40%', backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 2 },
  statVal:          { fontSize: 22, fontWeight: 'bold' },
  statLabel:        { fontSize: 10, color: '#6b7280', marginTop: 2 },
  filterRow:        { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  filterBtn:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff' },
  filterBtnActive:  { backgroundColor: '#1a2340' },
  filterBtnText:    { fontSize: 12, color: '#6b7280' },
  filterBtnTextActive: { color: '#fff', fontWeight: '700' },
  sectionHeader:    { fontSize: 15, fontWeight: 'bold', color: '#1a2340', paddingHorizontal: 12, marginBottom: 4 },
  caseCard:         { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 12, padding: 14, borderLeftWidth: 4, elevation: 2 },
  caseCardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  caseCardId:       { fontSize: 11, fontWeight: 'bold', color: '#374151', fontFamily: 'monospace' },
  caseCardClass:    { fontSize: 15, fontWeight: '600', color: '#1a2340', marginBottom: 6 },
  caseCardBottom:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgencyDot:       { width: 8, height: 8, borderRadius: 4 },
  caseCardUrgency:  { fontSize: 11, color: '#6b7280', flex: 1 },
  aiScoreSmall:     { fontSize: 11, color: '#1a2340', fontWeight: '600' },
  caseCardDate:     { fontSize: 10, color: '#9ca3af' },
  badge:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:        { fontSize: 10, fontWeight: '600' },
  backBtn:          { padding: 16 },
  backText:         { color: '#0ea5e9', fontSize: 14 },
  card:             { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 12, padding: 16, elevation: 2 },
  cardTitle:        { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  caseIdText:       { fontSize: 12, color: '#6b7280', fontFamily: 'monospace' },
  classText:        { fontSize: 20, fontWeight: 'bold', color: '#1a2340', marginVertical: 6 },
  badgeRow:         { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  progressRow:      { flexDirection: 'row', justifyContent: 'space-between' },
  stepContainer:    { alignItems: 'center', flex: 1 },
  stepDot:          { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepDotDone:      { backgroundColor: '#1a2340' },
  stepNum:          { fontSize: 11, fontWeight: 'bold', color: '#9ca3af' },
  stepNumDone:      { color: '#fff' },
  stepLabel:        { fontSize: 9, color: '#6b7280', textAlign: 'center' },
  aiScore:          { fontSize: 28, fontWeight: 'bold', color: '#1a2340', marginBottom: 8 },
  scoreBar:         { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 8 },
  scoreBarFill:     { height: 8, backgroundColor: '#1a2340', borderRadius: 4 },
  aiReason:         { fontSize: 12, color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, lineHeight: 18 },
  descText:         { fontSize: 13, color: '#374151', lineHeight: 20 },
  statusBtns:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn:        { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  statusBtnActive:  { backgroundColor: '#1a2340', borderColor: '#1a2340' },
  statusBtnText:    { fontSize: 12, color: '#374151' },
  statusBtnTextActive: { color: '#fff' },
  noteItem:         { backgroundColor: '#fefce8', borderRadius: 8, padding: 10, marginBottom: 8 },
  noteText:         { fontSize: 13, color: '#374151' },
  noteAuthor:       { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  noteInput:        { flexDirection: 'row', gap: 8, marginTop: 8 },
  noteField:        { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 13, backgroundColor: '#f9fafb' },
  noteBtn:          { backgroundColor: '#1a2340', paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center' },
  noteBtnText:      { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyText:        { fontSize: 12, color: '#9ca3af' },
  msgList:          { marginBottom: 8 },
  msgBubble:        { borderRadius: 10, padding: 10, marginBottom: 6, maxWidth: '80%' },
  msgAdmin:         { backgroundColor: '#1a2340', alignSelf: 'flex-end' },
  msgReporter:      { backgroundColor: '#f3f4f6', alignSelf: 'flex-start' },
  msgText:          { fontSize: 13, color: '#fff' },
  msgTime:          { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  chartRow:         { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140, paddingTop: 10 },
  chartBar:         { alignItems: 'center', flex: 1 },
  chartBarFill:     { width: 32, borderRadius: 4, marginBottom: 4 },
  chartBarVal:      { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  chartBarLabel:    { fontSize: 10, color: '#6b7280', marginTop: 2 },
  statRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  statRowLabel:     { fontSize: 11, color: '#374151', width: 90 },
  statRowBar:       { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  statRowFill:      { height: 8, borderRadius: 4 },
  statRowVal:       { fontSize: 11, fontWeight: 'bold', color: '#374151', width: 24, textAlign: 'right' },
  miniChart:        { gap: 8 },
  miniChartRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniChartLabel:   { fontSize: 11, color: '#374151', width: 50 },
  miniChartBar:     { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  miniChartFill:    { height: 8, borderRadius: 4 },
  miniChartVal:     { fontSize: 11, fontWeight: 'bold', color: '#374151', width: 24, textAlign: 'right' },
  activityRow:      { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  activityDot:      { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  activityContent:  { flex: 1 },
  activityText:     { fontSize: 13, fontWeight: '600', color: '#374151' },
  activitySub:      { fontSize: 11, color: '#6b7280', marginTop: 2 },
  activityTime:     { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  settingRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingLabel:     { fontSize: 13, color: '#6b7280' },
  settingVal:       { fontSize: 13, fontWeight: '600', color: '#374151' },
  settingNote:      { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  // Action + modal styles
  actionBtns:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn:        { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', minWidth: '45%' },
  actionBtnText:    { color: '#fff', fontWeight: '700', fontSize: 12 },
  modalBg2:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet:       { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalTitle:       { fontSize: 18, fontWeight: 'bold', color: '#1a2340', marginBottom: 16 },
  mLabel:           { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 10 },
  mInput:           { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#374151', backgroundColor: '#f9fafb' },
  radioRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  radioBtn:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb' },
  radioBtnActive:   { backgroundColor: '#1a2340', borderColor: '#1a2340' },
  radioText:        { fontSize: 12, color: '#374151' },
  modalBtns:        { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn:   { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  modalCancelText:  { color: '#6b7280', fontWeight: '600' },
  modalConfirmBtn:  { flex: 2, paddingVertical: 13, borderRadius: 10, backgroundColor: '#3b82f6', alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
