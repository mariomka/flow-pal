<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm px-8 py-4 border-b border-gray-200 flex-none">
      <h1 class="text-2xl font-bold mb-4 text-gray-800">Writer by Mario</h1>
      <div class="flex gap-4 items-center">
        <select 
          v-model="selectedTool" 
          class="px-4 py-2 rounded-md border border-gray-200 text-gray-800 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="fix">Fix Grammar & Spelling</option>
          <option value="translateFix">Translate & Fix (Spanish → English)</option>
          <option value="improve">Improve Writing</option>
          <option value="formal">Make Formal</option>
          <option value="casual">Make Casual</option>
          <option value="concise">Make Concise</option>
        </select>
        <button 
          @click="processText" 
          :disabled="isProcessing"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Process Text</span>
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
          <h2 class="text-xl font-semibold text-gray-800 mb-4 flex-none">Your Text</h2>
          <textarea
            v-model="inputText"
            placeholder="Start writing here..."
            class="flex-1 w-full p-4 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif text-lg leading-relaxed min-h-0"
          ></textarea>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-4 flex-none">
            <h2 class="text-xl font-semibold text-gray-800">Processed Text</h2>
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
              Replace Original
            </button>
          </div>
          <div 
            class="flex-1 w-full p-4 border border-gray-200 rounded-md overflow-y-auto whitespace-pre-wrap font-serif text-lg leading-relaxed min-h-0"
          >
            {{ processedText }}
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
import { ref, watch } from 'vue'
import { textProcessors } from './services/llm'
import { mdiArrowLeft } from '@mdi/js'

const STORAGE_KEYS = {
  INPUT: 'writer-input-text',
  PROCESSED: 'writer-processed-text',
  SELECTED_TOOL: 'writer-selected-tool'
}

const inputText = ref(localStorage.getItem(STORAGE_KEYS.INPUT) || '')
const processedText = ref(localStorage.getItem(STORAGE_KEYS.PROCESSED) || '')
const selectedTool = ref(localStorage.getItem(STORAGE_KEYS.SELECTED_TOOL) || 'fix')
const isProcessing = ref(false)
const error = ref(null)

// Watch for changes and save to localStorage
watch(inputText, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.INPUT, newValue)
})

watch(processedText, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.PROCESSED, newValue)
})

watch(selectedTool, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.SELECTED_TOOL, newValue)
})

const processText = async () => {
  if (!inputText.value.trim()) {
    error.value = 'Please enter some text to process.'
    return
  }

  isProcessing.value = true
  error.value = null

  try {
    const processor = textProcessors[selectedTool.value]
    if (!processor) {
      throw new Error('This processor is not implemented yet.')
    }

    const result = await processor.processor(inputText.value)
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
</script>
