<template>
  <button
    @click="cycleTheme"
    class="flex items-center rounded-md p-1.5 text-xs transition-colors text-gray-600/60 hover:text-gray-800 dark:text-gray-400/60 dark:hover:text-white hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-800"
    aria-label="Toggle theme"
  >
    <IconSun v-if="currentThemeIcon === 'sun'" class="h-4 w-4" />
    <IconMoon v-else-if="currentThemeIcon === 'moon'" class="h-4 w-4" />
    <IconMonitor v-else class="h-4 w-4" />
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { THEMES, setTheme, getTheme, isSystemDarkMode } from '../services/theme'
import IconSun from './icons/IconSun.vue'
import IconMoon from './icons/IconMoon.vue'
import IconMonitor from './icons/IconMonitor.vue'

const currentTheme = ref(getTheme())

// Cycle through themes: light → dark → system
const cycleTheme = () => {
  if (currentTheme.value === THEMES.LIGHT) {
    currentTheme.value = THEMES.DARK
  } else if (currentTheme.value === THEMES.DARK) {
    currentTheme.value = THEMES.SYSTEM
  } else {
    currentTheme.value = THEMES.LIGHT
  }
  
  setTheme(currentTheme.value)
}

const currentThemeIcon = computed(() => {
  if (currentTheme.value === THEMES.LIGHT) {
    return 'sun'
  } else if (currentTheme.value === THEMES.DARK) {
    return 'moon'
  } else if (currentTheme.value === THEMES.SYSTEM) {
    return 'monitor'
  } else {
    // Fallback to system preference
    return isSystemDarkMode() ? 'moon' : 'sun'
  }
})
</script> 