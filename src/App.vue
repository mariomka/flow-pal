<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col text-gray-900 dark:text-white">
    <Header 
      :loading-api-key="loadingApiKey"
      @toggle-settings="showSettings = !showSettings"
    />
    
    <main class="flex-1 p-4 sm:p-4 flex flex-col min-h-0">
      <ProcessingControls
        v-model:only-grammar="onlyGrammar"
        v-model:writing-style="writingStyle"
        v-model:english-region="englishRegion"
        :is-processing="isProcessing"
        :writing-styles="WRITING_STYLES"
        :english-regions="ENGLISH_REGIONS"
        @process="processText"
        @clear="clearText"
      />

      <CustomInstructions
        v-model:instructions="customInstructions"
        v-model:visible="showInstructions"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 flex-1 min-h-0">
        <TextEditor
          v-model:text="inputText"
          ref="textareaRef"
        />
        
        <ProcessedText
          :original-text="inputText"
          :processed-text="processedText"
          v-model:show-diff="showDiff"
          v-model:show-only-additions="showOnlyAdditions"
          @apply="replaceWithProcessed"
          @apply-change="handleChangeClick"
          @change-applied="changeApplied = true; setTimeout(() => changeApplied = false, 2000)"
        />
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

    <!-- Processing indicator -->
    <div 
      v-if="isProcessing" 
      class="fixed bottom-4 left-4 bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 text-blue-700 dark:text-blue-100 p-3 sm:p-4 rounded z-50 text-sm"
    >
      Processing your text...
    </div>
    
    <!-- Change applied indicator -->
    <div 
      v-if="changeApplied" 
      class="fixed bottom-4 left-4 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-100 p-3 sm:p-4 rounded transition-opacity duration-300 z-50 text-sm"
    >
      Change applied!
    </div>

    <SettingsModal
      :show="showSettings"
      :initial-api-key="openAIKey"
      @update:api-key="openAIKey = $event"
      @close="showSettings = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { textProcessor } from './services/llm'
import DiffMatchPatch from 'diff-match-patch'

// Import components
import Header from './components/Header/Header.vue'
import ProcessingControls from './components/ProcessingControls/ProcessingControls.vue'
import CustomInstructions from './components/CustomInstructions/CustomInstructions.vue'
import TextEditor from './components/TextEditor/TextEditor.vue'
import ProcessedText from './components/ProcessedText/ProcessedText.vue'
import SettingsModal from './components/SettingsModal/SettingsModal.vue'

const STORAGE_KEYS = {
  INPUT: 'writer-input-text',
  PROCESSED: 'writer-processed-text',
  ONLY_GRAMMAR: 'writer-only-grammar',
  HANDLE_SPANISH: 'writer-handle-spanish',
  SHOW_DIFF: 'writer-show-diff',
  CUSTOM_INSTRUCTIONS: 'writer-custom-instructions',
  SHOW_INSTRUCTIONS: 'writer-show-instructions',
  WRITING_STYLE: 'writer-style',
  SHOW_ONLY_ADDITIONS: 'writer-show-only-additions',
  ENGLISH_REGION: 'writer-english-region',
  API_KEY: 'openai_api_key'
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

// State
const inputText = ref(localStorage.getItem(STORAGE_KEYS.INPUT) || '')
const processedText = ref(localStorage.getItem(STORAGE_KEYS.PROCESSED) || '')
const onlyGrammar = ref(localStorage.getItem(STORAGE_KEYS.ONLY_GRAMMAR) === 'true')
const customInstructions = ref(localStorage.getItem(STORAGE_KEYS.CUSTOM_INSTRUCTIONS) || '')
const showInstructions = ref(localStorage.getItem(STORAGE_KEYS.SHOW_INSTRUCTIONS) === 'true')
const isProcessing = ref(false)
const error = ref(null)
const showDiff = ref(localStorage.getItem(STORAGE_KEYS.SHOW_DIFF) === 'true')
const writingStyle = ref(localStorage.getItem(STORAGE_KEYS.WRITING_STYLE) || 'preserve')
const englishRegion = ref(localStorage.getItem(STORAGE_KEYS.ENGLISH_REGION) || 'default')
const changeApplied = ref(false)
const textareaRef = ref(null)
const showOnlyAdditions = ref(localStorage.getItem(STORAGE_KEYS.SHOW_ONLY_ADDITIONS) === 'true')
const loadingApiKey = ref(false)
const openAIKey = ref(localStorage.getItem(STORAGE_KEYS.API_KEY) || '')
const showSettings = ref(false)

// Watch for changes and save to localStorage
watch(showDiff, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.SHOW_DIFF, newValue)
})

