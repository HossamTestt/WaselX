/**
 * CreateShipmentScreen — Premium Dark Theme
 * Multi-section form with dark inputs and web-safe alerts
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { shipmentsAPI } from '../../services/api';

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

export default function CreateShipmentScreen({ navigation }) {
  const [form, setForm] = useState({
    pickup_address: '', pickup_city: '',
    dropoff_address: '', dropoff_city: '',
    load_type: 'General Cargo', description: '',
    weight_tonnes: '',
    budget_max: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.pickup_address || !form.dropoff_address || !form.pickup_city || !form.dropoff_city) {
      showAlert('Error', 'Pickup and Drop-off addresses and cities are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        weight_tonnes: form.weight_tonnes ? parseFloat(form.weight_tonnes) : null,
        budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
        // Mock coordinates for MVP
        pickup_lat: 25.2048, pickup_lng: 55.2708,
        dropoff_lat: 24.4539, dropoff_lng: 54.3773,
      };
      await shipmentsAPI.create(payload);
      showAlert('Success 🎉', 'Shipment created successfully!');
      navigation.navigate('Dashboard');
    } catch (e) {
      showAlert('Error', e.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Shipment</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Post a Load</Text>
          <Text style={styles.pageSubtitle}>Fill in the details to receive bids from carriers</Text>

          <Section title="📍 Pickup Details">
            <Input 
              dark
              label="Collection Address" 
              placeholder="E.g. Warehouse 12, JAFZA" 
              value={form.pickup_address}
              onChangeText={t => setForm(f => ({...f, pickup_address: t}))}
            />
            <Input 
              dark
              label="City" 
              placeholder="E.g. Dubai" 
              value={form.pickup_city}
              onChangeText={t => setForm(f => ({...f, pickup_city: t}))}
            />
          </Section>

          <Section title="🏁 Drop-off Details">
            <Input 
              dark
              label="Delivery Address" 
              placeholder="E.g. Main Port Office" 
              value={form.dropoff_address}
              onChangeText={t => setForm(f => ({...f, dropoff_address: t}))}
            />
            <Input 
              dark
              label="City" 
              placeholder="E.g. Abu Dhabi" 
              value={form.dropoff_city}
              onChangeText={t => setForm(f => ({...f, dropoff_city: t}))}
            />
          </Section>

          <Section title="📦 Load Information">
            <Input 
              dark
              label="Load Type" 
              placeholder="General Cargo, Furniture, etc." 
              value={form.load_type}
              onChangeText={t => setForm(f => ({...f, load_type: t}))}
            />
            <Input 
              dark
              label="Detailed Description" 
              placeholder="E.g. 50 boxes of electronics, fragile..." 
              multiline
              numberOfLines={3}
              inputStyle={{ height: 90, paddingTop: 12 }}
              value={form.description}
              onChangeText={t => setForm(f => ({...f, description: t}))}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input 
                  dark
                  label="Weight (Tonnes)" 
                  placeholder="0.0" 
                  keyboardType="numeric"
                  value={form.weight_tonnes}
                  onChangeText={t => setForm(f => ({...f, weight_tonnes: t}))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input 
                  dark
                  label="Max Budget (AED)" 
                  placeholder="Optional" 
                  keyboardType="numeric"
                  value={form.budget_max}
                  onChangeText={t => setForm(f => ({...f, budget_max: t}))}
                />
              </View>
            </View>
          </Section>

          <Button 
            variant="secondary"
            title="Post Shipment" 
            onPress={handleSubmit} 
            loading={loading} 
            style={styles.submitBtn} 
          />
          
          <Text style={styles.hint}>By posting, you agree to our platform Terms & Conditions</Text>
          
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0f1e' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: { padding: 4 },
  backText: { color: Colors.orange, fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },

  scroll: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },

  row: { flexDirection: 'row', gap: 12 },
  submitBtn: { height: 58, borderRadius: 16, marginTop: 12 },
  hint: { fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 16 },
});

const sec = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontSize: 11, fontWeight: '800', color: Colors.orange,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, paddingHorizontal: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
});
