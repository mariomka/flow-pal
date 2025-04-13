<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/50 transition-opacity backdrop-overlay"
        @click="closeModal"
      ></div>

      <!-- Modal -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 relative z-10 transition-all">
        <!-- Header -->
        <div class="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-base font-medium text-gray-900 dark:text-white">Settings</h2>
          <button 
            @click="closeModal" 
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-3">
          <!-- API Key -->
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">OpenAI API Key</h3>
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Enter your OpenAI API key to use the text processing features.
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Get an API key here
              </a>. 
              Your key is stored securely in your browser and is never shared with anyone.
            </p>
            <div class="relative">
              <input 
                :type="showApiKey ? 'text' : 'password'" 
                v-model="apiKeyValue"
                placeholder="sk-..." 
                class="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button 
                @click="showApiKey = !showApiKey" 
                type="button"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="showApiKey" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Custom Instructions -->
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">Custom Instructions</h3>
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Add specific instructions for improving your text.
            </p>
            <textarea
              v-model="customInstructionsValue"
              placeholder="E.g., Make my text more concise, avoid passive voice, etc."
              class="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-vertical min-h-[60px]"
            ></textarea>
          </div>

          <!-- Style Settings -->
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Writing Style Settings</h3>
            
            <div class="mb-3">
              <label class="text-xs font-medium text-gray-900 dark:text-white block mb-1" for="modal-writing-style">
                Default Writing Style
              </label>
              <select
                id="modal-writing-style"
                v-model="writingStyleValue"
                class="w-full rounded-md border border-gray-300 px-2 py-1.5 pr-8 text-xs bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                <option 
                  v-for="style in writingStyles" 
                  :key="style.id" 
                  :value="style.id"
                >
                  {{ style.label }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ getStyleDescription() }}
              </p>
            </div>

            <div class="mb-3">
              <label class="text-xs font-medium text-gray-900 dark:text-white block mb-1" for="modal-english-region">
                English Region
              </label>
              <select
                id="modal-english-region"
                v-model="englishRegionValue"
                class="w-full rounded-md border border-gray-300 px-2 py-1.5 pr-8 text-xs bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                <option 
                  v-for="region in englishRegions" 
                  :key="region.id" 
                  :value="region.id"
                >
                  {{ region.label }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ getRegionDescription() }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="flex justify-end p-3 border-t border-gray-200 dark:border-gray-700 gap-2">
          <button 
            @click="closeModal" 
            class="px-3 py-1.5 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="saveSettings" 
            class="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  initialApiKey: {
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
  writingStyles: {
    type: Array,
    default: () => [
      { id: 'preserve', label: 'Preserve Original Style', description: 'Maintain the original writing style while fixing errors' },
      { id: 'business', label: 'Business', description: 'Professional and clear tone for business communication' },
      { id: 'technical', label: 'Technical', description: 'Precise and detailed tone for technical documentation' },
      { id: 'casual', label: 'Casual', description: 'Friendly and conversational tone' },
      { id: 'marketing', label: 'Marketing', description: 'Engaging and persuasive tone for promotional content' },
      { id: 'simple', label: 'Simple', description: 'Clear and easy-to-understand language for general audiences' }
    ]
  },
  englishRegions: {
    type: Array,
    default: () => [
      { id: 'default', label: 'Default', description: 'Default English without specific regional preferences' },
      { id: 'us', label: 'US English', description: 'American English spelling and expressions' },
      { id: 'uk', label: 'UK English', description: 'British English spelling and expressions' },
      { id: 'au', label: 'Australian English', description: 'Australian English spelling and expressions' },
      { id: 'ca', label: 'Canadian English', description: 'Canadian English spelling and expressions' }
    ]
  }
})

const emit = defineEmits([
  'update:api-key',
  'update:writing-style',
  'update:english-region',
  'update:custom-instructions',
  'close'
])

const showApiKey = ref(false)
const apiKeyValue = ref(props.initialApiKey)
const writingStyleValue = ref(props.writingStyle)
const englishRegionValue = ref(props.englishRegion)
const customInstructionsValue = ref(props.customInstructions)

watch(() => props.initialApiKey, (newValue) => {
  apiKeyValue.value = newValue
})

watch(() => props.writingStyle, (newValue) => {
  writingStyleValue.value = newValue
})

watch(() => props.englishRegion, (newValue) => {
  englishRegionValue.value = newValue
})

watch(() => props.customInstructions, (newValue) => {
  customInstructionsValue.value = newValue
})

function closeModal() {
  emit('close')
}

function saveSettings() {
  emit('update:api-key', apiKeyValue.value)
  emit('update:writing-style', writingStyleValue.value)
  emit('update:english-region', englishRegionValue.value)
  emit('update:custom-instructions', customInstructionsValue.value)
  closeModal()
}

function getStyleDescription() {
  const style = props.writingStyles.find(s => s.id === writingStyleValue.value)
  return style ? style.description : ''
}

function getRegionDescription() {
  const region = props.englishRegions.find(r => r.id === englishRegionValue.value)
  return region ? region.description : ''
}

onMounted(() => {
  // Trap focus within the modal when it's open
  if (props.show) {
    document.body.style.overflow = 'hidden'
  }
})

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script> 