watch(showInstructions, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.SHOW_INSTRUCTIONS, newValue)
})

watch(inputText, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.INPUT, newValue)
})

watch(processedText, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.PROCESSED, newValue)
})

watch(onlyGrammar, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.ONLY_GRAMMAR, newValue)
})

watch(customInstructions, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_INSTRUCTIONS, newValue)
})

watch(writingStyle, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.WRITING_STYLE, newValue)
})

watch(englishRegion, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.ENGLISH_REGION, newValue)
})

watch(showOnlyAdditions, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.SHOW_ONLY_ADDITIONS, newValue);
})

watch(openAIKey, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.API_KEY, newValue)
})

// Methods
const processText = async () => {
  if (!inputText.value.trim()) {
    error.value = 'Please enter some text to process.'
    return
  }

  isProcessing.value = true
  error.value = null

  try {
    // Check if API key is set
    if (!openAIKey.value.trim()) {
      error.value = 'OpenAI API key is not configured. Please enter your API key in the settings.'
      showSettings.value = true
      return
    }

    const result = await textProcessor.processor(inputText.value, {
      onlyGrammar: onlyGrammar.value,
      handleSpanish: true,
      customInstructions: customInstructions.value,
      writingStyle: writingStyle.value,
      englishRegion: englishRegion.value
    })

    if (!result) {
      throw new Error('No result received from the processor.')
    }

    processedText.value = result
  } catch (err) {
    error.value = err.message
  } finally {
    isProcessing.value = false
  }
}

const replaceWithProcessed = () => {
  if (processedText.value) {
    inputText.value = processedText.value
  }
}

const clearText = () => {
  if (confirm('Are you sure you want to clear all text? This cannot be undone.')) {
    inputText.value = ''
    processedText.value = ''
    error.value = null
  }
}

/**
 * Handle clicking on a change in the diff view
 */
const handleChangeClick = ({ part, index, textDiff }) => {
  // Only process if it's an addition
  if (part[0] !== 1) return;
  
  try {
    // Check if there's a deletion immediately before this addition
    // (this is likely a replacement where we want to replace the deleted text with the added text)
    const replaceMode = index > 0 && textDiff[index-1] && textDiff[index-1][0] === -1;
    if (replaceMode) {
      // This is a replacement scenario (deletion followed by addition)
      // We need to find the position of the deletion in the original text
      
      // Calculate position in the original text up to the deletion
      let position = 0;
      for (let i = 0; i < index - 1; i++) {
        const currentPart = textDiff[i];
        if (!currentPart) continue;
        
        if (currentPart[0] === 0 || currentPart[0] === -1) { // Both unchanged and deleted text contribute to position
          position += currentPart[1].length;
        }
      }
      
      // Get the deletion text from the previous part
      const deletionText = textDiff[index-1][1];
      
      // Replace the deletion with the addition
      const textBefore = inputText.value.substring(0, position);
      const textAfter = inputText.value.substring(position + deletionText.length);
      
      // Apply the replacement
      inputText.value = textBefore + part[1] + textAfter;
    } else {
      // Simple addition - find the position to insert
      let position = 0;
      for (let i = 0; i < index; i++) {
        const currentPart = textDiff[i];
        if (!currentPart) continue;
        
        if (currentPart[0] === 0 || currentPart[0] === -1) { // Both unchanged and deleted text contribute to position
          position += currentPart[1].length;
        }
      }
      
      // Insert the addition
      const textBefore = inputText.value.substring(0, position);
      const textAfter = inputText.value.substring(position);
      
      // Apply the addition
      inputText.value = textBefore + part[1] + textAfter;
    }
    
    // Adjust textarea height
    nextTick(() => {
      if (textareaRef.value?.$el) {
        const textarea = textareaRef.value.$el.querySelector('textarea');
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        }
      }
    });
  } catch (err) {
    error.value = "Failed to apply change. Please try again.";
  }
}

onMounted(() => {
  // Check if API key is configured
  loadingApiKey.value = true;
  setTimeout(() => {
    // We're using localStorage directly for the API key, so just check if it exists
    if (!openAIKey.value.trim()) {
      // For new users, we may want to show settings
      // showSettings.value = true;
    }
    loadingApiKey.value = false;
  }, 500); // Short delay to avoid flickering
})
</script>

<style>
/* All styles now come from src/style.css */
</style>
