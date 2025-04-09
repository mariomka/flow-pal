<template>
  <div>
    <div class="mb-4">
      <button
        @click="toggleInstructions"
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
          v-model="instructionsValue"
          placeholder="Add your custom instructions for the AI here..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          rows="2"
          @input="updateInstructions"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  instructions: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:instructions', 'update:visible'])

const customInstructions = ref(props.instructions)
const showInstructions = ref(props.visible)
const instructionsValue = ref(props.instructions)

// Sync props with internal refs
watch(() => props.instructions, (newValue) => {
  customInstructions.value = newValue
  instructionsValue.value = newValue
})

watch(() => props.visible, (newValue) => {
  showInstructions.value = newValue
})

function toggleInstructions() {
  showInstructions.value = !showInstructions.value
  emit('update:visible', showInstructions.value)
}

function updateInstructions(event) {
  const value = event.target.value
  customInstructions.value = value
  emit('update:instructions', value)
}
</script> 