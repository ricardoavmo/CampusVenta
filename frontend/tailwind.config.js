/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A6192E', // Rojo Carmesí Mate Universitario UTP (Cero Naranja, Sobrio y Elegante)
          hover: '#870E20',
          light: 'rgba(166, 25, 46, 0.08)',
          border: 'rgba(166, 25, 46, 0.2)',
          container: '#FDF2F4',
          'on-container': '#A6192E',
        },
        secondary: {
          DEFAULT: '#334155', // Pizarra Mate Elegante
          hover: '#1E293B',
          light: 'rgba(51, 65, 85, 0.08)',
          container: '#F1F5F9',
        },
        accent: {
          DEFAULT: '#0F766E', // Teal Mate / Verde Bosque Sofisticado
          hover: '#115E59',
          light: 'rgba(15, 118, 110, 0.08)',
          container: '#F0FDFA',
        },
        rating: {
          DEFAULT: '#D97706', // Oro Ámbar Mate
          light: 'rgba(217, 119, 6, 0.12)',
        },
        dark: {
          DEFAULT: '#0F172A',
          surface: '#1E293B',
          card: '#334155',
          muted: '#64748B',
        },
        text: {
          main: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
          inverse: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F8FAFC',
          bg: '#F8FAFC',
          container: '#F1F5F9',
          'container-low': '#F8FAFC',
          'container-high': '#E2E8F0',
        },
        border: {
          DEFAULT: '#E2E8F0',
          hover: '#CBD5E1',
          dark: '#0F172A',
        }
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '28px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)',
        md: '0px 4px 12px rgba(15, 23, 42, 0.07), 0px 2px 4px rgba(15, 23, 42, 0.04)',
        lg: '0px 12px 28px rgba(15, 23, 42, 0.08), 0px 4px 10px rgba(15, 23, 42, 0.03)',
        brutal: '2px 2px 0px #0F172A',
        'brutal-md': '3px 3px 0px #0F172A',
        'brutal-primary': '3px 3px 0px #A6192E',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
