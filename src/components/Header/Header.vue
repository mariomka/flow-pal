<template>
  <header class="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between p-4 sm:p-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">FlowPal</h1>
      <div class="flex items-center space-x-2">
        <div 
          v-if="loadingApiKey" 
          class="mr-2 flex items-center text-sm text-gray-500 dark:text-gray-400"
        >
          <span class="mr-2">Loading settings...</span>
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        </div>
        <button 
          @click="toggleSettings"
          class="flex items-center rounded-md p-2 text-sm transition-colors hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-800"
          aria-label="Settings"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <ThemeSwitcher />
      </div>
    </div>
  </header>
</template>

<script setup>
import { defineEmits } from 'vue'
import ThemeSwitcher from '../ThemeSwitcher.vue'

defineProps({
  loadingApiKey: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-settings'])

function toggleSettings() {
  emit('toggle-settings')
}
</script> 