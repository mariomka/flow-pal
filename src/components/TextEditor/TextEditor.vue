<template>
  <div class="text-editor relative w-full h-full flex flex-col flex-1">
    <textarea
      ref="textareaElement"
      v-model="textareaValue"
      @input="handleInput"
      @mouseup="handleMouseSelection"
      placeholder="Start writing..."
      :class="[
        'w-full h-full resize-none bg-transparent px-4 py-4 text-gray-800 focus:outline-none dark:text-gray-200 mx-auto',
        { 'select-none pointer-events-none': floatingMenuVisible && showProcessedResult },
        { 'font-serif': fontFamily === 'serif' },
        { 'font-sans': fontFamily === 'sans' },
        { 'font-mono': fontFamily === 'mono' },
        { 'text-sm': fontSize === 'small' },
        { 'text-lg': fontSize === 'medium' },
        { 'text-xl': fontSize === 'large' },
        { 'leading-tight': lineHeight === 'dense' },
        { 'leading-normal': lineHeight === 'normal' },
        { 'leading-relaxed': lineHeight === 'relaxed' }
      ]"
      :style="{
        paddingLeft: `max(1rem, calc(50% - ${maxWidth / 2}px))`,
        paddingRight: `max(1rem, calc(50% - ${maxWidth / 2}px))`
      }"
      rows="1"
    ></textarea>

    <!-- Floating Menu -->
    <div
      v-if="floatingMenuVisible"
      class="floating-menu fixed z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      :style="{
        top: floatingMenuPosition.top + 20 + 'px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: showProcessedResult ? `${Math.min(600, maxWidth - 40)}px` : '300px',
        width: showProcessedResult ? `calc(100% - 40px)` : 'auto'
      }"
      @mouseenter="menuActive = true"
      @mouseleave="menuActive = false"
    >
      <!-- Triangle pointer with border -->
      <div class="absolute -top-[9px] left-1/2 -translate-x-1/2">
        <!-- Border triangle (slightly larger, positioned behind) -->
        <div class="absolute top-0 left-0 h-0 w-0 border-x-[9px] border-b-[9px] border-x-transparent border-b-gray-200 dark:border-b-gray-700"></div>
        <!-- Inner triangle (slightly smaller, positioned in front) -->
        <div class="absolute top-[1px] left-[1px] h-0 w-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-white dark:border-b-gray-800"></div>
      </div>
      
      <div v-if="!showProcessedResult" class="flex flex-col gap-2">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ selectedText.length }} characters selected
        </div>
        
        <div class="flex gap-2">
          <button
            @click="processSelectedText"
            :disabled="isProcessing"
            class="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <span v-if="isProcessing">Processing...</span>
            <span v-else>Fix Grammar</span>
          </button>
          
          <button
            @click="processSelectedText"
            :disabled="isProcessing"
            class="rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <span v-if="isProcessing">Processing...</span>
            <span v-else>Improve Writing</span>
          </button>
        </div>
      </div>
      
      <div v-else class="flex flex-col gap-2">
        <div v-if="processingError" class="w-full">
          <div class="mb-2 text-xs text-red-500 dark:text-red-400">Error:</div>
          <div class="mb-3 text-sm text-red-600 dark:text-red-300">
            {{ processingError }}
          </div>
          <div class="mt-3 flex justify-end gap-2">
            <button
              @click="resetProcessing"
              class="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Dismiss
            </button>
            
            <button
              @click="processSelectedText"
              class="rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        
        <div v-else class="w-full">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-xs text-gray-500 dark:text-gray-400">Result:</div>
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="showDiffView"
                class="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span class="ml-1.5 text-xs text-gray-600 dark:text-gray-400">Show diff</span>
            </label>
          </div>
          <div class="max-h-48 overflow-y-auto rounded border border-gray-100 p-2 text-sm dark:border-gray-700">
            <template v-if="showDiffView">
              <div v-html="diffHtml" class="whitespace-pre-wrap"></div>
            </template>
            <template v-else>
              <div class="whitespace-pre-wrap">{{ processedTextResult }}</div>
            </template>
          </div>
          
          <div class="mt-3 flex justify-end gap-2">
            <button
              @click="resetProcessing"
              class="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Dismiss
            </button>
            
            <button
              @click="applyProcessedText"
              class="rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { debounce } from 'lodash-es'
