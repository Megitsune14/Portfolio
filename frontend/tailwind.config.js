/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jinx: '#9B5DF5',
        rouge: '#ED4245',
        orange: '#FAA61A',
        vert: '#57F287',
        violet: '#9400D3',
        dark: '#0a0a0a',
        darker: '#050505',
        light: '#ffffff',
        gray: '#666666',
        'light-gray': '#f5f5f5',
        discord: '#7289DA',
        spotify: '#1DB954',
        battlenet: '#0070D2',
        twitch: '#9146FF',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9B5DF5, #9400D3)',
        'gradient-secondary': 'linear-gradient(135deg, #FAA61A, #ED4245)',
        'gradient-accent': 'linear-gradient(135deg, #57F287, #9B5DF5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'bounce': 'bounce 2s infinite',
        'pulse': 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        bounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '40%': { transform: 'translateX(-50%) translateY(-10px)' },
          '60%': { transform: 'translateX(-50%) translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
