<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col text-gray-900 dark:text-white">
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
            @click="showSettings = !showSettings"
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
    
    <main class="flex-1 p-4 sm:p-4 flex flex-col min-h-0">
      <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input 
              type="checkbox" 
              v-model="onlyGrammar"
              class="rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
            >
            Only Fix Grammar
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input 
              type="checkbox" 
              v-model="handleSpanish"
              class="rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
            >
            Handle Spanish Text
          </label>
          <div class="flex items-center gap-2">
            <label for="writing-style" class="text-sm text-gray-600 dark:text-gray-300">Style:</label>
            <select
              id="writing-style"
              v-model="writingStyle"
              class="rounded-md border-gray-300 px-2 py-1 text-xs sm:text-sm min-w-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option 
                v-for="style in WRITING_STYLES" 
                :key="style.id" 
                :value="style.id"
                :title="style.description"
              >
                {{ style.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="processText" 
            :disabled="isProcessing"
            class="btn btn-primary flex items-center gap-2"
          >
            <span v-if="isProcessing">Processing...</span>
            <span v-else>Improve Writing</span>
          </button>
          <button 
            @click="clearText" 
            class="btn btn-secondary"
          >
            Clear All
          </button>
        </div>
      </div>

      <div class="mb-4">
        <button
          @click="showInstructions = !showInstructions"
          class="text-xs sm:text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white flex items-center gap-1"
        >
          <svg 
            class="w-4 h-4 transform transition-transform"
            :class="showInstructions ? 'rotate-0' : '-rotate-90'"
            viewBox="0 0 24 24"
          >
            <path 
              d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
              fill="currentColor"
            />
          </svg>
          <span class="flex items-center">
            Custom Instructions
            <span 
              v-if="!showInstructions && customInstructions.trim()"
              :class="[
                'inline-flex items-center justify-center rounded-full ml-2',
                customInstructions.length > 20 ? 'px-1 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'w-1.5 h-1.5 bg-blue-500'
              ]"
              :title="customInstructions.length > 100 ? 
                      'Custom instructions: ' + customInstructions.substring(0, 100) + '...' : 
                      'Custom instructions: ' + customInstructions"
            >
              <template v-if="customInstructions.length > 20">
                {{ Math.round(customInstructions.length / 10) * 10 }}c
              </template>
            </span>
          </span>
        </button>
      </div>
      <div 
        v-if="showInstructions"
        class="mb-4 transition-all duration-200"
      >
        <div class="flex-1">
          <textarea
            v-model="customInstructions"
            placeholder="Add your custom instructions for the AI here..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows="2"
          ></textarea>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 flex-1 min-h-0">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col flex-1">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Your Text</h2>
            <button
              v-if="inputText"
              @click="copyToClipboard(inputText, 'input')"
              class="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-1 sm:gap-2"
            >
              {{ inputCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <textarea
            ref="textareaRef"
            v-model="inputText"
            placeholder="Start writing here..."
            class="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif text-base sm:text-lg leading-relaxed overflow-hidden resize-none min-h-[150px] flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            @input="adjustTextareaHeight($event)"
          ></textarea>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col min-h-0">
          <div class="flex flex-wrap justify-between items-center mb-4 flex-none">
            <div class="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
              <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Processed Text</h2>
              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input 
                  type="checkbox" 
                  v-model="showDiff"
                  class="rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                Show Changes
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input 
                  type="checkbox" 
                  v-model="showOnlyAdditions"
                  class="rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                Show Only Additions
              </label>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="processedText"
                @click="copyToClipboard(processedText, 'processed')"
                class="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {{ processedCopied ? 'Copied!' : 'Copy' }}
              </button>
              <button
                v-if="processedText"
                @click="replaceWithProcessed"
                class="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-1 sm:gap-2"
              >
                <svg class="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24">
                  <path 
                    :d="mdiArrowLeft" 
                    fill="currentColor"
                  />
                </svg>
                Apply
              </button>
            </div>
          </div>
          <div 
            class="flex-1 w-full p-4 border border-gray-200 dark:border-gray-600 rounded-md overflow-y-auto whitespace-pre-wrap font-serif text-base sm:text-lg leading-relaxed min-h-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <template v-if="showDiff && processedText">
              <template v-for="(part, index) in textDiff" :key="index">
                <span
                  v-if="part[0] === 0 || (showOnlyAdditions && part[0] === 1) || (!showOnlyAdditions && part[0] !== 0)"
                  :class="{
                    'bg-red-100 dark:bg-red-900/50 line-through': part[0] === -1 && !showOnlyAdditions,
                    'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/70 cursor-pointer transition-colors duration-150 border-b border-dashed border-green-400 dark:border-green-600 hover:border-green-500 dark:hover:border-green-500': part[0] === 1,
                  }"
                  @click="part[0] === 1 ? handleChangeClick(part, index) : null"
                  :title="part[0] === 1 ? 'Click to apply this change' : ''"
                >{{ part[1] }}</span>
              </template>
            </template>
            <template v-else>
              {{ processedText }}
            </template>
          </div>
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

    <!-- Settings Modal -->
    <div 
      v-if="showSettings"
      class="settings-modal"
    >
      <div class="settings-content">
        <div class="settings-header">
          <h2 class="text-lg sm:text-xl font-semibold dark:text-white">Settings</h2>
          <button 
            @click="showSettings = false"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="settings-body">
          <div class="form-group">
            <label for="api-key" class="form-label">
              OpenAI API Key
            </label>
            <input
              id="api-key"
              type="password"
              v-model="openAIKey"
              placeholder="sk-..."
              class="form-input"
            />
            <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
          
          <div class="flex justify-end">
            <button
              @click="showSettings = false"
              class="btn btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { textProcessor } from './services/llm'
import { mdiArrowLeft } from '@mdi/js'
import DiffMatchPatch from 'diff-match-patch'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { getTheme, THEMES } from './services/theme'

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

const inputText = ref(localStorage.getItem(STORAGE_KEYS.INPUT) || '')
const processedText = ref(localStorage.getItem(STORAGE_KEYS.PROCESSED) || '')
const onlyGrammar = ref(localStorage.getItem(STORAGE_KEYS.ONLY_GRAMMAR) === 'true')
const handleSpanish = ref(localStorage.getItem(STORAGE_KEYS.HANDLE_SPANISH) !== 'false') // Default to true
const customInstructions = ref(localStorage.getItem(STORAGE_KEYS.CUSTOM_INSTRUCTIONS) || '')
const showInstructions = ref(localStorage.getItem(STORAGE_KEYS.SHOW_INSTRUCTIONS) === 'true')
const isProcessing = ref(false)
const error = ref(null)
const showDiff = ref(localStorage.getItem(STORAGE_KEYS.SHOW_DIFF) === 'true')
const writingStyle = ref(localStorage.getItem(STORAGE_KEYS.WRITING_STYLE) || 'preserve')

const inputCopied = ref(false)
const processedCopied = ref(false)
const changeApplied = ref(false)

const textareaRef = ref(null);

const showOnlyAdditions = ref(localStorage.getItem(STORAGE_KEYS.SHOW_ONLY_ADDITIONS) === 'true')

// Add loadingApiKey state
const loadingApiKey = ref(false)

// Add openAIKey state
const openAIKey = ref(localStorage.getItem(STORAGE_KEYS.API_KEY) || '')
const showSettings = ref(false)

// Compute the diff between original and processed text
const textDiff = computed(() => {
  if (!inputText.value || !processedText.value) return []
  
  const dmp = new DiffMatchPatch()
  const diff = dmp.diff_main(inputText.value, processedText.value)
  dmp.diff_cleanupSemantic(diff)
  return diff
})

// Store individual changes as patches for easier application
const diffPatches = computed(() => {
  if (!textDiff.value || textDiff.value.length === 0) return [];
  
  const dmp = new DiffMatchPatch();
  const patches = [];
  
  // For each addition or deletion, create an isolated patch
  for (let i = 0; i < textDiff.value.length; i++) {
    const part = textDiff.value[i];
    if (part[0] === 0) continue; // Skip unchanged parts
    
    if (part[0] === 1) { // Addition
      // Look for context before and after
      let contextBefore = '';
      let contextAfter = '';
      
      // Find the unchanged text before this addition (for context)
      if (i > 0 && textDiff.value[i-1][0] === 0) {
        const beforeText = textDiff.value[i-1][1];
        contextBefore = beforeText.substring(Math.max(0, beforeText.length - 40)); // Up to 40 chars of context
      }
      
      // Find the unchanged text after this addition (for context)
      if (i < textDiff.value.length - 1 && textDiff.value[i+1][0] === 0) {
        const afterText = textDiff.value[i+1][1];
        contextAfter = afterText.substring(0, Math.min(40, afterText.length)); // Up to 40 chars of context
      }
      
      // Create a targeted diff for just this addition
      const targetedDiff = [];
      if (contextBefore) targetedDiff.push([0, contextBefore]);
      targetedDiff.push([1, part[1]]); // The addition
      if (contextAfter) targetedDiff.push([0, contextAfter]);
      
      // Create a patch from this diff
      const patch = dmp.patch_make(targetedDiff);
      patches.push({ 
        index: i, 
        patch, 
        type: 'addition', 
        text: part[1],
        hasContext: !!(contextBefore || contextAfter)
      });
    } else if (part[0] === -1) { // Deletion
      // Look for context before and after
      let contextBefore = '';
      let contextAfter = '';
      
      // Find the unchanged text before this deletion (for context)
      if (i > 0 && textDiff.value[i-1][0] === 0) {
        const beforeText = textDiff.value[i-1][1];
        contextBefore = beforeText.substring(Math.max(0, beforeText.length - 40)); // Up to 40 chars of context
      }
      
      // Find the unchanged text after this deletion (for context)
      if (i < textDiff.value.length - 1 && textDiff.value[i+1][0] === 0) {
        const afterText = textDiff.value[i+1][1];
        contextAfter = afterText.substring(0, Math.min(40, afterText.length)); // Up to 40 chars of context
      }
      
      // Create a targeted diff for just this deletion
      const targetedDiff = [];
      if (contextBefore) targetedDiff.push([0, contextBefore]);
      targetedDiff.push([-1, part[1]]); // The deletion
      if (contextAfter) targetedDiff.push([0, contextAfter]);
      
      // Create a patch from this diff
      const patch = dmp.patch_make(targetedDiff);
      patches.push({ 
        index: i, 
        patch, 
        type: 'deletion', 
        text: part[1],
        hasContext: !!(contextBefore || contextAfter)
      });
    }
  }
  
  return patches;
});

// Watch for showDiff changes and save to localStorage
watch(showDiff, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.SHOW_DIFF, newValue)
})

