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
        // 다른 이용자 핑
        'ping-animation': {
          '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0.5' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '0' },
        },
        // 내 핑 효과
        'ping-animation-once': {
          '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0.5' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '0' },
        },
        // 내 핑 핀
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // 좋아요
        // 'pop-out': {
        //   '0%': { transform: 'scale(0.6)' },
        //   '50%': { transform: 'scale(5)' },
        //   '100%': { transform: 'scale(1)' },
        // },
      },
      animation: {
        'ping-animation': 'ping-animation 0.7s forwards infinite',
        'ping-animation-once': 'ping-animation 0.7s forwards',
        'fade-out': 'fade-out 0.7s forwards',
        // 'pop-out': 'pop-out 0.2s ease-in-out forwards',
      },
    },
  },
  plugins: [
  ],
}

