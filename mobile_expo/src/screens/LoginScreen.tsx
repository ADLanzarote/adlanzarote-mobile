import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, Platform, ScrollView,
  Animated, Alert, ActivityIndicator, Dimensions, SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import client from '../api/client';

const logoImg = require('../../assets/logo.png');

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function LoginScreen() {
  const { t } = useTranslation();
  const { setAuth } = useAuth();
  const { colors, isDark } = useTheme();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!usuario.trim() || !password.trim()) {
      Alert.alert('', t('loginRequired'));
      return;
    }
    setLoading(true);
    try {
      const res = await client.post('/auth/login', { usuario: usuario.trim(), password });
      await setAuth(res.data.user, res.data.token);
    } catch (err: any) {
      shake();
      const msg = err.response?.data?.error || t('loginError');
      Alert.alert('', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? Colors.darkBg : '#F0F7F8' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.card, 
              { 
                opacity: fadeAnim,
                transform: [
                  { translateX: shakeAnim },
                  { scale: scaleAnim }
                ],
                backgroundColor: isDark ? Colors.darkCard : '#fff',
                width: isTablet ? 480 : width * 0.9,
              }
            ]}
          >
            {/* Logo Container */}
            <View style={styles.logoContainer}>
              <View style={[styles.logoWrapper, { backgroundColor: Colors.primary + '15' }]}>
                <Image
                  source={logoImg}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={[styles.subtitle, { color: isDark ? Colors.darkSubtext : Colors.lightSubtext }]}>
              Iglesia Evangélica Asamblea de Dios
            </Text>

            <Text style={[styles.welcome, { color: isDark ? Colors.darkText : Colors.lightText }]}>
              👋 ¡Bienvenido!
            </Text>

            {/* Campo usuario */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                borderColor: isDark ? Colors.darkBorder : Colors.lightBorder,
                backgroundColor: isDark ? Colors.darkBg : '#F8FAFA'
              }]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={[styles.input, { color: isDark ? Colors.darkText : Colors.lightText }]}
                  placeholder={t('usuario')}
                  placeholderTextColor={isDark ? Colors.darkSubtext : Colors.lightSubtext}
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Campo contraseña */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                borderColor: isDark ? Colors.darkBorder : Colors.lightBorder,
                backgroundColor: isDark ? Colors.darkBg : '#F8FAFA'
              }]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: isDark ? Colors.darkText : Colors.lightText }]}
                  placeholder={t('password')}
                  placeholderTextColor={isDark ? Colors.darkSubtext : Colors.lightSubtext}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón */}
            <TouchableOpacity
              style={[styles.btn, { 
                backgroundColor: Colors.primary,
                opacity: loading ? 0.7 : 1 
              }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>🚀 {t('loginBtn')}</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={[styles.accentBar, { backgroundColor: Colors.accent }]} />
              <Text style={[styles.footerText, { color: isDark ? Colors.darkSubtext : Colors.lightSubtext }]}>
                © 2024 AD Lanzarote
              </Text>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  keyboardView: { 
    flex: 1 
  },
  scroll: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  card: {
    borderRadius: 24,
    padding: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    alignItems: 'center',
  },
  logoContainer: { 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: { 
    width: 100, 
    height: 100 
  },
  subtitle: { 
    fontSize: 13, 
    textAlign: 'center', 
    marginBottom: 8,
    fontStyle: 'italic',
    opacity: 0.8
  },
  welcome: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 28,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: { 
    fontSize: 20, 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    fontSize: 16,
    fontWeight: '500'
  },
  eyeBtn: { 
    padding: 8 
  },
  btn: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  btnText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '800',
    letterSpacing: 0.5 
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  accentBar: {
    height: 4,
    width: 50,
    borderRadius: 2,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
