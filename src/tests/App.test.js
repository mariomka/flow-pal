import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'

// Mock all components
vi.mock('../components/Header/Header.vue', () => ({
  default: {
    name: 'Header',
    template: '<div data-testid="header"><slot /></div>',
    props: ['loadingApiKey']
  }
}))

vi.mock('../components/ProcessingControls/ProcessingControls.vue', () => ({
  default: {
    name: 'ProcessingControls',
    template: '<div data-testid="processing-controls"><slot /></div>',
    props: ['onlyGrammar', 'handleSpanish', 'writingStyle', 'isProcessing', 'writingStyles']
  }
}))

vi.mock('../components/CustomInstructions/CustomInstructions.vue', () => ({
  default: {
    name: 'CustomInstructions',
    template: '<div data-testid="custom-instructions"><slot /></div>',
    props: ['instructions', 'visible']
  }
}))

vi.mock('../components/TextEditor/TextEditor.vue', () => ({
  default: {
    name: 'TextEditor',
    template: '<div data-testid="text-editor"><slot /></div>',
    props: ['text']
  }
}))

vi.mock('../components/ProcessedText/ProcessedText.vue', () => ({
  default: {
    name: 'ProcessedText',
    template: '<div data-testid="processed-text"><slot /></div>',
    props: ['originalText', 'processedText', 'showDiff', 'showOnlyAdditions']
  }
}))

vi.mock('../components/SettingsModal/SettingsModal.vue', () => ({
  default: {
    name: 'SettingsModal',
    template: '<div data-testid="settings-modal"><slot /></div>',
    props: ['show', 'initialApiKey']
  }
}))

// Mock textProcessor service
vi.mock('../services/llm', () => ({
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
          ProcessingControls: true,
          CustomInstructions: true,
          TextEditor: true,
          ProcessedText: true,
          SettingsModal: true
        }
      }
    })
  })
  
  it('renders all components', () => {
    expect(wrapper.findComponent({ name: 'Header' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ProcessingControls' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'CustomInstructions' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TextEditor' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ProcessedText' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SettingsModal' }).exists()).toBe(true)
  })
  
  it('processes text when the process function is called', async () => {
    const textProcessor = (await import('../services/llm')).textProcessor
    wrapper.vm.inputText = 'Test text'
    wrapper.vm.openAIKey = 'test-api-key'
    
    await wrapper.vm.processText()
    await flushPromises()
    
    expect(textProcessor.processor).toHaveBeenCalledWith('Test text', {
      onlyGrammar: false,
      handleSpanish: true,
      customInstructions: '',
      writingStyle: 'preserve'
    })
    
    expect(wrapper.vm.processedText).toBe('Processed: Test text')
  })
  
  it('shows error message when no text is provided', async () => {
    wrapper.vm.inputText = ''
    
    await wrapper.vm.processText()
    
    expect(wrapper.vm.error).toBe('Please enter some text to process.')
  })
  
  it('shows error message when no API key is provided', async () => {
    wrapper.vm.inputText = 'Test text'
    wrapper.vm.openAIKey = ''
    
    await wrapper.vm.processText()
    
    expect(wrapper.vm.error).toBe('OpenAI API key is not configured. Please enter your API key in the settings.')
    expect(wrapper.vm.showSettings).toBe(true)
  })
  
  it('replaces input text with processed text when replaceWithProcessed is called', async () => {
    wrapper.vm.inputText = 'Original text'
    wrapper.vm.processedText = 'Processed text'
    
    wrapper.vm.replaceWithProcessed()
    
    expect(wrapper.vm.inputText).toBe('Processed text')
  })
  
  it('clears text when clearText is confirmed', async () => {
    // Mock window.confirm to return true
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    
    wrapper.vm.inputText = 'Test text'
    wrapper.vm.processedText = 'Processed text'
    
    wrapper.vm.clearText()
    
    expect(wrapper.vm.inputText).toBe('')
    expect(wrapper.vm.processedText).toBe('')
  })
  
  it('does not clear text when clearText is cancelled', async () => {
    // Mock window.confirm to return false
    vi.spyOn(window, 'confirm').mockImplementation(() => false)
    
    wrapper.vm.inputText = 'Test text'
    wrapper.vm.processedText = 'Processed text'
    
    wrapper.vm.clearText()
    
    expect(wrapper.vm.inputText).toBe('Test text')
    expect(wrapper.vm.processedText).toBe('Processed text')
  })
}) 