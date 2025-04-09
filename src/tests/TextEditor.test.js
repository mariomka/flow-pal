import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TextEditor from '../components/TextEditor/TextEditor.vue'

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
})

describe('TextEditor Component', () => {
  let wrapper
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers() // Use fake timers for setTimeout
    wrapper = mount(TextEditor, {
      props: {
        text: 'Initial text'
      }
    })
  })
  
  afterEach(() => {
    vi.useRealTimers() // Reset timers after each test
  })
  
  it('renders properly with initial text', () => {
    expect(wrapper.text()).toContain('Your Text')
    expect(wrapper.find('textarea').element.value).toBe('Initial text')
  })
  
  it('shows copy button when text exists', () => {
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Copy')
  })
  
  it('hides copy button when text is empty', async () => {
    await wrapper.setProps({ text: '' })
    expect(wrapper.find('button').exists()).toBe(false)
  })
  
  it('emits update:text event when textarea content changes', async () => {
    await wrapper.find('textarea').setValue('New text')
    expect(wrapper.emitted('update:text')).toBeTruthy()
    expect(wrapper.emitted('update:text')[0]).toEqual(['New text'])
  })
  
  it('copies text to clipboard when copy button is clicked', async () => {
    await wrapper.find('button').trigger('click')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Initial text')
    expect(wrapper.vm.copied).toBe(true)
    
    // Reset copy state after 2 seconds
    vi.advanceTimersByTime(2000)
    expect(wrapper.vm.copied).toBe(false)
  })
  
  it('shows "Copied!" text after copying', async () => {
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').text()).toContain('Copied!')
  })
  
  it('adjusts textarea height on input', async () => {
    // Create a mock event with a target
    const mockEvent = {
      target: {
        style: {
          height: ''
        },
        scrollHeight: 100
      }
    }
    
    // Call the method directly with our mock event
    wrapper.vm.adjustTextareaHeight(mockEvent)
    
    // Check the height was set correctly
    expect(mockEvent.target.style.height).toBe('100px')
  })
}) 