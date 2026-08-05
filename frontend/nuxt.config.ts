export default defineNuxtConfig({
  compatibilityDate: '2026-07-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000/api/v1'
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  }
})