import { textProcessor } from '../../services/llm'

// Maximum width for the text content (in pixels)
const maxWidth = 768

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  writingStyle: {
    type: String,
    default: 'preserve'
  },
  englishRegion: {
    type: String,
    default: 'default'
  },
  customInstructions: {
    type: String,
    default: ''
  },
  fontFamily: {
    type: String,
    default: 'serif'
  },
  fontSize: {
    type: String,
    default: 'medium'
  },
  lineHeight: {
    type: String,
    default: 'normal'
  }
})

const emit = defineEmits(['update:text', 'error'])

const textareaValue = ref(props.text)
const textareaElement = ref(null)
const isTextSelected = ref(false)
const selectedText = ref('')
const floatingMenuVisible = ref(false)
const floatingMenuPosition = ref({ top: 0, left: 0 })
const isProcessing = ref(false)
const processedTextResult = ref('')
const showProcessedResult = ref(false)
const processingError = ref('')
const selectionRange = ref(null)
const selectionChangeHandler = ref(null)
const menuActive = ref(false)  // Track if the menu is intentionally active
const showDiffView = ref(false) // Toggle for diff view

// Watch for prop changes
watch(() => props.text, (newValue) => {
  textareaValue.value = newValue
})

// Emit changes back to parent
const handleInput = (event) => {
  emit('update:text', event.target.value)
}

// Handle text selection
const handleSelection = () => {
  // If the floating menu is already open with results, ignore new selections
  if (floatingMenuVisible.value && showProcessedResult.value) {
    // If we have a stored selection, try to restore it to prevent unwanted changes
    if (selectionRange.value && textareaElement.value) {
      try {
        textareaElement.value.setSelectionRange(selectionRange.value.start, selectionRange.value.end)
      } catch (e) {
        // Ignore errors - this is just a best effort attempt
      }
    }
    return
  }
  
  // Only process selections if they're in the textarea
  if (!textareaElement.value || document.activeElement !== textareaElement.value) {
    return
  }
  
  const selection = window.getSelection()
  
  if (selection && selection.toString().trim() && selection.rangeCount) {
    // Get the selected text
    selectedText.value = selection.toString().trim()
    
    // Store selection range for later use
    if (textareaElement.value) {
      selectionRange.value = {
        start: textareaElement.value.selectionStart,
        end: textareaElement.value.selectionEnd
      }
    }
  } else {
    // Only hide if we're not showing processed results and not clicking in the menu
    if (!showProcessedResult.value && 
        !document.activeElement?.closest('.floating-menu')) {
      floatingMenuVisible.value = false
    }
  }
}

// Handle mouse selection - this is our primary method for showing the menu now
const handleMouseSelection = (event) => {
  // If the floating menu is already open with results, don't allow new selections
  if (floatingMenuVisible.value && showProcessedResult.value) {
    return
  }
  
  // Use setTimeout to allow the selection to be properly set
  setTimeout(() => {
    // Check if there's a selection in the textarea
    if (textareaElement.value) {
      const start = textareaElement.value.selectionStart
      const end = textareaElement.value.selectionEnd
      
      if (start !== end) {
        // Get the selected text directly from the textarea
        const selectedStr = textareaElement.value.value.substring(start, end).trim()
        
        if (selectedStr && selectedStr.length > 0) {
          // Store text and selection range
          selectedText.value = selectedStr
          selectionRange.value = { start, end }
          
          // Position menu at mouse position
          floatingMenuPosition.value = {
            top: event.clientY + window.scrollY,
            left: event.clientX + window.scrollX
          }
          
          // Show the menu
          floatingMenuVisible.value = true
        }
      } else if (!showProcessedResult.value && !menuActive.value) {
        // No selection, close the menu if it's open and not showing results
        // BUT, don't close if we're showing results or menu is active
        resetProcessing()
      }
    }
  }, 10) // Short timeout to ensure selection is set
}

