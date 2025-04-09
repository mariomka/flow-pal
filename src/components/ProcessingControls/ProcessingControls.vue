<template>
  <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <input 
          type="checkbox" 
          v-model="onlyGrammarValue"
          @change="updateOnlyGrammar"
          class="rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
        >
        Only Fix Grammar
      </label>
      <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <input 
          type="checkbox" 
          v-model="handleSpanishValue"
          @change="updateHandleSpanish"
          class="rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
        >
        Handle Spanish Text
      </label>
      <div class="flex items-center gap-2">
        <label for="writing-style" class="text-sm text-gray-600 dark:text-gray-300">Style:</label>
        <select
          id="writing-style"
          v-model="writingStyleValue"
          @change="updateWritingStyle"
          class="rounded-md border-gray-300 px-2 py-1 text-xs sm:text-sm min-w-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option 
            v-for="style in writingStyles" 
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
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  onlyGrammar: {
    type: Boolean,
    default: false
  },
  handleSpanish: {
    type: Boolean,
    default: true
  },
  writingStyle: {
    type: String,
    default: 'preserve'
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  writingStyles: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'update:onlyGrammar', 
  'update:handleSpanish', 
  'update:writingStyle',
  'process',
  'clear'
])

const onlyGrammarValue = ref(props.onlyGrammar)
const handleSpanishValue = ref(props.handleSpanish)
const writingStyleValue = ref(props.writingStyle)

// Sync props with internal refs
watch(() => props.onlyGrammar, (newValue) => {
  onlyGrammarValue.value = newValue
})

watch(() => props.handleSpanish, (newValue) => {
  handleSpanishValue.value = newValue
})

watch(() => props.writingStyle, (newValue) => {
  writingStyleValue.value = newValue
})

function updateOnlyGrammar() {
  emit('update:onlyGrammar', onlyGrammarValue.value)
}

function updateHandleSpanish() {
  emit('update:handleSpanish', handleSpanishValue.value)
}

function updateWritingStyle() {
  emit('update:writingStyle', writingStyleValue.value)
}

function processText() {
  emit('process')
}

function clearText() {
  emit('clear')
}
</script> 