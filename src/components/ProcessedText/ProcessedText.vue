<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col min-h-0">
    <div class="flex flex-wrap justify-between items-center mb-4 flex-none">
      <div class="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Processed Text</h2>
        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input 
            type="checkbox" 
            v-model="showDiffValue"
            @change="updateShowDiff"
            class="rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
          >
          Show Changes
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input 
            type="checkbox" 
            v-model="showOnlyAdditionsValue"
            @change="updateShowOnlyAdditions"
            class="rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
          >
          Show Only Additions
        </label>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="processedText"
          @click="copyToClipboard"
          class="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
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
      <template v-if="showDiffValue && processedText">
        <template v-for="(part, index) in textDiff" :key="index">
          <span
            v-if="part[0] === 0 || (showOnlyAdditionsValue && part[0] === 1) || (!showOnlyAdditionsValue && part[0] !== 0)"
            :class="{
              'bg-red-100 dark:bg-red-900/50 line-through': part[0] === -1 && !showOnlyAdditionsValue,
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
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { mdiArrowLeft } from '@mdi/js'
import DiffMatchPatch from 'diff-match-patch'

const props = defineProps({
  originalText: {
    type: String,
    default: ''
  },
  processedText: {
    type: String,
    default: ''
  },
  showDiff: {
    type: Boolean,
    default: false
  },
  showOnlyAdditions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:showDiff',
  'update:showOnlyAdditions',
  'apply',
  'apply-change',
  'change-applied'
])

const showDiffValue = ref(props.showDiff)
const showOnlyAdditionsValue = ref(props.showOnlyAdditions)
const copied = ref(false)

// Sync props with internal refs
watch(() => props.showDiff, (newValue) => {
  showDiffValue.value = newValue
})

watch(() => props.showOnlyAdditions, (newValue) => {
  showOnlyAdditionsValue.value = newValue
})

// Compute the diff between original and processed text
const textDiff = computed(() => {
  if (!props.originalText || !props.processedText) return []
  
  const dmp = new DiffMatchPatch()
  const diff = dmp.diff_main(props.originalText, props.processedText)
  dmp.diff_cleanupSemantic(diff)
  return diff
})

function updateShowDiff() {
  emit('update:showDiff', showDiffValue.value)
}

function updateShowOnlyAdditions() {
  emit('update:showOnlyAdditions', showOnlyAdditionsValue.value)
}

function replaceWithProcessed() {
  emit('apply')
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.processedText)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text to clipboard')
  }
}

function handleChangeClick(part, index) {
  // Only process if it's an addition
  if (part[0] !== 1) return;
  
  emit('apply-change', { part, index, textDiff: textDiff.value })
  emit('change-applied')
}
</script> 