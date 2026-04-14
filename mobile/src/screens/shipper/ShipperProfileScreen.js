/**
 * ShipperProfileScreen — Full settings & account
 * Dark themed, consistent with Carrier profile
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme';
import useAuthStore from '../../store/authStore';

const showAlert = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
};

function Section({ title, children }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.title}>{title}</Text>
      <View style={sec.card}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, onPress, badge }) {
  return (
    <TouchableOpacity
      style={row.wrap}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={row.icon}>{icon}</Text>
      <View style={row.body}>
        <Text style={row.label}>{label}</Text>
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

export default function ShipperProfileScreen() {
  const { user, logout } = useAuthStore();
  const [notifBids, setNotifBids] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'S'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Shipper'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badgeWrap}>
            <Text style={{ fontSize: 10, marginRight: 4 }}>📦</Text>
            <Text style={styles.badgeLabel}>Shipper Account</Text>
          </View>
        </View>

        {/* Account */}
        <Section title="Account Details">
          <Row icon="👤" label="Full Name" value={user?.name || '—'} />
          <Row icon="📧" label="Email" value={user?.email || '—'} />
          <Row icon="📱" label="Phone" value={user?.phone || 'Not set'} onPress={() => showAlert('Update Phone', 'Contact support@waselx.ae to update your phone number.')} />
          <Row icon="🏢" label="Company" value={user?.company_name || 'Individual'} />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <View style={row.wrap}>
            <Text style={row.icon}>💬</Text>
            <View style={row.body}>
              <Text style={row.label}>Bid Alerts</Text>
              <Text style={row.value}>Get notified when carriers submit bids</Text>
            </View>
            <Switch value={notifBids} onValueChange={setNotifBids} trackColor={{ true: Colors.orange, false: '#334155' }} thumbColor="#fff" />
          </View>
          <View style={row.wrap}>
            <Text style={row.icon}>🚛</Text>
            <View style={row.body}>
              <Text style={row.label}>Delivery Updates</Text>
              <Text style={row.value}>Track pickup, transit, and delivery status</Text>
            </View>
            <Switch value={notifStatus} onValueChange={setNotifStatus} trackColor={{ true: Colors.orange, false: '#334155' }} thumbColor="#fff" />
          </View>
        </Section>

        {/* Settings */}
        <Section title="Settings">
          <Row icon="🔒" label="Change Password" onPress={() => showAlert('Change Password', 'A password reset link will be sent to your email.')} />
          <Row icon="🌐" label="Language" value="English" onPress={() => showAlert('Language', 'Arabic support coming soon.')} />
          <Row icon="📞" label="Contact Support" onPress={() => showAlert('Support', 'Email: support@waselx.ae\nPhone: +971 800 WASEL')} />
          <Row icon="📋" label="Terms & Conditions" onPress={() => showAlert('Terms', 'Available at waselx.ae/terms')} />
          <Row icon="⭐" label="Rate WaselX" onPress={() => showAlert('Rate', 'Thank you for your feedback!')} />
        </Section>

        {/* Logout */}
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
    alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.xl,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.blue,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 10 },
  badgeWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  badgeLabel: { fontSize: 12, fontWeight: '700', color: '#3b82f6' },

  logoutBtn: {
    marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    height: 52, borderRadius: 14,
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
    borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden',
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
