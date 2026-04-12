/**
 * Shared UI Components for WaselX Mobile
 * Button, Card, StatusBadge, LoadingState, EmptyState, Input
 */
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';

// ─── Button ───────────────────────────────────────────────────
export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style, icon }) {
  const variantStyle = {
    primary: { bg: Colors.blue, text: Colors.white },
    secondary: { bg: Colors.orange, text: Colors.white },
    outline: { bg: 'transparent', text: Colors.blue, border: Colors.blue },
    ghost: { bg: Colors.blueLight, text: Colors.blue },
    danger: { bg: Colors.errorBg, text: Colors.error },
  }[variant] || { bg: Colors.blue, text: Colors.white };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: variantStyle.bg, borderColor: variantStyle.border, borderWidth: variantStyle.border ? 1.5 : 0 },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={[styles.btnText, { color: variantStyle.text }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Input ────────────────────────────────────────────────────
export function Input({ label, error, style, inputStyle, ...props }) {
  return (
    <View style={[styles.inputGroup, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        placeholderTextColor={Colors.textLight}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
const STATUS_MAP = {
  open:       { label: 'Open',       bg: Colors.blueLight,  text: Colors.blue },
  bidding:    { label: 'Bidding',    bg: Colors.warningBg,  text: Colors.warning },
  assigned:   { label: 'Assigned',   bg: '#E8EEF5',         text: Colors.navy },
  picked_up:  { label: 'Picked Up',  bg: Colors.orangeLight,text: Colors.orange },
  in_transit: { label: 'In Transit', bg: Colors.orangeLight,text: Colors.orange },
  delivered:  { label: 'Delivered',  bg: Colors.successBg,  text: Colors.success },
  cancelled:  { label: 'Cancelled',  bg: Colors.errorBg,    text: Colors.error },
  pending:    { label: 'Pending',    bg: Colors.warningBg,  text: Colors.warning },
  active:     { label: 'Active',     bg: Colors.successBg,  text: Colors.success },
  accepted:   { label: 'Accepted',   bg: Colors.successBg,  text: Colors.success },
  rejected:   { label: 'Rejected',   bg: Colors.errorBg,    text: Colors.error },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, bg: '#F1F5F9', text: Colors.textMuted };
  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full }}>
      <Text style={{ color: cfg.text, fontSize: 12, fontWeight: '700' }}>{cfg.label}</Text>
    </View>
  );
}

// ─── Loading State ────────────────────────────────────────────
export function LoadingState({ message = 'Loading...' }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={Colors.blue} size="large" />
      <Text style={[styles.loadingText]}>{message}</Text>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon = '📦', title, message, action }) {
  return (
    <View style={styles.centered}>
      <Text style={{ fontSize: 56, marginBottom: 16 }}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMsg}>{message}</Text>}
      {action}
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({ title, action, actionLabel }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md }, style]} />;
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    minHeight: 50,
  },
  btnText: { fontSize: 15, fontWeight: '700' },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textMuted },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  emptyMsg: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  sectionAction: { fontSize: 14, fontWeight: '600', color: Colors.blue },
});
