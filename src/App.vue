<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm px-8 py-4 border-b border-gray-200 flex-none">
      <h1 class="text-2xl font-bold mb-4 text-gray-800">Writer by Mario</h1>
      <div class="flex items-center gap-2 mb-2">
        <button
          @click="showInstructions = !showInstructions"
          class="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <svg 
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-90': showInstructions }"
            viewBox="0 0 24 24"
          >
            <path 
              d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
              fill="currentColor"
            />
          </svg>
          Custom Instructions
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
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="flex gap-4 items-center">
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-gray-600">
            <input 
              type="checkbox" 
              v-model="onlyGrammar"
              class="rounded text-blue-600 focus:ring-blue-500"
            >
            Only Fix Grammar
          </label>
          <label class="flex items-center gap-2 text-gray-600">
            <input 
              type="checkbox" 
              v-model="handleSpanish"
              class="rounded text-blue-600 focus:ring-blue-500"
            >
            Handle Spanish Text
          </label>
        </div>
        <button 
          @click="processText" 
          :disabled="isProcessing"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Improve Writing</span>
        </button>
        <button 
          @click="clearText" 
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm"
        >
          Clear All
        </button>
      </div>
    </header>
    
    <main class="flex-1 p-8 flex flex-col min-h-0">
      <div class="grid grid-cols-2 gap-8 flex-1 min-h-0">
        <div class="bg-white rounded-lg shadow-sm p-6 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-4 flex-none">
            <h2 class="text-xl font-semibold text-gray-800">Your Text</h2>
            <button
              v-if="inputText"
              @click="copyToClipboard(inputText, 'input')"
              class="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm flex items-center gap-2"
            >
              {{ inputCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <textarea
            v-model="inputText"
            placeholder="Start writing here..."
            class="flex-1 w-full p-4 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif text-lg leading-relaxed min-h-0"
          ></textarea>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-4 flex-none">
            <div class="flex items-center gap-4">
              <h2 class="text-xl font-semibold text-gray-800">Processed Text</h2>
              <label class="flex items-center gap-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  v-model="showDiff"
                  class="rounded text-blue-600 focus:ring-blue-500"
                >
                Show Changes
              </label>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="processedText"
                @click="copyToClipboard(processedText, 'processed')"
                class="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm"
              >
                {{ processedCopied ? 'Copied!' : 'Copy' }}
              </button>
              <button
                v-if="processedText"
                @click="replaceWithProcessed"
                class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm flex items-center gap-2"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
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
            class="flex-1 w-full p-4 border border-gray-200 rounded-md overflow-y-auto whitespace-pre-wrap font-serif text-lg leading-relaxed min-h-0"
          >
            <template v-if="showDiff && processedText">
              <template v-for="(part, index) in textDiff" :key="index">
                <span
                  :class="{
                    'bg-red-100 line-through': part[0] === -1,
                    'bg-green-100': part[0] === 1,
                  }"
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
      class="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-md"
      role="alert"
    >
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold">Error</p>
          <p>{{ error }}</p>
        </div>
        <button 
          @click="error = null"
          class="ml-4 text-red-700 hover:text-red-900"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Processing indicator -->
    <div 
      v-if="isProcessing" 
      class="fixed bottom-4 left-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg"
    >
      Processing your text...
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { textProcessor } from './services/llm'
import { mdiArrowLeft } from '@mdi/js'
import DiffMatchPatch from 'diff-match-patch'

const STORAGE_KEYS = {
  INPUT: 'writer-input-text',
  PROCESSED: 'writer-processed-text',
  ONLY_GRAMMAR: 'writer-only-grammar',
  HANDLE_SPANISH: 'writer-handle-spanish',
  SHOW_DIFF: 'writer-show-diff',
  CUSTOM_INSTRUCTIONS: 'writer-custom-instructions',
  SHOW_INSTRUCTIONS: 'writer-show-instructions'
}

const inputText = ref(localStorage.getItem(STORAGE_KEYS.INPUT) || '')
const processedText = ref(localStorage.getItem(STORAGE_KEYS.PROCESSED) || '')
const onlyGrammar = ref(localStorage.getItem(STORAGE_KEYS.ONLY_GRAMMAR) === 'true')
const handleSpanish = ref(localStorage.getItem(STORAGE_KEYS.HANDLE_SPANISH) !== 'false') // Default to true
const customInstructions = ref(localStorage.getItem(STORAGE_KEYS.CUSTOM_INSTRUCTIONS) || '')
const showInstructions = ref(localStorage.getItem(STORAGE_KEYS.SHOW_INSTRUCTIONS) === 'true')
const isProcessing = ref(false)
const error = ref(null)
const showDiff = ref(localStorage.getItem(STORAGE_KEYS.SHOW_DIFF) === 'true')

const inputCopied = ref(false)
const processedCopied = ref(false)

// Compute the diff between original and processed text
const textDiff = computed(() => {
  if (!inputText.value || !processedText.value) return []
  
  const dmp = new DiffMatchPatch()
  const diff = dmp.diff_main(inputText.value, processedText.value)
  dmp.diff_cleanupSemantic(diff)
  return diff
})

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

const processText = async () => {
  if (!inputText.value.trim()) {
    error.value = 'Please enter some text to process.'
    return
  }

  isProcessing.value = true
  error.value = null

  try {
    const result = await textProcessor.processor(inputText.value, {
      onlyGrammar: onlyGrammar.value,
      handleSpanish: handleSpanish.value,
      customInstructions: customInstructions.value
    })

    if (!result) {
      throw new Error('No result received from the processor.')
    }

    processedText.value = result
  } catch (err) {
    console.error('Processing error:', err)
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
    console.error('Failed to copy text:', err)
    error.value = 'Failed to copy text to clipboard'
  }
}
</script>
