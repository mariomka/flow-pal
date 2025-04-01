<template>
  <div class="relative theme-switcher">
    <button
      @click="toggleDropdown"
      class="flex items-center rounded-md p-2 text-sm transition-colors hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      <IconSun v-if="currentThemeIcon === 'sun'" class="h-5 w-5" />
      <IconMoon v-else-if="currentThemeIcon === 'moon'" class="h-5 w-5" />
      <IconMonitor v-else class="h-5 w-5" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabindex="-1"
    >
      <div class="py-1" role="none">
        <button
          @click="selectTheme(THEMES.LIGHT)"
          class="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="{ 'font-medium': currentTheme === THEMES.LIGHT }"
          role="menuitem"
          tabindex="-1"
        >
          <IconSun class="mr-2 h-4 w-4" />
          Light
        </button>
        <button
          @click="selectTheme(THEMES.DARK)"
          class="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="{ 'font-medium': currentTheme === THEMES.DARK }"
          role="menuitem"
          tabindex="-1"
        >
          <IconMoon class="mr-2 h-4 w-4" />
          Dark
        </button>
        <button
          @click="selectTheme(THEMES.SYSTEM)"
          class="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="{ 'font-medium': currentTheme === THEMES.SYSTEM }"
          role="menuitem"
          tabindex="-1"
        >
          <IconMonitor class="mr-2 h-4 w-4" />
          System
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { THEMES, setTheme, getTheme, isSystemDarkMode } from '../services/theme'
import IconSun from './icons/IconSun.vue'
import IconMoon from './icons/IconMoon.vue'
import IconMonitor from './icons/IconMonitor.vue'

const isOpen = ref(false)
const currentTheme = ref(getTheme())

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectTheme = (theme) => {
  currentTheme.value = theme
  setTheme(theme)
  isOpen.value = false
}

const closeOnOutsideClick = (event) => {
  if (!event.target.closest('.theme-switcher')) {
    isOpen.value = false
  }
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

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
})
</script> 