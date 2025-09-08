/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: '#0062FF',
        lightBlue: '#E7F2FD',
        lightBlueImpossible: '#B2D0FF',
        lightestGray: '#F2F3F5',
        lightGray: '#D9D9D9',
        mediumGray: '#B1B7C1',
        darkGray: '#808080',
        green: '#1EC997',
        red: '#EA4335',
        lightImpossible: '#FEE1DF',
        black: '#000000',
        white: '#ffffff',
      },
      borderRadius: {
        xs: '7.5px',
        sm: '10px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '30px',
      },
      fontSize: {
        xs: '10px',
        sm: '11px',
        tiny: '12px',
        base: '14px',
        md: '16px',
        lg: '18px',
      },
    },
    keyframes: {
      pulse: {
        '50%': { opacity: '0.2' },
      },
      ping: {
        '75%': { transform: 'scale(2)', opacity: 0 },
        '100%': { transform: 'scale(2)', opacity: 0 },
      },
      animation: {
        pulse: 'pulse 0.5s ease-in-out infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;',
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern:
        /(bg|text)-(blue|rightBlue|lightestGray|lightGray|mediumGray|darkGray|green|red|rightImpossible|black|white|)/,
    },
  ],
};
