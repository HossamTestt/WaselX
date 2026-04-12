import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '../../components';
import { Colors, Typography, Spacing } from '../../theme';
import { shipmentsAPI } from '../../services/api';

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
    if (!form.pickup_address || !form.dropoff_address) {
      Alert.alert('Error', 'Pickup and Drop-off addresses are required.');
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
      Alert.alert('Success', 'Shipment created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Shipment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Pickup</Text>
          <Input 
            label="Address" 
            placeholder="E.g. Warehouse 4, Al Quoz" 
            value={form.pickup_address}
            onChangeText={t => setForm(f => ({...f, pickup_address: t}))}
          />
          <Input 
            label="City" 
            placeholder="E.g. Dubai" 
            value={form.pickup_city}
            onChangeText={t => setForm(f => ({...f, pickup_city: t}))}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Drop-off</Text>
          <Input 
            label="Address" 
            placeholder="E.g. Main Port Building" 
            value={form.dropoff_address}
            onChangeText={t => setForm(f => ({...f, dropoff_address: t}))}
          />
          <Input 
            label="City" 
            placeholder="E.g. Abu Dhabi" 
            value={form.dropoff_city}
            onChangeText={t => setForm(f => ({...f, dropoff_city: t}))}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Load Details</Text>
          <Input 
            label="Load Type" 
            placeholder="General Cargo, Non-Hazardous..." 
            value={form.load_type}
            onChangeText={t => setForm(f => ({...f, load_type: t}))}
          />
          <Input 
            label="Description" 
            placeholder="What needs to be transported?" 
            multiline
            numberOfLines={3}
            inputStyle={{ height: 80, paddingTop: 12 }}
            value={form.description}
            onChangeText={t => setForm(f => ({...f, description: t}))}
          />
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Input 
              label="Weight (Tonnes)" 
              placeholder="0.0" 
              keyboardType="numeric"
              style={{ flex: 1 }}
              value={form.weight_tonnes}
              onChangeText={t => setForm(f => ({...f, weight_tonnes: t}))}
            />
            <Input 
              label="Max Budget (AED)" 
              placeholder="Optional" 
              keyboardType="numeric"
              style={{ flex: 1 }}
              value={form.budget_max}
              onChangeText={t => setForm(f => ({...f, budget_max: t}))}
            />
          </View>
        </Card>

        <Button title="Post Shipment" onPress={handleSubmit} loading={loading} style={{ marginVertical: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { ...Typography.h3, color: Colors.navy },
  scroll: { padding: Spacing.md },
  sectionTitle: { ...Typography.label, color: Colors.orange, marginBottom: Spacing.md },
});
