import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  Modal, Alert, ActivityIndicator, ScrollView, Dimensions, SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { LIBROS_BIBLICOS } from '../data/libros';
import Header from '../components/Header';
import client from '../api/client';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

interface Comentario {
  id: number;
  nombre: string;
  libro: string;
  capitulo: number;
  versiculo: number;
  comentario: string;
  created_at: string;
}

export default function ComentariosBiblicosScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { isAdmin, clearAuth } = useAuth();

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showLibroModal, setShowLibroModal] = useState(false);
  const [busquedaLibro, setBusquedaLibro] = useState('');
  const [sending, setSending] = useState(false);

  const [filtroLibro, setFiltroLibro] = useState('');
  const [filtroCapitulo, setFiltroCapitulo] = useState('');

  const [form, setForm] = useState({ nombre: '', libro: '', capitulo: '', versiculo: '', comentario: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const librosFiltrados = LIBROS_BIBLICOS.filter(l =>
    t(l.key).toLowerCase().includes(busquedaLibro.toLowerCase()) ||
    l.canon.toLowerCase().includes(busquedaLibro.toLowerCase())
  );

  const fetchComentarios = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filtroLibro) params.libro = filtroLibro;
      if (filtroCapitulo) params.capitulo = filtroCapitulo;
      const res = await client.get('/comentarios', { params });
      setComentarios(res.data.data);
    } catch (err) {
      Alert.alert('', t('errorEnvio'));
    } finally {
      setLoading(false);
    }
  }, [filtroLibro, filtroCapitulo]);

  useEffect(() => { fetchComentarios(); }, [fetchComentarios]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = t('campoRequerido');
    if (!form.libro) e.libro = t('campoRequerido');
    if (!form.capitulo || isNaN(parseInt(form.capitulo))) e.capitulo = t('numeroEntero');
    if (!form.versiculo || isNaN(parseInt(form.versiculo))) e.versiculo = t('numeroEntero');
    if (!form.comentario.trim()) e.comentario = t('campoRequerido');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      await client.post('/comentarios', {
        nombre: form.nombre.trim(),
        libro: form.libro,
        capitulo: parseInt(form.capitulo),
        versiculo: parseInt(form.versiculo),
        comentario: form.comentario.trim(),
      });
      Alert.alert('', t('enviado'));
      setForm({ nombre: '', libro: '', capitulo: '', versiculo: '', comentario: '' });
      setShowForm(false);
      fetchComentarios();
    } catch {
      Alert.alert('', t('errorEnvio'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('', t('confirmarEliminar'), [
      { text: t('cancelar'), style: 'cancel' },
      { text: t('eliminar'), style: 'destructive', onPress: async () => {
        await client.delete(`/comentarios/${id}`);
        fetchComentarios();
      }},
    ]);
  };

  const renderComentario = ({ item }: { item: Comentario }) => (
    <View style={[styles.card, { 
      backgroundColor: colors.card, 
      borderColor: colors.border,
      shadowColor: isDark ? '#000' : '#1D7D8A',
    }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: Colors.accent + '20' }]}>
          <Text style={[styles.badgeText, { color: Colors.accent }]}>
            📖 {item.libro} {item.capitulo}:{item.versiculo}
          </Text>
        </View>
        {isAdmin() && (
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.author, { color: Colors.primary }]}>✍️ {item.nombre}</Text>
        <Text style={[styles.commentText, { color: colors.text }]}>{item.comentario}</Text>
      </View>
      <Text style={[styles.date, { color: colors.subtext }]}>
        🕐 {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title={t('comentariosTitle')} />

      {/* Filtros */}
      <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.filterPicker, { borderColor: colors.border }]}
          onPress={() => { setBusquedaLibro(''); setShowLibroModal(true); }}
        >
          <Text style={{ color: filtroLibro ? colors.text : colors.subtext }} numberOfLines={1}>
            {filtroLibro || '📚 ' + t('seleccioneLibro')}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.filterInput, { borderColor: colors.border, color: colors.text }]}
          placeholder={t('capitulo')}
          placeholderTextColor={colors.subtext}
          keyboardType="numeric"
          value={filtroCapitulo}
          onChangeText={setFiltroCapitulo}
        />
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: Colors.primary }]} onPress={fetchComentarios}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
        {(filtroLibro || filtroCapitulo) && (
          <TouchableOpacity onPress={() => { setFiltroLibro(''); setFiltroCapitulo(''); }}>
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
          data={comentarios}
          keyExtractor={item => item.id.toString()}
          renderItem={renderComentario}
          contentContainerStyle={styles.listContent}
          numColumns={isTablet ? 2 : 1}
          key={isTablet ? 'tablet' : 'mobile'}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>📖</Text>
              <Text style={[styles.emptyText, { color: colors.subtext }]}>{t('sinComentarios')}</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: Colors.accent }]} onPress={() => setShowForm(true)}>
        <Text style={styles.fabIcon}>➕</Text>
      </TouchableOpacity>

      {/* Modal selector de libro */}
      <Modal visible={showLibroModal} animationType="slide" transparent onRequestClose={() => setShowLibroModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>📚 {t('seleccioneLibro')}</Text>
            <TextInput
              style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bg }]}
              placeholder={t('buscarLibro')}
              placeholderTextColor={colors.subtext}
              value={busquedaLibro}
              onChangeText={setBusquedaLibro}
              autoFocus
            />
            <FlatList
              data={librosFiltrados}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.libroItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setForm(f => ({ ...f, libro: item.canon }));
                    setFiltroLibro(item.canon);
                    setShowLibroModal(false);
                  }}
                >
                  <View style={[styles.testamentoBadge, { backgroundColor: item.testament === 'AT' ? Colors.primary : Colors.accent }]}>
                    <Text style={styles.testamentoText}>{item.testament}</Text>
                  </View>
                  <Text style={[styles.libroNombre, { color: colors.text }]}>{t(item.key)}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.subtext }]}>{t('ningúnLibro')}</Text>
              }
            />
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: Colors.primary }]}
              onPress={() => setShowLibroModal(false)}
            >
              <Text style={styles.closeBtnText}>{t('cancelar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal formulario */}
      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.formTitle, { color: colors.text }]}>✨ {t('nuevoComentario')}</Text>

              <FormField label={t('nombre')} error={errors.nombre} colors={colors}>
                <TextInput 
                  style={[styles.formInput, { borderColor: errors.nombre ? Colors.error : colors.border, color: colors.text }]}
                  placeholder={t('nombre')} 
                  placeholderTextColor={colors.subtext}
                  value={form.nombre} 
                  onChangeText={v => setForm(f => ({ ...f, nombre: v }))} 
                />
              </FormField>

              <FormField label={t('libro')} error={errors.libro} colors={colors}>
                <TouchableOpacity
                  style={[styles.formInput, styles.pickerBtn, { borderColor: errors.libro ? Colors.error : colors.border }]}
                  onPress={() => { setBusquedaLibro(''); setShowLibroModal(true); }}
                >
                  <Text style={{ color: form.libro ? colors.text : colors.subtext }}>
                    {form.libro || '📚 ' + t('seleccioneLibro')}
                  </Text>
                </TouchableOpacity>
              </FormField>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <FormField label={t('capitulo')} error={errors.capitulo} colors={colors} style={{ flex: 1 }}>
                  <TextInput 
                    style={[styles.formInput, { borderColor: errors.capitulo ? Colors.error : colors.border, color: colors.text }]}
                    placeholder="1" 
                    placeholderTextColor={colors.subtext} 
                    keyboardType="numeric"
                    value={form.capitulo} 
                    onChangeText={v => setForm(f => ({ ...f, capitulo: v }))} 
                  />
                </FormField>
                <FormField label={t('versiculo')} error={errors.versiculo} colors={colors} style={{ flex: 1 }}>
                  <TextInput 
                    style={[styles.formInput, { borderColor: errors.versiculo ? Colors.error : colors.border, color: colors.text }]}
                    placeholder="1" 
                    placeholderTextColor={colors.subtext} 
                    keyboardType="numeric"
                    value={form.versiculo} 
                    onChangeText={v => setForm(f => ({ ...f, versiculo: v }))} 
                  />
                </FormField>
              </View>

              <FormField label={t('comentario')} error={errors.comentario} colors={colors}>
                <TextInput 
                  style={[styles.formInput, styles.textArea, { borderColor: errors.comentario ? Colors.error : colors.border, color: colors.text }]}
                  placeholder={t('comentario')} 
                  placeholderTextColor={colors.subtext} 
                  multiline 
                  numberOfLines={5}
                  value={form.comentario} 
                  onChangeText={v => setForm(f => ({ ...f, comentario: v }))} 
                />
              </FormField>

              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: Colors.primary }]} onPress={handleSend} disabled={sending}>
                {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>🚀 {t('enviar')}</Text>}
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