// Process selected text
const processSelectedText = async () => {
  if (!selectedText.value) return
  
  isProcessing.value = true
  showProcessedResult.value = false
  processingError.value = '' // Clear previous errors
  
  try {
    processedTextResult.value = await textProcessor.processor(
      selectedText.value,
      {
        writingStyle: props.writingStyle,
        englishRegion: props.englishRegion,
        customInstructions: props.customInstructions
      }
    )
    showProcessedResult.value = true
  } catch (err) {
    // Format the error message to be more user-friendly
    let errorMessage = err.message || 'An unknown error occurred'
    
    // Handle common error cases
    if (errorMessage.includes('API key')) {
      errorMessage = 'API key is missing or invalid. Please check your settings.'
    } else if (errorMessage.includes('429')) {
      errorMessage = 'Too many requests. Please try again later.'
    } else if (errorMessage.includes('Network')) {
      errorMessage = 'Network error. Please check your internet connection.'
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.'
    }
    
    processingError.value = errorMessage
    showProcessedResult.value = true // Ensure error is displayed
    
    // Also emit the error to the parent component
    emit('error', errorMessage)
  } finally {
    isProcessing.value = false
  }
}

// Apply the processed text
const applyProcessedText = () => {
  if (!textareaElement.value || !processedTextResult.value) return
  
  const fullText = textareaElement.value.value
  
  // Use stored selection range if current selection doesn't exist
  let selectionStart = textareaElement.value.selectionStart
  let selectionEnd = textareaElement.value.selectionEnd
  
  // If no active selection, use the stored range
  if (selectionStart === selectionEnd && selectionRange.value) {
    selectionStart = selectionRange.value.start
    selectionEnd = selectionRange.value.end
  }
  
  // Replace the selected text with the processed result
  const newText = fullText.substring(0, selectionStart) + 
                  processedTextResult.value + 
                  fullText.substring(selectionEnd)
  
  textareaValue.value = newText
  emit('update:text', newText)
  
  // Reset
  resetProcessing()
}

// Dismiss the floating menu
const resetProcessing = () => {
  menuActive.value = false // Reset menu active state
  floatingMenuVisible.value = false
  showProcessedResult.value = false
  processedTextResult.value = ''
  selectedText.value = ''
  isTextSelected.value = false
  selectionRange.value = null
  showDiffView.value = false // Reset diff view too
}

// Click outside handler
const handleClickOutside = (event) => {
  // Don't close if we're clicking in the textarea, menu, or if showing results
  if (!event.target.closest('.floating-menu') && !event.target.closest('textarea')) {
    // If menu is visible and not showing results or active
    if (floatingMenuVisible.value && !showProcessedResult.value && !menuActive.value) {
      resetProcessing()
    }
  }
}

