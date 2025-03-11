/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: '#0062FF',
        rightBlue: '#E7F2FD',
        lightestGray: '#F2F3F5',
        lightGray: '#D9D9D9',
        mediumGray: 'B1B7C1',
        darkGray: '#808080',
        green: '#1EC997',
        red: '#EA4335',
        rightImpossible: '#FEE1DF',
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
    },
  },
  plugins: [],
};
