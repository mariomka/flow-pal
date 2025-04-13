<template>
  <header class="sticky top-0 z-10 bg-transparent dark:bg-transparent backdrop-blur-sm">
    <div class="flex items-center justify-between p-1.5 sm:p-1.5">
      <h1 class="text-sm font-normal text-gray-500/60 dark:text-gray-400/60 cursor-default uppercase tracking-wider">FlowPal</h1>
      <div class="flex items-center space-x-2">
        <select 
          v-model="selectedStyle" 
          @change="updateWritingStyle"
          class="h-6 rounded-md border-0 bg-transparent px-2 py-0 text-xs text-gray-600/90 ring-0 focus:ring-0 dark:text-gray-400/90 appearance-none focus:outline-none cursor-pointer"
          :class="{ 'opacity-70': selectedStyle === 'preserve' }"
        >
          <option v-for="style in writingStyles" :key="style.id" :value="style.id">
            {{ style.label }}
          </option>
        </select>
        <button 
          @click="clearText"
          class="flex items-center rounded-md p-1.5 text-xs transition-colors text-gray-600/60 hover:text-gray-800 dark:text-gray-400/60 dark:hover:text-white hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-800"
          aria-label="Clear text"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button 
          @click="toggleSettings"
          class="flex items-center rounded-md p-1.5 text-xs transition-colors text-gray-600/60 hover:text-gray-800 dark:text-gray-400/60 dark:hover:text-white hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-800"
          aria-label="Settings"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
import ThemeSwitcher from '../ThemeSwitcher.vue'
import { ref } from 'vue'

const props = defineProps({
  writingStyle: {
    type: String,
    default: 'preserve'
  },
  writingStyles: {
    type: Array,
    default: () => [
      { id: 'preserve', label: 'Default' },
      { id: 'business', label: 'Business' },
      { id: 'technical', label: 'Technical' },
      { id: 'casual', label: 'Casual' },
      { id: 'marketing', label: 'Marketing' },
      { id: 'simple', label: 'Simple' }
    ]
  }
})

const emit = defineEmits(['toggle-settings', 'update:writing-style', 'clear-text'])

const selectedStyle = ref(props.writingStyle)

function toggleSettings() {
  emit('toggle-settings')
}

function updateWritingStyle() {
  emit('update:writing-style', selectedStyle.value)
}

function clearText() {
  emit('clear-text')
}
</script>

<style scoped>
/* Custom select appearance */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23606060'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-position: right 0.25rem center;
  background-repeat: no-repeat;
  background-size: 1em 1em;
  padding-right: 1.5rem;
}

/* Dark mode select dropdown icon */
@media (prefers-color-scheme: dark) {
  select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23909090'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  }
}
</style> 