// Create a computed property for diff HTML
const diffHtml = computed(() => {
  if (!selectedText.value || !processedTextResult.value) return ''
  
  // Better diff algorithm using word boundaries
  // This will handle punctuation, spaces, and newlines more effectively
  // First, preserve newlines by replacing them with a special token
  const nlToken = '___NEWLINE___'
  const origWithTokens = selectedText.value.replace(/\n/g, nlToken)
  const newWithTokens = processedTextResult.value.replace(/\n/g, nlToken)
  
  // Split into tokens, handling punctuation, spaces, and our newline token
  const tokenPattern = new RegExp(`(\\s+|[.,!?;:'"()\\[\\]{}]|${nlToken})`, 'g')
  const originalTokens = origWithTokens.split(tokenPattern).filter(t => t !== '')
  const newTokens = newWithTokens.split(tokenPattern).filter(t => t !== '')
  
  let result = ''
  let i = 0, j = 0
  
  // More robust diff algorithm
  while (i < originalTokens.length || j < newTokens.length) {
    // If both tokens match exactly
    if (i < originalTokens.length && j < newTokens.length && originalTokens[i] === newTokens[j]) {
      // Same token in both texts - handle newline token specially
      const token = originalTokens[i]
      if (token === nlToken) {
        result += '\n'
      } else {
        result += escapeHtml(token)
      }
      i++
      j++
    } else {
      // Look ahead a bit to handle transpositions and small edits
      const lookAheadLimit = 3 // How many tokens to look ahead
      let foundMatch = false
      
      // Check if current new token appears in next few original tokens
      for (let lookAhead = 1; !foundMatch && lookAhead <= lookAheadLimit && i + lookAhead < originalTokens.length; lookAhead++) {
        if (originalTokens[i + lookAhead] === newTokens[j]) {
          // Found a match ahead - mark intermediate tokens as deletions
          for (let k = 0; k < lookAhead; k++) {
            const token = originalTokens[i + k]
            if (token === nlToken) {
              result += `<span class="bg-red-100 dark:bg-red-900 dark:text-red-300 line-through">↵</span>\n`
            } else {
              result += `<span class="bg-red-100 dark:bg-red-900 dark:text-red-300 line-through">${escapeHtml(token)}</span>`
            }
          }
          i += lookAhead
          foundMatch = true
        }
      }
      
      // Check if current original token appears in next few new tokens
      if (!foundMatch) {
        for (let lookAhead = 1; !foundMatch && lookAhead <= lookAheadLimit && j + lookAhead < newTokens.length; lookAhead++) {
          if (newTokens[j + lookAhead] === originalTokens[i]) {
            // Found a match ahead - mark intermediate tokens as additions
            for (let k = 0; k < lookAhead; k++) {
              const token = newTokens[j + k]
              if (token === nlToken) {
                result += `<span class="bg-green-100 dark:bg-green-900 dark:text-green-300">↵</span>\n`
              } else {
                result += `<span class="bg-green-100 dark:bg-green-900 dark:text-green-300">${escapeHtml(token)}</span>`
              }
            }
            j += lookAhead
            foundMatch = true
          }
        }
      }
      
      // If no match found within lookahead window, just treat as replacement
      if (!foundMatch) {
        if (i < originalTokens.length && j < newTokens.length) {
          // Both have tokens - consider it a replacement
          const origToken = originalTokens[i]
          const newToken = newTokens[j]
          
          if (origToken === nlToken) {
            result += `<span class="bg-red-100 dark:bg-red-900 dark:text-red-300 line-through">↵</span>\n`
          } else {
            result += `<span class="bg-red-100 dark:bg-red-900 dark:text-red-300 line-through">${escapeHtml(origToken)}</span>`
          }
          
          if (newToken === nlToken) {
            result += `<span class="bg-green-100 dark:bg-green-900 dark:text-green-300">↵</span>\n`
          } else {
            result += `<span class="bg-green-100 dark:bg-green-900 dark:text-green-300">${escapeHtml(newToken)}</span>`
          }
          
          i++
          j++
        } else if (i < originalTokens.length) {
          // Only original has tokens left - deletion
          const token = originalTokens[i]
          if (token === nlToken) {
            result += `<span class="bg-red-100 dark:bg-red-900 dark:text-red-300 line-through">↵</span>\n`
          } else {
            result += `<span class="bg-red-100 dark:bg-red-900 dark:text-red-300 line-through">${escapeHtml(token)}</span>`
          }
          i++
        } else if (j < newTokens.length) {
          // Only new has tokens left - addition
          const token = newTokens[j]
          if (token === nlToken) {
            result += `<span class="bg-green-100 dark:bg-green-900 dark:text-green-300">↵</span>\n`
          } else {
            result += `<span class="bg-green-100 dark:bg-green-900 dark:text-green-300">${escapeHtml(token)}</span>`
          }
          j++
        }
      }
    }
  }
  
  return result
})

// Helper to escape HTML
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Setup the text editor and event listeners
onMounted(() => {
  if (textareaElement.value) {
    // Create debounced handler for selection changes
    selectionChangeHandler.value = debounce(handleSelection, 200)
    
    // Listen for selection changes in the document
    document.addEventListener('selectionchange', selectionChangeHandler.value)
    
    // Listen for clicks outside to close the floating menu
    document.addEventListener('click', handleClickOutside)
  }
})

// Clean up event listeners on unmount
onUnmounted(() => {
  if (selectionChangeHandler.value) {
    // Cancel any pending debounced calls
    if (typeof selectionChangeHandler.value.cancel === 'function') {
      selectionChangeHandler.value.cancel()
    }
    
    // Remove the event listener
    document.removeEventListener('selectionchange', selectionChangeHandler.value)
  }
  
  document.removeEventListener('click', handleClickOutside)
})
</script> 