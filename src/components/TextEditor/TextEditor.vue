<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col flex-1">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Your Text</h2>
      <button
        v-if="text"
        @click="copyToClipboard"
        class="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-1 sm:gap-2"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <textarea
      ref="textareaRef"
      v-model="textValue"
      placeholder="Start writing here..."
      class="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif text-base sm:text-lg leading-relaxed overflow-hidden resize-none min-h-[150px] flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      @input="onInput"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:text'])

const textValue = ref(props.text)
const copied = ref(false)
const textareaRef = ref(null)

// Sync props with internal refs
watch(() => props.text, (newValue) => {
  textValue.value = newValue
  nextTick(() => {
    if (textareaRef.value) {
      adjustTextareaHeight({ target: textareaRef.value })
    }
  })
})

function onInput(event) {
  textValue.value = event.target.value
  emit('update:text', textValue.value)
  adjustTextareaHeight(event)
}

function adjustTextareaHeight(event) {
  const textarea = event.target
  textarea.style.height = 'auto' // Reset the height
  textarea.style.height = textarea.scrollHeight + 'px' // Set the height to the scroll height
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(textValue.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text to clipboard')
  }
}

onMounted(() => {
  if (textareaRef.value) {
    adjustTextareaHeight({ target: textareaRef.value })
  }
})
</script> 