const FormField = ({ label, error, children, style, colors }: any) => (
  <View style={[{ marginBottom: 16 }, style]}>
    <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '700', marginBottom: 6 }}>{label}</Text>
    {children}
    {error && <Text style={{ color: Colors.error, fontSize: 12, marginTop: 4 }}>⚠️ {error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  
  filterContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    marginHorizontal: 12, 
    marginTop: 12, 
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    gap: 8 
  },
  filterPicker: { 
    height: 44, 
    borderWidth: 1.5, 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    justifyContent: 'center',
    flex: 2 
  },
  filterInput: { 
    height: 44, 
    borderWidth: 1.5, 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    fontSize: 14,
    width: 80 
  },
  searchBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2 
  },
  searchIcon: { fontSize: 18 },
  
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontSize: 13, fontWeight: '800' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  deleteIcon: { fontSize: 20 },
  cardBody: { marginBottom: 8 },
  author: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  commentText: { fontSize: 15, lineHeight: 22 },
  date: { fontSize: 11, textAlign: 'right', marginTop: 8 },
  
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
    maxHeight: height * 0.85,
    elevation: 10 
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  searchInput: { height: 50, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, fontSize: 16 },
  libroItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, gap: 12 },
  testamentoBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  testamentoText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  libroNombre: { fontSize: 16, fontWeight: '600' },
  closeBtn: { marginTop: 16, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  formTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  formInput: { height: 50, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  pickerBtn: { justifyContent: 'center' },
  textArea: { height: 120, paddingTop: 12, textAlignVertical: 'top' },
  sendBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, elevation: 3 },
  sendBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  cancelBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5 },
});
