import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { initializeTheme } from './services/theme'

// Initialize theme before mounting the app
initializeTheme();

createApp(App).mount('#app')
