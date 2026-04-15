import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Switch, Dimensions, SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import Header from '../components/Header';
import i18next from '../i18n';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const NIVEL_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  admin: { emoji: '⭐', label: 'Administrador', color: Colors.accent },
  tesorero: { emoji: '💰', label: 'Tesorero', color: Colors.primary },
  diacono: { emoji: '🙏', label: 'Diácono', color: '#8E44AD' },
  miembro: { emoji: '👤', label: 'Miembro', color: Colors.subtext },
};

export default function ConfiguracionScreen() {
  const { t } = useTranslation();
  const { colors, isDark, toggleTheme, language, setLanguage } = useTheme();
  const { user, clearAuth } = useAuth();

  const handleChangeLanguage = async (lang: 'es' | 'pt') => {
    setLanguage(lang);
    await i18next.changeLanguage(lang);
  };

  const userInfo = user ? NIVEL_LABELS[user.nivel] : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title={t('configTitle')} showLogout={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Tarjeta de Usuario */}
        <View style={[styles.userCard, { backgroundColor: Colors.primary }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.nombre?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
            {userInfo && (
              <View style={[styles.roleBadge, { backgroundColor: userInfo.color }]}>
                <Text style={styles.roleText}>{userInfo.emoji} {userInfo.label}</Text>
              </View>
            )}
            {user?.email && <Text style={styles.userEmail}>📧 {user.email}</Text>}
            <Text style={styles.userUsername}>👤 @{user?.usuario}</Text>
          </View>
        </View>

        <View style={[styles.content, { maxWidth: isTablet ? 600 : '100%', alignSelf: 'center', width: '100%' }]}>
          
          {/* Sección Idioma */}
          <SectionHeader title={t('idioma')} icon="🌐" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LangOption
              label="🇪🇸  Español"
              selected={language === 'es'}
              onPress={() => handleChangeLanguage('es')}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <LangOption
              label="🇧🇷  Português"
              selected={language === 'pt'}
              onPress={() => handleChangeLanguage('pt')}
              colors={colors}
            />
          </View>

          {/* Sección Tema */}
          
          <SectionHeader title={t('tema')} icon="🎨" colors={colors} />
          
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeEmoji, { color: colors.text }]}>{isDark ? '🌙' : '☀️'}</Text>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    {isDark ? t('modoOscuro') : t('modoClaro')}
                  </Text>
                  <Text style={[styles.rowSubtext, { color: colors.subtext }]}>
                    {isDark ? 'Perfecto para la noche' : 'Ideal para el día'}
                  </Text>
                </View>
              </View>
              
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: Colors.primary + '80' }}
                thumbColor={isDark ? Colors.accent : '#fff'}
              />
            </View>
          </View>

          {/* Sección Información */}
          
          <SectionHeader title={t('version')} icon="📱" colors={colors} />
          
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow label="App" value="ADLanzarote v1.0.0" colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <InfoRow label="Iglesia" value="Asamblea de Dios Lanzarote" colors={colors} />
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <InfoRow label="Web" value="adlanzarote.es" colors={colors} />
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.row} onPress={() => {}}>
              <Text style={[styles.rowLabel, { color: Colors.primary }}>🌐 facebook.com/ADLanzarote</Text>
            </TouchableOpacity>
          </View>

          {/* Botón Logout */}
          
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: Colors.error + '15', borderColor: Colors.error }]}
            onPress={clearAuth}
          >
            <Text style={[styles.logoutText, { color: Colors.error }]}>🚪  {t('logout')}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SectionHeader = ({ title, icon, colors }: { title: string; icon: string; colors: any }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionIcon}>{icon}</Text>
    <Text style={[styles.sectionTitle, { color: colors.subtext }]}>{title.toUpperCase()}</Text>
  </View>
);

const LangOption = ({ label, selected, onPress, colors }: any) => (
  <TouchableOpacity style={styles.langRow} onPress={onPress}>
    <Text style={[styles.langLabel, { color: colors.text }]}>{label}</Text>
    {selected && (
      <View style={[styles.checkBadge, { backgroundColor: Colors.primary }]}>
        <Text style={styles.checkText}>✓</Text>
      </View>
    )}
  </TouchableOpacity>
);

const InfoRow = ({ label, value, colors }: any) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, { color: colors.subtext }]}>{label}</Text>
    <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    padding: 20, 
    paddingTop: 16, 
    paddingBottom: 24,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarContainer: { alignItems: 'center' },
  avatar: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: Colors.accent, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  roleBadge: { 
    alignSelf: 'flex-start',
    borderRadius: 8, 
    paddingHorizontal: 10, 
    paddingVertical: 4,
    marginTop: 6,
  },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 6 },
  userUsername: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  
  content: { padding: 16 },
  
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 24, 
    marginBottom: 10, 
    marginLeft: 4,
    gap: 8,
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  
  card: { 
    borderRadius: 16, 
    borderWidth: 1, 
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  langRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 16,
  },
  langLabel: { fontSize: 16, fontWeight: '600' },
  checkBadge: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 14,
  },
  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeEmoji: { fontSize: 28 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSubtext: { fontSize: 12, marginTop: 2 },
  rowValue: { fontSize: 14, fontWeight: '500' },
  
  divider: { height: 1, marginHorizontal: 16 },
  
  logoutBtn: { 
    marginTop: 32, 
    borderRadius: 16, 
    borderWidth: 2, 
    paddingVertical: 18, 
    alignItems: 'center',
    elevation: 2,
  },
  logoutText: { fontSize: 17, fontWeight: '800' },
});
