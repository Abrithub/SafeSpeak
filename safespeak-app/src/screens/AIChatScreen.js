import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Linking, ActivityIndicator,
} from 'react-native';
import { aiChat } from '../services/api';
import { colors, spacing, radius, font } from '../theme';

const WELCOME = {
  id: 'welcome', role: 'ai',
  text: "Hi 👋 I'm your SafeSpeak AI. I can help you:\n• Report an incident step by step\n• Understand what happens after you report\n• Stay safe right now\n• Answer any questions you have\n\nWhat do you need help with?",
};

const QUICK_PROMPTS = [
  { label: '📋 How do I report?', text: 'How do I submit a report? Walk me through the steps.' },
  { label: '🛡️ I need safety help', text: 'I might be in danger right now. What should I do?' },
  { label: '🔍 Track my case', text: 'I already submitted a report. How do I track it?' },
  { label: '😟 I\'m scared', text: "I'm scared and don't know what to do or where to start." },
];

export default function AIChatScreen() {
  const [messages, setMessages]   = useState([WELCOME]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const listRef = useRef(null);

  const send = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;
    setInput('');
    setShowQuick(false);

    const userMsg = { id: Date.now().toString(), role: 'user', text };
    const history = messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, text: m.text }));

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiChat(text, history);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: res.response || "I'm here to help. Please reach out to a crisis line if you need immediate support.",
        resources: res.resources || [],
        isEmergency: res.isEmergency || false,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'ai',
        text: "I'm having trouble connecting. If you need immediate help, please call +251965485715.",
        resources: [{ name: 'SafeSpeak Emergency Line', contact: '+251965485715', type: 'emergency' }],
        isEmergency: false,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[s.bubble, isUser ? s.userBubble : s.aiBubble]}>
        {item.isEmergency && (
          <View style={s.emergencyBanner}>
            <Text style={s.emergencyText}>🚨 EMERGENCY — Please seek help immediately</Text>
          </View>
        )}
        <Text style={[s.bubbleText, isUser && s.userText]}>{item.text}</Text>
            {item.resources?.length > 0 && (
              <View style={s.resources}>
                <Text style={s.resourcesTitle}>Resources:</Text>
                {item.resources.map((r, i) =>
                  r.type === 'link' ? (
                    <Text key={i} style={s.resourceItem}>🔗 {r.name}</Text>
                  ) : (
                    <TouchableOpacity key={i} onPress={() => Linking.openURL(`tel:${r.contact.replace(/\s/g, '')}`)}>
                      <Text style={s.resourceItem}>📞 {r.name}: <Text style={s.resourceContact}>{r.contact}</Text></Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={s.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          showQuick ? (
            <View style={s.quickWrap}>
              <Text style={s.quickLabel}>Quick questions:</Text>
              <View style={s.quickRow}>
                {QUICK_PROMPTS.map(p => (
                  <TouchableOpacity key={p.label} style={s.quickBtn} onPress={() => send(p.text)}>
                    <Text style={s.quickBtnText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
      />
      {loading && (
        <View style={s.typingRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={s.typingText}>SafeSpeak AI is responding...</Text>
        </View>
      )}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]} onPress={() => send()} disabled={!input.trim() || loading}>
          <Text style={s.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.bg },
  list:           { padding: spacing.md, paddingBottom: spacing.lg },
  bubble:         { maxWidth: '85%', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  aiBubble:       { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border },
  userBubble:     { backgroundColor: colors.accent, alignSelf: 'flex-end' },
  bubbleText:     { fontSize: font.md, color: colors.text, lineHeight: 22 },
  userText:       { color: '#fff' },
  emergencyBanner:{ backgroundColor: '#fee2e2', borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  emergencyText:  { color: '#dc2626', fontWeight: '700', fontSize: font.sm },
  resources:      { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  resourcesTitle: { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 4 },
  resourceItem:   { fontSize: font.sm, color: colors.textSub, marginBottom: 2 },
  resourceContact:{ color: colors.accent, fontWeight: '600' },
  typingRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: 8 },
  typingText:     { fontSize: font.sm, color: colors.textSub },
  inputRow:       { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  input:          { flex: 1, backgroundColor: colors.bg, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: font.md, color: colors.text, maxHeight: 100 },
  sendBtn:        { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled:{ backgroundColor: colors.border },
  sendIcon:       { color: '#fff', fontSize: 16 },
  quickWrap:      { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  quickLabel:     { fontSize: font.xs, color: colors.textSub, marginBottom: spacing.xs },
  quickRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  quickBtn:       { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 7 },
  quickBtnText:   { fontSize: font.xs, color: colors.text, fontWeight: '500' },
});
