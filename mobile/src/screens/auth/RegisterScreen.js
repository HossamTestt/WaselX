import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import useAuthStore from '../../store/authStore';

export default function RegisterScreen({ navigation }) {
  const register = useAuthStore((s) => s.register);
  const [role, setRole] = useState('shipper'); // 'shipper' | 'carrier'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await register({ ...form, role });
      if (role === 'carrier') {
        Alert.alert('Registration Successful', 'Your account is pending admin approval. You will log in once verified.');
      }
    } catch (e) {
      let msg = e.response?.data?.message || 'Registration failed';
      if (e.response?.data?.errors) {
        msg = e.response.data.errors[0].msg;
      }
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join WaselX today</Text>

        {/* Role Selector */}
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'shipper' && styles.roleActiveShipper]} 
            onPress={() => setRole('shipper')}
          >
            <Text style={[styles.roleText, role === 'shipper' && styles.roleTextActive]}>I am a Shipper</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'carrier' && styles.roleActiveCarrier]} 
            onPress={() => setRole('carrier')}
          >
            <Text style={[styles.roleText, role === 'carrier' && styles.roleTextActive]}>I am a Carrier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={{ fontSize: 13, color: Colors.textMuted }}>
            {role === 'shipper' 
              ? 'Shippers can post loads and receive bids from verified carriers.' 
              : 'Carriers can browse available loads, submit bids, and get paid.'}
          </Text>
        </View>

        <Input 
          label={role === 'shipper' ? "Full Name / Company Name" : "Fleet / Driver Name"}
          placeholder="Enter name" 
          value={form.name}
          onChangeText={(txt) => setForm(f => ({...f, name: txt}))}
        />
        
        <Input 
          label="Email Address" 
          placeholder="Enter email" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(txt) => setForm(f => ({...f, email: txt}))}
        />

        <Input 
          label="Phone Number" 
          placeholder="+971 5X XXX XXXX" 
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(txt) => setForm(f => ({...f, phone: txt}))}
        />

        <Input 
          label="Password" 
          placeholder="Minimum 8 characters" 
          secureTextEntry
          value={form.password}
          onChangeText={(txt) => setForm(f => ({...f, password: txt}))}
        />

        <Button 
          title="Register" 
          onPress={handleRegister} 
          loading={loading}
          variant={role === 'shipper' ? 'primary' : 'secondary'}
          style={{ marginTop: Spacing.md }}
        />

        <View style={styles.footer}>
          <Text style={{ color: Colors.textMuted }}>Already have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Login</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { padding: Spacing.xl },
  title: { ...Typography.h1, color: Colors.navy },
  subtitle: { ...Typography.body, color: Colors.textMuted, marginTop: 4, marginBottom: Spacing.xl },
  
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  roleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  roleActiveShipper: { borderColor: Colors.blue, backgroundColor: Colors.blueLight },
  roleActiveCarrier: { borderColor: Colors.orange, backgroundColor: Colors.orangeLight },
  roleText: { fontWeight: '700', color: Colors.textLight },
  roleTextActive: { color: Colors.navy },
  
  infoBox: { backgroundColor: Colors.bg, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.xl },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  link: { color: Colors.blue, fontWeight: '700' },
});
