
import type {Config} from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          '"SF Pro"',
          '"SF Pro Display"',
          '"SF Pro Icons"',
          '"SF Pro Text"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      colors: {
        'system-green': '#34C759',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'scroll-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'scroll-up': {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
         heartbeat: {
            '0%': { transform: 'scale(1)', },
            '10%': { transform: 'scale(1.02)', },
            '20%': { transform: 'scale(1)', },
            '30%': { transform: 'scale(1.02)', },
            '40%': { transform: 'scale(1)', },
            '100%': { transform: 'scale(1)', },
        },
        "join-letters": {
          '0%': { 'letter-spacing': '0.5em', opacity: '0' },
          '40%': { opacity: '0.6' },
          '100%': { 'letter-spacing': 'normal', opacity: '1' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-20%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pop-in': {
            '0%': { transform: 'scale(0.5)', opacity: '0' },
            '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'carousel-active-item': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'carousel-inactive-item': {
            '0%, 100%': { opacity: '1', transform: 'scale(1)' },
            '50%': { opacity: '0.5', transform: 'scale(0.9)' },
        },
        'roll-number': {
          '0%': { transform: 'translateY(-10em)' },
          '100%': { transform: 'translateY(calc(-1em * var(--final-digit)))' },
        },
        'scroll-x': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-out-shrink': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'scroll-down': 'scroll-down 40s linear infinite',
        'scroll-up': 'scroll-up 40s linear infinite',
        'heartbeat': 'heartbeat 2s ease-in-out',
        'join-letters': 'join-letters 1s ease-in-out forwards',
        "slide-in-from-left": "slide-in-from-left 0.5s ease-out",
        'pop-in': 'pop-in 0.4s ease-out forwards',
        'carousel-active': 'carousel-active-item 1s ease-in-out forwards',
        'carousel-inactive': 'carousel-inactive-item 1s ease-in-out forwards',
        'roll-number': 'roll-number 2s cubic-bezier(.17,.84,.44,1) forwards',
        'scroll-x': 'scroll-x 40s linear infinite',
        'fade-out-shrink': 'fade-out-shrink 0.3s ease-out forwards',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
