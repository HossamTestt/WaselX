import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '../../components';
import { Colors, Typography, Spacing } from '../../theme';
import useAuthStore from '../../store/authStore';

export default function CarrierProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 40, color: Colors.white }}>{user?.name?.[0] || 'D'}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.company}>{user?.company_name || 'Independent Driver'}</Text>
          
          <View style={{ backgroundColor: Colors.successBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginTop: 8 }}>
            <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 12 }}>✓ VERIFIED PARTNER</Text>
          </View>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.val}>{user?.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.val}>{user?.phone || 'Not set'}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.val}>{user?.vehicle_type || 'Unknown'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Capacity</Text>
            <Text style={styles.val}>{user?.vehicle_capacity ? `${user.vehicle_capacity} tonnes` : 'Not set'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>License Plate</Text>
            <Text style={styles.val}>{user?.license_plate || 'Not set'}</Text>
          </View>
        </Card>

        <Button title="Logout" variant="danger" onPress={logout} style={{ marginTop: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { ...Typography.h3, color: Colors.navy },
  scroll: { padding: Spacing.md },
  
  avatarContainer: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.md },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  name: { ...Typography.h2, color: Colors.navy },
  company: { fontSize: 15, color: Colors.textMuted },

  sectionTitle: { ...Typography.h4, color: Colors.navy, marginBottom: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { color: Colors.textMuted, fontSize: 15 },
  val: { color: Colors.text, fontSize: 15, fontWeight: '500' },
});
