/**
 * CarrierProfileScreen — Full featured:
 * - Status toggle (Available / Busy / On Trip)
 * - Account info
 * - UAE PASS verification CTA
 * - Certificate upload section
 * - Vehicle details
 * - Settings
 * - Logout
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Platform, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../theme';
import useAuthStore from '../../store/authStore';

const STATUS_OPTIONS = [
  { key: 'available', label: 'Available', emoji: '🟢', color: '#22c55e', bg: '#052e16' },
  { key: 'busy',      label: 'Busy',      emoji: '🟡', color: '#f59e0b', bg: '#2d1a00' },
  { key: 'on_trip',   label: 'On Trip',   emoji: '🔵', color: '#3b82f6', bg: '#0c1a3a' },
];

const showAlert = (title, message) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

function Section({ title, children }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.title}>{title}</Text>
      <View style={sec.card}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, onPress, danger, badge }) {
  return (
    <TouchableOpacity
      style={row.wrap}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={row.icon}>{icon}</Text>
      <View style={row.body}>
        <Text style={[row.label, danger && { color: '#ef4444' }]}>{label}</Text>
        {!!value && <Text style={row.value}>{value}</Text>}
      </View>
      {!!badge && (
        <View style={[row.badge, { backgroundColor: badge.bg }]}>
          <Text style={[row.badgeText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      )}
      {!!onPress && !badge && <Text style={row.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function CarrierProfileScreen() {
  const { user, logout } = useAuthStore();
  const [status, setStatus] = useState('available');
  const [notifBids, setNotifBids] = useState(true);
  const [notifJobs, setNotifJobs] = useState(true);

  const currentStatus = STATUS_OPTIONS.find(s => s.key === status);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Profile Header ─────────────────────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'D'}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
          </View>
          <Text style={styles.name}>{user?.name || 'Driver'}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          {/* Verification Badge */}
          {user?.is_verified ? (
            <View style={[styles.badge, { backgroundColor: '#052e16' }]}>
              <Text style={{ fontSize: 10, marginRight: 4 }}>✅</Text>
              <Text style={[styles.badgeText, { color: '#22c55e' }]}>UAE Verified</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: '#2d1a00' }]}>
              <Text style={{ fontSize: 10, marginRight: 4 }}>⚠️</Text>
              <Text style={[styles.badgeText, { color: '#f59e0b' }]}>Not Verified</Text>
            </View>
          )}
        </View>

        {/* ── Availability Status ─────────────────────────────────────── */}
        <Section title="My Status">
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.statusBtn, status === opt.key && { backgroundColor: opt.bg, borderColor: opt.color }]}
                onPress={() => setStatus(opt.key)}
              >
                <Text style={styles.statusEmoji}>{opt.emoji}</Text>
                <Text style={[styles.statusLabel, status === opt.key && { color: opt.color, fontWeight: '800' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.statusHint}>
            {status === 'available' && 'You will appear in shipper searches.'}
            {status === 'busy' && 'You are temporarily unavailable for new jobs.'}
            {status === 'on_trip' && 'Shippers can see you are currently on delivery.'}
          </Text>
        </Section>

        {/* ── Account Details ─────────────────────────────────────────── */}
        <Section title="Account Details">
          <Row icon="👤" label="Full Name" value={user?.name || '—'} />
          <Row icon="📧" label="Email" value={user?.email || '—'} />
          <Row icon="📱" label="Phone" value={user?.phone || 'Not set'} onPress={() => showAlert('Update Phone', 'Contact support to update your phone number.')} />
          <Row icon="🏢" label="Company / Fleet Name" value={user?.company_name || 'Independent Driver'} />
        </Section>

        {/* ── Vehicle Details ─────────────────────────────────────────── */}
        <Section title="Vehicle Details">
          <Row icon="🚛" label="Vehicle Type" value={user?.vehicle_type || 'Not set'} onPress={() => showAlert('Update Vehicle', 'Contact support to update vehicle details.')} />
          <Row icon="⚖️" label="Load Capacity" value={user?.vehicle_capacity ? `${user.vehicle_capacity} tonnes` : 'Not set'} />
          <Row icon="🔖" label="License Plate" value={user?.license_plate || 'Not set'} />
        </Section>

        {/* ── Verification & Documents ────────────────────────────────── */}
        <Section title="Verification & Documents">
          <Row
            icon="🇦🇪"
            label="UAE PASS Verification"
            onPress={() => showAlert('UAE PASS', 'UAE PASS integration is coming in the next release. You will be able to verify your identity with your Emirates ID directly.')}
            badge={user?.is_verified
              ? { text: 'Verified', color: '#22c55e', bg: '#052e16' }
              : { text: 'Required', color: '#f59e0b', bg: '#2d1a00' }}
          />
          <Row
            icon="📄"
            label="Upload Trade License"
            onPress={() => showAlert('Upload Documents', 'Document upload will open your file picker. This feature requires native device access and will be activated in the next release.')}
            badge={{ text: 'Pending', color: '#94a3b8', bg: '#1e293b' }}
          />
          <Row
            icon="🪪"
            label="Upload Emirates ID"
            onPress={() => showAlert('Upload Documents', 'Emirates ID upload will be available in the next release.')}
            badge={{ text: 'Pending', color: '#94a3b8', bg: '#1e293b' }}
          />
          <Row
            icon="🚗"
            label="Upload Driving License"
            onPress={() => showAlert('Upload Documents', 'Driving License upload will be available in the next release.')}
            badge={{ text: 'Pending', color: '#94a3b8', bg: '#1e293b' }}
          />
        </Section>

        {/* ── Notifications Settings ──────────────────────────────────── */}
        <Section title="Notifications">
          <View style={row.wrap}>
            <Text style={row.icon}>📬</Text>
            <View style={row.body}>
              <Text style={row.label}>New Bid Alerts</Text>
              <Text style={row.value}>Get notified when you receive a bid response</Text>
            </View>
            <Switch
              value={notifBids}
              onValueChange={setNotifBids}
              trackColor={{ true: Colors.orange, false: '#334155' }}
              thumbColor="#fff"
            />
          </View>
          <View style={row.wrap}>
            <Text style={row.icon}>🔔</Text>
            <View style={row.body}>
              <Text style={row.label}>New Job Alerts</Text>
              <Text style={row.value}>Get notified when new loads are posted</Text>
            </View>
            <Switch
              value={notifJobs}
              onValueChange={setNotifJobs}
              trackColor={{ true: Colors.orange, false: '#334155' }}
              thumbColor="#fff"
            />
          </View>
        </Section>

        {/* ── App Settings ────────────────────────────────────────────── */}
        <Section title="Settings">
          <Row icon="🔒" label="Change Password" onPress={() => showAlert('Change Password', 'A password reset link will be sent to your registered email.')} />
          <Row icon="🌐" label="Language" value="English" onPress={() => showAlert('Language', 'Arabic language support is coming in the next release.')} />
          <Row icon="📞" label="Contact Support" onPress={() => showAlert('Support', 'Email: support@waselx.ae\nPhone: +971 800 WASEL')} />
          <Row icon="📋" label="Terms & Conditions" onPress={() => showAlert('Terms', 'Full terms and conditions are available at waselx.ae/terms')} />
          <Row icon="⭐" label="Rate the App" onPress={() => showAlert('Rate WaselX', 'Thank you! This will redirect to the App Store.')} />
        </Section>

        {/* ── Logout ──────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>🚪  Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>WaselX v1.0.0 · Built with ❤️ in UAE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0f1e' },
  scroll: { paddingBottom: 100 },

  profileHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  statusDot: {
    position: 'absolute', bottom: 3, right: 3,
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#0a0f1e',
  },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 10 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },

  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statusBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 4,
  },
  statusEmoji: { fontSize: 20 },
  statusLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  statusHint: { fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },

  logoutBtn: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    height: 52,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 15 },
  version: { textAlign: 'center', marginTop: 16, marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.2)' },
});

const sec = StyleSheet.create({
  wrap: { marginTop: 8, paddingHorizontal: Spacing.md },
  title: {
    fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 8, marginTop: 16, paddingHorizontal: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
});

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  icon: { fontSize: 18, width: 30, marginRight: 12 },
  body: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  value: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  arrow: { fontSize: 20, color: 'rgba(255,255,255,0.2)' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
