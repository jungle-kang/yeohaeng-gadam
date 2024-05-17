/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'logo': 'clamp(1.5rem, 3vw, 2.5rem)', // 로고용 폰트 크기
        'menu': 'clamp(0.9rem, 2vw, 1rem)', // 메뉴용 폰트 크기
      },
      keyframes: {
        'ping-animation': {
          '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '0' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'ping-animation': 'ping-animation 1s ease-out forwards',
        'fade-out': 'fade-out 2s ease-out forwards',
      },
    },
  },
  plugins: [
  ],
}

