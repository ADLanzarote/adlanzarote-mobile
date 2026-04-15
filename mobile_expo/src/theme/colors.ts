// Paleta de colores basada en el logo de Iglesia AD Lanzarote
export const Colors = {
  primary: '#1D7D8A',      // Teal del logo
  primaryDark: '#145C67',  // Teal oscuro
  primaryLight: '#3AABB9', // Teal claro
  accent: '#E8612A',       // Naranja del logo (llamas)
  accentDark: '#C44E20',   // Naranja oscuro
  accentLight: '#F0825A',  // Naranja claro

  // Modo Light
  lightBg: '#F5F8F8',
  lightCard: '#FFFFFF',
  lightText: '#1A2E32',
  lightSubtext: '#5A7A82',
  lightBorder: '#D0E4E8',
  lightTabBar: '#FFFFFF',

  // Modo Dark
  darkBg: '#0F2D35',
  darkCard: '#1A3D47',
  darkText: '#E8F4F6',
  darkSubtext: '#8FB5BC',
  darkBorder: '#2A5060',
  darkTabBar: '#0F2D35',

  // Generales
  white: '#FFFFFF',
  black: '#000000',
  error: '#E53935',
  success: '#2E7D32',
  warning: '#F57C00',
  transparent: 'transparent',
};

export const getThemeColors = (isDark: boolean) => ({
  bg: isDark ? Colors.darkBg : Colors.lightBg,
  card: isDark ? Colors.darkCard : Colors.lightCard,
  text: isDark ? Colors.darkText : Colors.lightText,
  subtext: isDark ? Colors.darkSubtext : Colors.lightSubtext,
  border: isDark ? Colors.darkBorder : Colors.lightBorder,
  tabBar: isDark ? Colors.darkTabBar : Colors.lightTabBar,
  primary: Colors.primary,
  accent: Colors.accent,
});
