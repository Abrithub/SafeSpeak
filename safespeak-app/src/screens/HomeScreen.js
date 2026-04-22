import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Modal, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, font, shadow, W, H } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [showWarning, setShowWarning] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowWarning(true), 1200); return () => clearTimeout(t); }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View style={s.hero}>
          <Image source={require('../../assets/hero.png')} style={s.heroImg} resizeMode="cover" />
          <View style={s.heroOverlay} />
          <View style={s.heroContent}>
            <View style={s.logoBadge}>
              <Image source={require('../../assets/logo.png')} style={s.logoImg} resizeMode="contain"
                onError={() => {}} />
              <Text style={s.logoText}>SafeSpeak</Text>
            </View>
            <Text style={s.heroTitle}>Interactive, Secure{'\n'}and Speak Freely</Text>
            <Text style={s.heroSub}>Report abuse safely while maintaining your privacy and security.</Text>
            <View style={s.heroActions}>
              <TouchableOpacity style={s.heroPrimaryBtn} onPress={() => navigation.navigate('Report')}>
                <Text style={s.heroPrimaryBtnText}>Report Incident</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.heroSecondaryBtn} onPress={() => navigation.navigate('HowToReport')}>
                <Text style={s.heroSecondaryBtnText}>How to report?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* URGENT CALL */}
        <View style={s.urgentCard}>
          <View style={s.urgentLeft}>
            <View style={s.urgentIconBox}>
              <Text style={s.urgentIconText}>📞</Text>
            </View>
            <View>
              <Text style={s.urgentTitle}>Call For Urgent Help</Text>
              <TouchableOpacity onPress={() => Linking.openURL('tel:+251965485715')}>
                <Text style={s.urgentPhone}>+251 965 485 715</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.urgentBadges}>
            {[['🛡️','Secure'],['💬','Private'],['⚡','Fast']].map(([e,l]) => (
              <View key={l} style={s.urgentBadge}>
                <Text style={s.urgentBadgeEmoji}>{e}</Text>
                <Text style={s.urgentBadgeLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CALL US BANNER */}
        <View style={s.callBanner}>
          <Image source={require('../../assets/callus.png')} style={s.callImg} resizeMode="cover" />
          <View style={s.callContent}>
            <Text style={s.callTitle}>Prefer to speak directly?</Text>
            <Text style={s.callSub}>Our Call Center is available 24/7 for immediate help.</Text>
            <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL('tel:+251965485715')}>
              <Text style={s.callBtnText}>📞 Call Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PARTNERS */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>TRUSTED BY</Text>
          <Text style={s.sectionTitle}>Our Partners</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.partnerScroll}>
            <Image source={require('../../assets/association.png')} style={s.partnerImg} resizeMode="contain" />
            <Image source={require('../../assets/child.png')} style={s.partnerImg} resizeMode="contain" />
          </ScrollView>
          <View style={s.valueGrid}>
            {[['🛡️','Quality First','Committed to excellence'],['🤝','Transparency','Clear communication'],['⚙️','Scalable','Grow with us'],['✅','End-to-End','Complete solutions']].map(([e,t,s2]) => (
              <View key={t} style={s.valueCard}>
                <Text style={s.valueEmoji}>{e}</Text>
                <Text style={s.valueTitle}>{t}</Text>
                <Text style={s.valueSub}>{s2}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* HOW TO REPORT */}
        <View style={[s.section, { backgroundColor: colors.bg }]}>
          <Text style={s.sectionLabel}>PROCESS</Text>
          <Text style={s.sectionTitle}>How to Report</Text>
          {[['📋','Fill the Form','Complete the secure form. Most fields are optional.'],['✅','Review','Double-check your information before submitting.'],['🛡️','Submit Securely','Your report is encrypted and sent to our team.'],['🕐','Get Follow-up','We\'ll reach out if you provided contact info.']].map(([e,t,d],i) => (
            <View key={t} style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumText}>{i+1}</Text></View>
              <View style={s.stepIconBox}><Text style={s.stepEmoji}>{e}</Text></View>
              <View style={s.stepContent}>
                <Text style={s.stepTitle}>{t}</Text>
                <Text style={s.stepDesc}>{d}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={s.tealBtn} onPress={() => navigation.navigate('Report')}>
            <Text style={s.tealBtnText}>Start Your Report →</Text>
          </TouchableOpacity>
        </View>

        {/* CONTACT */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>REACH US</Text>
          <Text style={s.sectionTitle}>Contact Us</Text>
          {[['📞','Call Us','+251 965 485 715','tel:+251965485715'],['✉️','Email Us','support@safespeak.org','mailto:support@safespeak.org'],['💬','WhatsApp','Chat with us','https://wa.me/251960255733']].map(([e,t,sub,url]) => (
            <TouchableOpacity key={t} style={s.contactRow} onPress={() => Linking.openURL(url)}>
              <View style={s.contactIconBox}><Text style={s.contactEmoji}>{e}</Text></View>
              <View style={s.contactText}>
                <Text style={s.contactTitle}>{t}</Text>
                <Text style={s.contactSub}>{sub}</Text>
              </View>
              <Text style={s.contactArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />

        {/* Warning modal */}
        <Modal visible={showWarning} transparent animationType="slide">
          <View style={s.modalBg}>
            <View style={s.warningSheet}>
              <View style={s.warningHandle} />
              <View style={s.warningRow}>
                <View style={s.warningStripe} />
                <View style={s.warningBody}>
                  <Text style={s.warningTitle}>⚠️ Legal Warning</Text>
                  <Text style={s.warningText}>False or misleading reports may lead to legal consequences.</Text>
                  <Text style={s.warningText}>የሐሰት ወይም የተሳሳተ የጥቃት መግለጫ በሕግ መወሰን ይችላል።</Text>
                  <TouchableOpacity style={s.warningBtn} onPress={() => setShowWarning(false)}>
                    <Text style={s.warningBtnText}>I Understand</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  // Hero
  hero: { height: H * 0.52, position: 'relative' },
  heroImg: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,35,64,0.72)' },
  heroContent: { flex: 1, padding: spacing.lg, justifyContent: 'flex-end', paddingBottom: spacing.xl },
  logoBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  logoImg: { width: 32, height: 32 },
  logoText: { color: '#fff', fontSize: font.lg, fontWeight: 'bold' },
  heroTitle: { color: '#fff', fontSize: font.xxl, fontWeight: 'bold', lineHeight: 36, marginBottom: spacing.sm },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: font.sm, lineHeight: 20, marginBottom: spacing.lg },
  heroActions: { flexDirection: 'row', gap: spacing.sm },
  heroPrimaryBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: radius.full },
  heroPrimaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  heroSecondaryBtn: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.full },
  heroSecondaryBtnText: { color: '#fff', fontSize: font.sm },
  // Urgent
  urgentCard: { backgroundColor: colors.card, margin: spacing.md, borderRadius: radius.lg, padding: spacing.md, ...shadow },
  urgentLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  urgentIconBox: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
  urgentIconText: { fontSize: 20 },
  urgentTitle: { fontSize: font.sm, fontWeight: '600', color: colors.text },
  urgentPhone: { fontSize: font.lg, fontWeight: 'bold', color: colors.accent },
  urgentBadges: { flexDirection: 'row', justifyContent: 'space-around' },
  urgentBadge: { alignItems: 'center', gap: 4 },
  urgentBadgeEmoji: { fontSize: 20 },
  urgentBadgeLabel: { fontSize: font.xs, color: colors.textSub },
  // Call banner
  callBanner: { marginHorizontal: spacing.md, borderRadius: radius.lg, overflow: 'hidden', ...shadow, marginBottom: spacing.sm },
  callImg: { width: '100%', height: 160 },
  callContent: { backgroundColor: '#fff7ed', padding: spacing.md },
  callTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: 4 },
  callSub: { fontSize: font.sm, color: colors.textSub, marginBottom: spacing.md },
  callBtn: { backgroundColor: colors.danger, paddingVertical: 10, borderRadius: radius.full, alignItems: 'center' },
  callBtnText: { color: '#fff', fontWeight: 'bold', fontSize: font.sm },
  // Section
  section: { padding: spacing.lg, backgroundColor: colors.card },
  sectionLabel: { fontSize: font.xs, fontWeight: '700', color: colors.accent, letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { fontSize: font.xl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.lg },
  // Partners
  partnerScroll: { marginBottom: spacing.md },
  partnerImg: { width: W * 0.38, height: 80, marginRight: spacing.md, borderRadius: radius.md, backgroundColor: '#f8fafc' },
  valueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  valueCard: { width: (W - spacing.lg * 2 - spacing.sm) / 2, backgroundColor: '#f8fafc', borderRadius: radius.md, padding: spacing.md },
  valueEmoji: { fontSize: 24, marginBottom: 6 },
  valueTitle: { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 2 },
  valueSub: { fontSize: font.xs, color: colors.textSub },
  // Steps
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, ...shadow },
  stepNum: { width: 24, height: 24, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepNumText: { color: '#fff', fontSize: font.xs, fontWeight: 'bold' },
  stepIconBox: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
  stepEmoji: { fontSize: 18 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 2 },
  stepDesc: { fontSize: font.xs, color: colors.textSub, lineHeight: 17 },
  tealBtn: { backgroundColor: colors.teal, paddingVertical: 14, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.sm },
  tealBtnText: { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  // Contact
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: '#f8fafc', borderRadius: radius.md, marginBottom: spacing.sm },
  contactIconBox: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
  contactEmoji: { fontSize: 20 },
  contactText: { flex: 1 },
  contactTitle: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  contactSub: { fontSize: font.xs, color: colors.textSub },
  contactArrow: { fontSize: 22, color: colors.textLight },
  // Modal
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  warningSheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingTop: spacing.md },
  warningHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  warningRow: { flexDirection: 'row', gap: spacing.sm },
  warningStripe: { width: 4, backgroundColor: colors.danger, borderRadius: 2 },
  warningBody: { flex: 1 },
  warningTitle: { fontSize: font.md, fontWeight: 'bold', color: colors.danger, marginBottom: spacing.sm },
  warningText: { fontSize: font.sm, color: colors.text, lineHeight: 20, marginBottom: 4 },
  warningBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.md },
  warningBtnText: { color: '#fff', fontWeight: 'bold', fontSize: font.sm },
});

