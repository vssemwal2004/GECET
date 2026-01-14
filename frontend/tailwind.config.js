/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#16117bf3',
        'primary-blue': '#311897',
        'accent-yellow': '#FFC200',
        'heading-dark': '#1a1f3a',
        'pure-white': '#ffffff',
        'text-muted': '#6b7280',
      },
    },
  },
  plugins: [],
}
