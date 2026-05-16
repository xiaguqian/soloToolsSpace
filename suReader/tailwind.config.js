/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cream': '#FFF8DC',
        'sepia': '#F4E4BA',
        'night': '#1a1a2e',
        'night-light': '#16213e',
      },
      fontFamily: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
        'sans': ['Microsoft YaHei', 'SimHei', 'sans-serif'],
      },
      backgroundImage: {
        'paper': "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"%3E%3Cpath fill=\"%23d4c4a8\" fill-opacity=\"0.3\" d=\"M0 0h100v100H0z\"/%3E%3C/svg%3E')",
        'dark-paper': "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"%3E%3Cpath fill=\"%232a2a3e\" fill-opacity=\"0.3\" d=\"M0 0h100v100H0z\"/%3E%3C/svg%3E')",
        'grid': "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"%3E%3Cpath fill=\"%23c4b896\" fill-opacity=\"0.2\" d=\"M0 0h20v20H0z\"/%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [],
}
