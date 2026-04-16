import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, SafeAreaView, Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
  colors: any;
}

const MenuItem = ({ icon, title, subtitle, onPress, color, colors }: MenuItemProps) => (
  <TouchableOpacity 
    style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Text style={[styles.icon, { color }]}>{icon}</Text>
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={2}>{subtitle}</Text>
    </View>
    <Text style={[styles.arrow, { color: color }]}>→</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();

  const openWebsite = () => {
    Linking.openURL('https://adlanzarote.es');
  };

  const openMaps = () => {
    const address = 'Calle José Pereyra Galviaty, 25, Arrecife, Las Palmas';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const openYouTube = () => {
    Linking.openURL('https://www.youtube.com/@asambleadediosjesucristopa9877');
  };

  const goToComentarios = () => {
    navigation.navigate('Comentarios');
  };

  const goToAportes = () => {
    navigation.navigate('Aportes');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title="AD Lanzarote" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Card */}
        <View style={[styles.welcomeCard, { backgroundColor: Colors.primary }]}>
          <Text style={styles.welcomeEmoji}>⛪</Text>
          <Text style={styles.welcomeTitle}>Bienvenido</Text>
          <Text style={styles.welcomeName}>{user?.nombre || 'Hermano'}</Text>
          <Text style={styles.welcomeSubtitle}>Iglesia Evangélica Asamblea de Dios</Text>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuContainer}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>ACCESOS RÁPIDOS</Text>
          
          <View style={styles.menuGrid}>
            <MenuItem
              icon="🌐"
              title="Página Web"
              subtitle="adlanzarote.es"
              onPress={openWebsite}
              color={Colors.primary}
              colors={colors}
            />
            
            <MenuItem
              icon="📍"
              title="Ubicación"
              subtitle="Calle José Pereyra Galviaty, 25, Arrecife"
              onPress={openMaps}
              color={Colors.accent}
              colors={colors}
            />
            
            <MenuItem
              icon="📺"
              title="Canal de Videos"
              subtitle="@asambleadediosjesucristopa9877"
              onPress={openYouTube}
              color="#FF0000"
              colors={colors}
            />
            
            <MenuItem
              icon="📖"
              title="Comentarios Bíblicos"
              subtitle="Ver y añadir comentarios a pasajes bíblicos"
              onPress={goToComentarios}
              color="#8E44AD"
              colors={colors}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>ACCIONES</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
              onPress={goToComentarios}
            >
              <Text style={styles.actionIcon}>📖</Text>
              <Text style={styles.actionText}>Comentarios</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: Colors.accent }]}
              onPress={goToAportes}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>Aportes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => navigation.navigate('Configuracion')}
            >
              <Text style={[styles.actionIcon, { color: colors.text }]}>⚙️</Text>
              <Text style={[styles.actionText, { color: colors.text }]}>Ajustes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            © 2024 AD Lanzarote
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.subtext }]}>
            Asamblea de Dios en Lanzarote
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  
  welcomeCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  welcomeEmoji: { fontSize: 48, marginBottom: 8 },
  welcomeTitle: { color: '#fff', fontSize: 16, opacity: 0.9 },
  welcomeName: { color: '#fff', fontSize: 24, fontWeight: '800', marginVertical: 4 },
  welcomeSubtitle: { color: '#fff', fontSize: 13, opacity: 0.8, textAlign: 'center' },
  
  menuContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12, marginTop: 8 },
  menuGrid: { gap: 12 },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 24 },
  textContainer: { flex: 1, marginLeft: 14 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2, opacity: 0.7 },
  arrow: { fontSize: 20, fontWeight: '700' },
  
  quickActions: { paddingHorizontal: 16, marginTop: 24 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
  },
  actionIcon: { fontSize: 24, color: '#fff' },
  actionText: { fontSize: 12, color: '#fff', fontWeight: '700', marginTop: 4 },
  
  footer: { alignItems: 'center', marginTop: 32, paddingVertical: 16 },
  footerText: { fontSize: 12, opacity: 0.6 },
  footerSubtext: { fontSize: 11, opacity: 0.5, marginTop: 2 },
});
