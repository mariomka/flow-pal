<template>
  <div class="h-screen min-h-screen bg-white dark:bg-gray-800 flex flex-col text-gray-900 dark:text-white overflow-hidden">
    <Header 
      :writing-style="writingStyle"
      :writing-styles="WRITING_STYLES"
      @update:writing-style="writingStyle = $event"
      @toggle-settings="showSettings = !showSettings"
      @clear-text="clearText"
    />
    
    <main class="flex-1 flex flex-col overflow-hidden">
      <TextEditor
        v-model:text="inputText"
        :writing-style="writingStyle"
        :english-region="englishRegion"
        :custom-instructions="customInstructions"
        :font-family="fontFamily"
        :font-size="fontSize"
        :line-height="lineHeight"
        ref="textareaRef"
        class="flex-1"
      />
      
      <!-- Footer with GitHub Link and Word Count -->
      <div class="py-1 px-2 text-right flex justify-between items-center">
        <a 
          href="https://github.com/mariomka/flow-pal" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 opacity-80 hover:opacity-100 transition-opacity"
        >
          GitHub
        </a>
        <div class="text-xs text-gray-400 dark:text-gray-600">
          {{ wordCount }} words, {{ charCount }} characters
        </div>
      </div>
    </main>

    <!-- Error Toast -->
    <div 
      v-if="error" 
      class="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-100 p-3 sm:p-4 rounded max-w-[90%] sm:max-w-md z-50 text-sm"
      role="alert"
    >
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold">Error</p>
          <p>{{ error }}</p>
        </div>
        <button 
          @click="error = null"
          class="ml-4 text-red-700 hover:text-red-900 dark:text-red-200 dark:hover:text-red-100"
        >
          ×
        </button>
      </div>
    </div>

    <SettingsModal
      :show="showSettings"
      :initial-api-key="openAIKey"
      :writing-style="writingStyle"
      :english-region="englishRegion"
      :custom-instructions="customInstructions"
      :writing-styles="WRITING_STYLES"
      :english-regions="ENGLISH_REGIONS"
      :font-family="fontFamily"
      :font-size="fontSize"
      :line-height="lineHeight"
      :font-families="FONT_FAMILIES"
      :font-sizes="FONT_SIZES"
      :line-heights="LINE_HEIGHTS"
      @update:api-key="openAIKey = $event"
      @update:writing-style="writingStyle = $event"
      @update:english-region="englishRegion = $event"
      @update:custom-instructions="customInstructions = $event"
      @update:font-family="fontFamily = $event"
      @update:font-size="fontSize = $event"
      @update:line-height="lineHeight = $event"
      @close="showSettings = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

// Import components
import Header from './components/Header/Header.vue'
import TextEditor from './components/TextEditor/TextEditor.vue'
import SettingsModal from './components/SettingsModal/SettingsModal.vue'

const STORAGE_KEYS = {
  INPUT: 'writer-input-text',
  ONLY_GRAMMAR: 'writer-only-grammar',
  WRITING_STYLE: 'writer-style',
  ENGLISH_REGION: 'writer-english-region',
  CUSTOM_INSTRUCTIONS: 'writer-custom-instructions',
  API_KEY: 'openai_api_key',
  FONT_FAMILY: 'writer-font-family',
  FONT_SIZE: 'writer-font-size',
  LINE_HEIGHT: 'writer-line-height'
}

// Writing styles
const WRITING_STYLES = [
  { id: 'preserve', label: 'Preserve Original Style', description: 'Maintain the original writing style while fixing errors' },
  { id: 'business', label: 'Business', description: 'Professional and clear tone for business communication' },
  { id: 'technical', label: 'Technical', description: 'Precise and detailed tone for technical documentation' },
  { id: 'casual', label: 'Casual', description: 'Friendly and conversational tone' },
  { id: 'marketing', label: 'Marketing', description: 'Engaging and persuasive tone for promotional content' },
  { id: 'simple', label: 'Simple', description: 'Clear and easy-to-understand language for general audiences' }
]