// Watch for showInstructions changes and save to localStorage
watch(showInstructions, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.SHOW_INSTRUCTIONS, newValue)
})

// Watch for changes and save to localStorage
watch(inputText, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.INPUT, newValue)
})

watch(processedText, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.PROCESSED, newValue)
})

watch(onlyGrammar, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.ONLY_GRAMMAR, newValue)
})

watch(handleSpanish, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.HANDLE_SPANISH, newValue)
})

watch(customInstructions, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_INSTRUCTIONS, newValue)
})

watch(writingStyle, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.WRITING_STYLE, newValue)
})

// Watch for showOnlyAdditions changes and save to localStorage
watch(showOnlyAdditions, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.SHOW_ONLY_ADDITIONS, newValue);
})

// Add a watch for openAIKey
watch(openAIKey, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.API_KEY, newValue)
})

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
      handleSpanish: handleSpanish.value,
      customInstructions: customInstructions.value,
      writingStyle: writingStyle.value
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

const copyToClipboard = async (text, type) => {
  try {
    await navigator.clipboard.writeText(text)
    if (type === 'input') {
      inputCopied.value = true
      setTimeout(() => inputCopied.value = false, 2000)
    } else {
      processedCopied.value = true
      setTimeout(() => processedCopied.value = false, 2000)
    }
  } catch (err) {
    error.value = 'Failed to copy text to clipboard'
  }
}

