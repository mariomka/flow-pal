<template>
  <div 
    v-if="show"
    class="settings-modal"
  >
    <div class="settings-content">
      <div class="settings-header">
        <h2 class="text-lg sm:text-xl font-semibold dark:text-white">Settings</h2>
        <button 
          @click="onClose"
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
            v-model="apiKey"
            placeholder="sk-..."
            class="form-input"
          />
          <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </div>
        
        <div class="flex justify-end">
          <button
            @click="onSave"
            class="btn btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  initialApiKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:apiKey', 'close'])

const apiKey = ref(props.initialApiKey)

watch(() => props.initialApiKey, (newValue) => {
  apiKey.value = newValue
})

function onClose() {
  emit('close')
}

function onSave() {
  emit('update:apiKey', apiKey.value)
  emit('close')
}
</script> 