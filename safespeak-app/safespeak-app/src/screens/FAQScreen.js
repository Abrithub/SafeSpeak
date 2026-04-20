import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const faqs = [
  { q: 'What should be reported to SafeSpeak?', a: 'Any incident involving abuse, harassment, or exploitation — physical, emotional, sexual, online, domestic violence, child abuse or neglect.' },
  { q: 'Do I have to share my name or contact info?', a: 'No. You can submit completely anonymously. Contact info is optional and only used for follow-up if you consent.' },
  { q: 'How long does it take to complete a report?', a: 'Just a few minutes. Most fields are optional so you provide only what you\'re comfortable sharing.' },
  { q: 'Is my report secure?', a: 'Yes. All reports are encrypted end-to-end and handled with strict confidentiality.' },
  { q: 'What happens after I submit?', a: 'Our team reviews the report, assesses safety concerns, and refers to relevant local support services and authorities.' },
  { q: 'Do I have to live in a specific country?', a: 'No. SafeSpeak accepts reports from anywhere in the world.' },
];

export default function FAQScreen() {
  const [open, setOpen] = useState(null);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      {faqs.map((f, i) => (
        <TouchableOpacity key={i} style={styles.item} onPress={() => setOpen(open === i ? null : i)}>
          <View style={styles.itemHeader}>
            <Text style={styles.question}>{f.q}</Text>
            <Text style={styles.arrow}>{open === i ? '▲' : '▼'}</Text>
          </View>
          {open === i && <Text style={styles.answer}>{f.a}</Text>}
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a2340', marginBottom: 20, marginTop: 8 },
  item: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  question: { fontSize: 14, fontWeight: '600', color: '#1a2340', flex: 1, marginRight: 8, lineHeight: 20 },
  arrow: { color: '#0ea5e9', fontSize: 12 },
  answer: { fontSize: 13, color: '#6b7280', marginTop: 10, lineHeight: 20 },
});
