import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import useAuthStore from '../../store/authStore';
import { t } from '../../i18n';

// Web-safe alert function
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

export default function RegisterScreen({ navigation }) {
  const register = useAuthStore((s) => s.register);
  const [role, setRole] = useState('shipper');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    if (form.password.length < 8) {
      setError('يجب أن تكون كلمة المرور ٨ أحرف على الأقل.');
      return;
    }

    setLoading(true);
    try {
      await register({ ...form, role });
      if (role === 'carrier') {
        showAlert(
          'تم التسجيل بنجاح',
          'حسابك قيد المراجعة من قبل المسؤول. ستتمكن من تسجيل الدخول فور الموافقة.'
        );
        navigation.navigate('Login');
      }
    } catch (e) {
      let msg = e.response?.data?.message || 'فشل التسجيل. يرجى المحاولة مرة أخرى.';
      if (e.response?.data?.errors) {
        msg = e.response.data.errors.map(err => err.msg).join('\n');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← رجوع</Text>
            </TouchableOpacity>
            <View style={styles.logoBackground}>
              <Image
                source={require('../../../assets/logo_horizontal.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.title}>إنشاء حساب جديد</Text>
          <Text style={styles.subtitle}>انضم إلى واصل إكس اليوم</Text>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'shipper' && styles.roleActiveShipper]}
              onPress={() => setRole('shipper')}
            >
              <Text style={styles.roleIcon}>📦</Text>
              <Text style={[styles.roleText, role === 'shipper' && styles.roleTextActiveShipper]}>
                أنا شاحن
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'carrier' && styles.roleActiveCarrier]}
              onPress={() => setRole('carrier')}
            >
              <Text style={styles.roleIcon}>🚚</Text>
              <Text style={[styles.roleText, role === 'carrier' && styles.roleTextActiveCarrier]}>
                أنا ناقل / سائق
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {role === 'shipper'
                ? 'انشر حمولتك واستلم عروضاً تنافسية من ناقلين معتمدين.'
                : 'تصفح الحمولات المتاحة، قدم عروضك، واحصل على مستحقاتك بأمان.'}
            </Text>
          </View>

          {/* Form */}
          <Input
            label={role === 'shipper' ? 'الاسم الكامل / اسم الشركة' : 'اسم الأسطول / السائق'}
            placeholder="أدخل الاسم"
            value={form.name}
            onChangeText={(txt) => setForm(f => ({ ...f, name: txt }))}
          />
          <Input
            label={t('email')}
            placeholder="البريد الإلكتروني"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(txt) => setForm(f => ({ ...f, email: txt }))}
          />
          <Input
            label="رقم الهاتف"
            placeholder="+971 5X XXX XXXX"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(txt) => setForm(f => ({ ...f, phone: txt }))}
          />
          <Input
            label={t('password')}
            placeholder="٨ أحرف على الأقل"
            secureTextEntry
            value={form.password}
            onChangeText={(txt) => setForm(f => ({ ...f, password: txt }))}
          />

          {/* Inline Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: role === 'shipper' ? Colors.blue : Colors.orange }, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.registerBtnText}>{t('register')}</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: Colors.textMuted }}>لديك حساب بالفعل؟ </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>{t('login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1F30' },
  safe: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  logoBackground: { 
    backgroundColor: 'rgba(255,255,255,0.92)', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 16,
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  logo: { width: 140, height: 40 },

  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 4, textAlign: 'right' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: Spacing.xl, textAlign: 'right' },

  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  roleBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  roleActiveShipper: { borderColor: Colors.blue, backgroundColor: Colors.blue + '22' },
  roleActiveCarrier: { borderColor: Colors.orange, backgroundColor: Colors.orange + '22' },
  roleIcon: { fontSize: 24 },
  roleText: { fontWeight: '700', color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  roleTextActiveShipper: { color: Colors.blue },
  roleTextActiveCarrier: { color: Colors.orange },

  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  infoText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },

  registerBtn: {
    height: 56,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  registerBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  link: { color: Colors.orange, fontWeight: '700' },
});
