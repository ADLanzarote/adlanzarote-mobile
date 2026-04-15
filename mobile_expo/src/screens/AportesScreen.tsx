import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  Modal, Alert, ActivityIndicator, ScrollView, Dimensions, SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import Header from '../components/Header';
import client from '../api/client';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

interface Aporte {
  id: number;
  fecha: string;
  monto: number;
  descripcion?: string;
  categoria?: string;
  miembro?: string;
  forma_pago?: string;
}

const CATEGORIAS = ['Diezmo', 'Ofrenda', 'Misiones', 'Construcción', 'Especial', 'Otro'];
const FORMAS_PAGO = ['Efectivo', 'Transferencia', 'Bizum', 'Tarjeta'];

export default function AportesScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { isAdmin, canAccessAportes } = useAuth();

  // Si no tiene acceso, mostrar mensaje
  if (!canAccessAportes()) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Header title={t('aportesTitle')} />
        <View style={styles.noAccessContainer}>
          <Text style={{ fontSize: 64 }}>🔒</Text>
          <Text style={[styles.noAccessTitle, { color: colors.text }]}>Acceso Restringido</Text>
          <Text style={[styles.noAccessText, { color: colors.subtext }]}>
            Solo administradores y tesoreros pueden gestionar aportes.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Aporte | null>(null);
  const [saving, setSaving] = useState(false);

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const emptyForm = { 
    fecha: new Date().toISOString().split('T')[0], 
    monto: '', 
    descripcion: '', 
    categoria: '', 
    miembro: '', 
    forma_pago: '' 
  };
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAportes = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      const res = await client.get('/aportes', { params });
      setAportes(res.data.data);
      setTotal(res.data.suma);
    } catch {
      Alert.alert('', t('errorEnvio'));
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => { fetchAportes(); }, [fetchAportes]);

  const openCreate = () => {
    setEditando(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (a: Aporte) => {
    setEditando(a);
    setForm({
      fecha: a.fecha?.split('T')[0] || '',
      monto: String(a.monto),
      descripcion: a.descripcion || '',
      categoria: a.categoria || '',
      miembro: a.miembro || '',
      forma_pago: a.forma_pago || '',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fecha) e.fecha = t('campoRequerido');
    if (!form.monto || isNaN(parseFloat(form.monto))) e.monto = t('campoRequerido');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, monto: parseFloat(form.monto) };
      if (editando) {
        await client.put(`/aportes/${editando.id}`, payload);
      } else {
        await client.post('/aportes', payload);
      }
      setShowForm(false);
      fetchAportes();
    } catch {
      Alert.alert('', t('errorEnvio'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('', t('confirmarEliminar'), [
      { text: t('cancelar'), style: 'cancel' },
      { text: t('eliminar'), style: 'destructive', onPress: async () => {
        await client.delete(`/aportes/${id}`);
        fetchAportes();
      }},
    ]);
  };

  const renderAporte = ({ item }: { item: Aporte }) => (
    <View style={[styles.card, { 
      backgroundColor: colors.card, 
      borderColor: colors.border,
      shadowColor: isDark ? '#000' : Colors.primary,
    }]}>
      <View style={styles.cardTop}>
        <View>
          <Text style={[styles.monto, { color: Colors.accent }]}>
            💶 {parseFloat(String(item.monto)).toFixed(2)} €
          </Text>
          <Text style={[styles.fecha, { color: colors.subtext }]}>
            📅 {item.fecha?.split('T')[0]}
          </Text>
        </View>
        {item.categoria && (
          <View style={[styles.catBadge, { backgroundColor: Colors.primary + '20' }]}>
            <Text style={[styles.catText, { color: Colors.primary }]}>{item.categoria}</Text>
          </View>
        )}
      </View>
      
      {item.miembro && <Text style={[styles.miembro, { color: colors.text }]}>👤 {item.miembro}</Text>}
      {item.descripcion && <Text style={[styles.desc, { color: colors.subtext }]}>📝 {item.descripcion}</Text>}
      
      {item.forma_pago && (
        <View style={[styles.formaPagoBadge, { backgroundColor: Colors.accent + '15' }]}>
          <Text style={[styles.formaPagoText, { color: Colors.accent }]}>💳 {item.forma_pago}</Text>
        </View>
      )}
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => openEdit(item)}>
          <Text style={styles.actionText}>✏️ {t('editar')}</Text>
        </TouchableOpacity>
        {isAdmin() && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.error }]} onPress={() => handleDelete(item.id)}>
            <Text style={styles.actionText}>🗑️ {t('eliminar')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title={t('aportesTitle')} />

      {/* Total Card */}
      <View style={[styles.totalCard, { backgroundColor: Colors.primary }]}>
        <Text style={styles.totalLabel}>💰 {t('totalAportes')}</Text>
        <Text style={styles.totalValue}>€ {total.toFixed(2)}</Text>
      </View>

      {/* Filtros */}
      <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
        <TextInput 
          style={[styles.dateInput, { borderColor: colors.border, color: colors.text }]}
          placeholder={t('desde')} 
          placeholderTextColor={colors.subtext} 
          value={desde} 
          onChangeText={setDesde} 
        />
        <TextInput 
          style={[styles.dateInput, { borderColor: colors.border, color: colors.text }]}
          placeholder={t('hasta')} 
          placeholderTextColor={colors.subtext} 
          value={hasta} 
          onChangeText={setHasta} 
        />
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: Colors.primary }]} onPress={fetchAportes}>
          <Text style={styles.filterIcon}>🔍</Text>
        </TouchableOpacity>
        {(desde || hasta) && (
          <TouchableOpacity onPress={() => { setDesde(''); setHasta(''); }}>
            <Text style={{ color: Colors.error, fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.subtext }]}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={aportes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderAporte}
          contentContainerStyle={styles.listContent}
          numColumns={isTablet ? 2 : 1}
          key={isTablet ? 'tablet' : 'mobile'}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💰</Text>
              <Text style={[styles.emptyText, { color: colors.subtext }]}>{t('sinAportes')}</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: Colors.accent }]} onPress={openCreate}>
        <Text style={styles.fabIcon}>➕</Text>
      </TouchableOpacity>

      {/* Modal formulario */}
      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                {editando ? '✏️ ' + t('editar') : '➕ ' + t('nuevoAporte')}
              </Text>

              <FormField label={t('fecha')} error={errors.fecha} colors={colors}>
                <TextInput 
                  style={[styles.formInput, { borderColor: errors.fecha ? Colors.error : colors.border, color: colors.text }]}
                  placeholder="YYYY-MM-DD" 
                  placeholderTextColor={colors.subtext}
                  value={form.fecha} 
                  onChangeText={v => setForm(f => ({ ...f, fecha: v }))} 
                />
              </FormField>

              <FormField label={t('monto')} error={errors.monto} colors={colors}>
                <TextInput 
                  style={[styles.formInput, { borderColor: errors.monto ? Colors.error : colors.border, color: colors.text }]}
                  placeholder="0.00" 
                  placeholderTextColor={colors.subtext} 
                  keyboardType="decimal-pad"
                  value={form.monto} 
                  onChangeText={v => setForm(f => ({ ...f, monto: v }))} 
                />
              </FormField>

              <FormField label={t('miembro')} colors={colors}>
                <TextInput 
                  style={[styles.formInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder={t('miembro')} 
                  placeholderTextColor={colors.subtext}
                  value={form.miembro} 
                  onChangeText={v => setForm(f => ({ ...f, miembro: v }))} 
                />
              </FormField>

              <FormField label={t('categoria')} colors={colors}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                  {CATEGORIAS.map(cat => (
                    <TouchableOpacity key={cat}
                      style={[styles.chip, { 
                        backgroundColor: form.categoria === cat ? Colors.primary : colors.border + '44',
                        borderColor: form.categoria === cat ? Colors.primary : 'transparent',
                        borderWidth: 2
                      }]}
                      onPress={() => setForm(f => ({ ...f, categoria: cat }))}
                    >
                      <Text style={{ color: form.categoria === cat ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </FormField>

              <FormField label={t('formaPago')} colors={colors}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {FORMAS_PAGO.map(fp => (
                    <TouchableOpacity key={fp}
                      style={[styles.chip, { 
                        backgroundColor: form.forma_pago === fp ? Colors.accent : colors.border + '44',
                        borderColor: form.forma_pago === fp ? Colors.accent : 'transparent',
                        borderWidth: 2
                      }]}
                      onPress={() => setForm(f => ({ ...f, forma_pago: fp }))}
                    >
                      <Text style={{ color: form.forma_pago === fp ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{fp}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </FormField>

              <FormField label={t('descripcion')} colors={colors}>
                <TextInput 
                  style={[styles.formInput, styles.textArea, { borderColor: colors.border, color: colors.text }]}
                  placeholder={t('descripcion')} 
                  placeholderTextColor={colors.subtext} 
                  multiline 
                  numberOfLines={3}
                  value={form.descripcion} 
                  onChangeText={v => setForm(f => ({ ...f, descripcion: v }))} 
                />
              </FormField>

              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: Colors.primary }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>💾 {t('guardar')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowForm(false)}>
                <Text style={{ color: colors.text }}>❌ {t('cancelar')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const FormField = ({ label, error, children, colors }: any) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '700', marginBottom: 6 }}>{label}</Text>
    {children}
    {error && <Text style={{ color: Colors.error, fontSize: 12, marginTop: 4 }}>⚠️ {error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  
  noAccessContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  noAccessTitle: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  noAccessText: { fontSize: 16, textAlign: 'center', marginTop: 8, opacity: 0.7 },
  
  totalCard: { 
    marginHorizontal: 16, 
    marginTop: 12, 
    padding: 20, 
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '600', opacity: 0.9 },
  totalValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  
  filterContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    marginHorizontal: 16, 
    marginTop: 12, 
    borderRadius: 16,
    elevation: 2,
    gap: 8 
  },
  dateInput: { 
    height: 44, 
    borderWidth: 1.5, 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    fontSize: 14,
    flex: 1 
  },
  filterBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  filterIcon: { fontSize: 18 },
  
  listContent: { padding: 12, paddingBottom: 100 },
  
  card: { 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 12, 
    borderWidth: 1, 
    marginHorizontal: 4,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  monto: { fontSize: 26, fontWeight: '900' },
  fecha: { fontSize: 13, marginTop: 4 },
  catBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  catText: { fontSize: 12, fontWeight: '800' },
  miembro: { fontSize: 15, marginBottom: 4, fontWeight: '600' },
  desc: { fontSize: 14, marginBottom: 8 },
  formaPagoBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  formaPagoText: { fontSize: 12, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  actionBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { textAlign: 'center', marginTop: 16, fontSize: 16 },
  
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: { fontSize: 28, color: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 20, 
    maxHeight: height * 0.9,
    elevation: 10 
  },
  formTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  formInput: { height: 50, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  textArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  chip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  sendBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, elevation: 3 },
  sendBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  cancelBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5 },
});
