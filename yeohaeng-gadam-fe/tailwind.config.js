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
    },
  },
  plugins: [
  ],
}

