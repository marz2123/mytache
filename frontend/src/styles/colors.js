// Palette de couleurs cohérente pour l'application
export const colors = {
  // Couleurs primaires
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Couleur principale
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Couleurs secondaires (gris)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Couleurs d'état
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Vert succès
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Rouge erreur
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Orange warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Couleurs neutres
  white: '#FFFFFF',
  black: '#000000',
};

// Classes CSS utilitaires pour les couleurs
export const colorClasses = {
  // Couleurs de fond
  'bg-primary': `bg-[${colors.primary[500]}]`,
  'bg-primary-light': `bg-[${colors.primary[100]}]`,
  'bg-success': `bg-[${colors.success[500]}]`,
  'bg-error': `bg-[${colors.error[500]}]`,
  'bg-warning': `bg-[${colors.warning[500]}]`,
  'bg-gray-light': `bg-[${colors.gray[100]}]`,
  
  // Couleurs de texte
  'text-primary': `text-[${colors.primary[500]}]`,
  'text-success': `text-[${colors.success[500]}]`,
  'text-error': `text-[${colors.error[500]}]`,
  'text-warning': `text-[${colors.warning[500]}]`,
  'text-gray': `text-[${colors.gray[500]}]`,
  'text-gray-dark': `text-[${colors.gray[700]}]`,
  
  // Couleurs de bordure
  'border-primary': `border-[${colors.primary[500]}]`,
  'border-gray': `border-[${colors.gray[300]}]`,
  'border-success': `border-[${colors.success[500]}]`,
  'border-error': `border-[${colors.error[500]}]`,
}; 