import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'

// Mock all components
vi.mock('./components/Header/Header.vue', () => ({
  default: {
    name: 'Header',
    template: '<div data-testid="header"><slot /></div>',
    props: ['writingStyle', 'writingStyles'],
    emits: ['toggle-settings', 'update:writing-style']
  }
}))

vi.mock('./components/TextEditor/TextEditor.vue', () => ({
  default: {
    name: 'TextEditor',
    template: '<div data-testid="text-editor"><slot /></div>',
    props: ['text', 'writingStyle', 'englishRegion']
  }
}))

vi.mock('./components/SettingsModal/SettingsModal.vue', () => ({
  default: {
    name: 'SettingsModal',
    template: '<div data-testid="settings-modal"><slot /></div>',
    props: ['show', 'initialApiKey', 'writingStyle', 'englishRegion', 'customInstructions', 'writingStyles', 'englishRegions'],
    emits: ['update:apiKey', 'update:writingStyle', 'update:englishRegion', 'update:customInstructions', 'close']
  }
}))

// Mock textProcessor service
vi.mock('./services/llm', () => ({
  textProcessor: {
    processor: vi.fn(async (text, options) => {
      // Simple mock - returns a modified version of the input text
      return `Processed: ${text}`
    })
  }
}))

describe('App Component', () => {
  let wrapper
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(key => ''),
      setItem: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
    
    wrapper = mount(App, {
      global: {
        stubs: {
          Header: true,
          TextEditor: true,
          SettingsModal: true
        }
      }
    })
  })
  
  it('renders all required components', () => {
    expect(wrapper.findComponent({ name: 'Header' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TextEditor' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SettingsModal' }).exists()).toBe(true)
  })
  
  it('passes writing style and region to TextEditor', async () => {
    wrapper.vm.writingStyle = 'business'
    wrapper.vm.englishRegion = 'uk'
    await flushPromises()
    
    const textEditor = wrapper.findComponent({ name: 'TextEditor' })
    expect(textEditor.props('writingStyle')).toBe('business')
    expect(textEditor.props('englishRegion')).toBe('uk')
  })
  
  it('passes styles and regions to settings modal', async () => {
    wrapper.vm.showSettings = true
    await flushPromises()
    
    const settingsModal = wrapper.findComponent({ name: 'SettingsModal' })
    expect(settingsModal.props('writingStyles')).toEqual(wrapper.vm.WRITING_STYLES)
    expect(settingsModal.props('englishRegions')).toEqual(wrapper.vm.ENGLISH_REGIONS)
  })
  
  it('updates settings from modal', async () => {
    wrapper.vm.showSettings = true
    await flushPromises()
    
    const settingsModal = wrapper.findComponent({ name: 'SettingsModal' })
    
    // Simulate setting updates from the modal
    settingsModal.vm.$emit('update:writing-style', 'technical')
    settingsModal.vm.$emit('update:english-region', 'us')
    settingsModal.vm.$emit('update:api-key', 'new-api-key')
    
    expect(wrapper.vm.writingStyle).toBe('technical')
    expect(wrapper.vm.englishRegion).toBe('us')
    expect(wrapper.vm.openAIKey).toBe('new-api-key')
  })
  
  it('closes settings modal', async () => {
    wrapper.vm.showSettings = true
    await flushPromises()
    
    const settingsModal = wrapper.findComponent({ name: 'SettingsModal' })
    settingsModal.vm.$emit('close')
    
    expect(wrapper.vm.showSettings).toBe(false)
  })
  
  it('saves settings to localStorage', async () => {
    wrapper.vm.writingStyle = 'casual'
    wrapper.vm.englishRegion = 'au'
    wrapper.vm.openAIKey = 'test-api-key'
    
    await flushPromises()
    
    expect(localStorage.setItem).toHaveBeenCalledWith('writer-style', 'casual')
    expect(localStorage.setItem).toHaveBeenCalledWith('writer-english-region', 'au')
    expect(localStorage.setItem).toHaveBeenCalledWith('openai_api_key', 'test-api-key')
  })
}) 