// English region options
const ENGLISH_REGIONS = [
  { id: 'default', label: 'Default', description: 'Default English without specific regional preferences' },
  { id: 'us', label: 'US English', description: 'American English spelling and expressions' },
  { id: 'uk', label: 'UK English', description: 'British English spelling and expressions' },
  { id: 'au', label: 'Australian English', description: 'Australian English spelling and expressions' },
  { id: 'ca', label: 'Canadian English', description: 'Canadian English spelling and expressions' }
]

// Font settings
const FONT_FAMILIES = [
  { id: 'serif', label: 'Serif', description: 'Traditional serif font for easier reading of long texts' },
  { id: 'sans', label: 'Sans-serif', description: 'Clean sans-serif font for modern look' },
  { id: 'mono', label: 'Monospace', description: 'Fixed-width font, good for code and technical content' }
]

const FONT_SIZES = [
  { id: 'small', label: 'Small', description: 'Smaller text size for compact viewing' },
  { id: 'medium', label: 'Medium', description: 'Standard comfortable reading size' },
  { id: 'large', label: 'Large', description: 'Larger text size for improved readability' }
]

const LINE_HEIGHTS = [
  { id: 'dense', label: 'Dense', description: 'Compact line spacing' },
  { id: 'normal', label: 'Normal', description: 'Standard line spacing for comfortable reading' },
  { id: 'relaxed', label: 'Relaxed', description: 'More spacious line spacing for easier reading' }
]

// State
const inputText = ref(localStorage.getItem(STORAGE_KEYS.INPUT) || '')
const onlyGrammar = ref(localStorage.getItem(STORAGE_KEYS.ONLY_GRAMMAR) === 'true')
const error = ref(null)
const writingStyle = ref(localStorage.getItem(STORAGE_KEYS.WRITING_STYLE) || 'preserve')
const englishRegion = ref(localStorage.getItem(STORAGE_KEYS.ENGLISH_REGION) || 'default')
const customInstructions = ref(localStorage.getItem(STORAGE_KEYS.CUSTOM_INSTRUCTIONS) || '')
const fontFamily = ref(localStorage.getItem(STORAGE_KEYS.FONT_FAMILY) || 'serif')
const fontSize = ref(localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || 'medium')
const lineHeight = ref(localStorage.getItem(STORAGE_KEYS.LINE_HEIGHT) || 'normal')
const textareaRef = ref(null)
const openAIKey = ref(localStorage.getItem(STORAGE_KEYS.API_KEY) || '')
const showSettings = ref(false)

// Computed properties for word and character count
const charCount = computed(() => inputText.value.length)
const wordCount = computed(() => {
  if (!inputText.value.trim()) return 0
  
  // Count words by splitting on whitespace
  return inputText.value
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
})

// Watch for changes and save to localStorage
watch(inputText, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.INPUT, newValue)
})

watch(onlyGrammar, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.ONLY_GRAMMAR, newValue)
})

watch(writingStyle, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.WRITING_STYLE, newValue)
})

watch(englishRegion, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.ENGLISH_REGION, newValue)
})

watch(customInstructions, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_INSTRUCTIONS, newValue)
})

watch(openAIKey, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.API_KEY, newValue)
})

watch(fontFamily, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.FONT_FAMILY, newValue)
})

watch(fontSize, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.FONT_SIZE, newValue)
})

watch(lineHeight, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.LINE_HEIGHT, newValue)
})

onMounted(() => {
  // Check if API key is configured and show settings for new users if needed
  if (!openAIKey.value.trim()) {
    showSettings.value = true;
  }
})

function clearText() {
  // Clear the input text
  inputText.value = ''
  // Focus the textarea after clearing - only in non-test environment
  if (textareaRef.value && textareaRef.value.$el) {
    const textarea = textareaRef.value.$el.querySelector('textarea')
    if (textarea) {
      textarea.focus()
    }
  }
}
</script>

<style>
/* All styles now come from src/style.css */
</style>