const adjustTextareaHeight = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto'; // Reset the height
  textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to the scroll height
}

/**
 * Handle clicking on a change in the diff view
 * @param {Array} part - The diff part that was clicked [operation, text]
 * @param {number} index - The index of the part in the textDiff array
 */
const handleChangeClick = (part, index) => {
  // Only process if it's an addition
  if (part[0] !== 1) return;
  
  try {
    // Check if there's a deletion immediately before this addition
    // (this is likely a replacement where we want to replace the deleted text with the added text)
    const replaceMode = index > 0 && textDiff.value[index-1] && textDiff.value[index-1][0] === -1;
    if (replaceMode) {
      // This is a replacement scenario (deletion followed by addition)
      // We need to find the position of the deletion in the original text
      
      // Calculate position in the original text up to the deletion
      let position = 0;
      for (let i = 0; i < index - 1; i++) {
        const currentPart = textDiff.value[i];
        if (!currentPart) continue;
        
        if (currentPart[0] === 0) { // Only unchanged text contributes to position
          position += currentPart[1].length;
        }
      }
      
      // Get the deletion text from the previous part
      const deletionText = textDiff.value[index-1][1];
      
      // Replace the deletion with the addition
      const textBefore = inputText.value.substring(0, position);
      const textAfter = inputText.value.substring(position + deletionText.length);
      
      // Apply the replacement
      inputText.value = textBefore + part[1] + textAfter;
    } else {
      // Simple addition - find the position to insert
      let position = 0;
      for (let i = 0; i < index; i++) {
        const currentPart = textDiff.value[i];
        if (!currentPart) continue;
        
        if (currentPart[0] === 0) { // Only unchanged text contributes to position
          position += currentPart[1].length;
        }
      }
      
      // Insert the addition
      const textBefore = inputText.value.substring(0, position);
      const textAfter = inputText.value.substring(position);
      
      // Apply the addition
      inputText.value = textBefore + part[1] + textAfter;
    }
    
    // Show feedback
    changeApplied.value = true;
    setTimeout(() => {
      changeApplied.value = false;
    }, 2000);
    
    // Adjust textarea height
    nextTick(() => {
      if (textareaRef.value) {
        adjustTextareaHeight({ target: textareaRef.value });
      }
    });
  } catch (err) {
    error.value = "Failed to apply change. Please try again.";
  }
}

onMounted(() => {
  if (textareaRef.value) {
    adjustTextareaHeight({ target: textareaRef.value });
  }
  
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
