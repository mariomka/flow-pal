import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProcessedText from '../components/ProcessedText/ProcessedText.vue'

// Mock dependencies
vi.mock('@mdi/js', () => ({
  mdiArrowLeft: 'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z'
}))

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
})

describe('ProcessedText Component', () => {
  let wrapper
  
  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(ProcessedText, {
      props: {
        originalText: 'This is the original text.',
        processedText: 'This is the improved text.',
        showDiff: false,
        showOnlyAdditions: false
      }
    })
  })
  
  it('renders properly with processed text', () => {
    expect(wrapper.text()).toContain('Processed Text')
    expect(wrapper.text()).toContain('This is the improved text.')
  })
  
  it('shows both buttons when processed text is available', () => {
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
    expect(buttons[0].text()).toContain('Copy')
    expect(buttons[1].text()).toContain('Apply')
  })
  
  it('hides buttons when no processed text is available', async () => {
    await wrapper.setProps({ processedText: '' })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(0)
  })
  
  it('computes text differences correctly', async () => {
    await wrapper.setProps({ showDiff: true })
    expect(wrapper.vm.textDiff.length).toBeGreaterThan(0)
  })
  
  it('shows diff view when showDiff is true', async () => {
    await wrapper.setProps({ showDiff: true })
    expect(wrapper.find('span').exists()).toBe(true)
  })
  
  it('emits update:showDiff event when Show Changes checkbox is clicked', async () => {
    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)
    expect(wrapper.emitted('update:showDiff')).toBeTruthy()
    expect(wrapper.emitted('update:showDiff')[0]).toEqual([true])
  })
  
  it('emits update:showOnlyAdditions event when Show Only Additions checkbox is clicked', async () => {
    await wrapper.findAll('input[type="checkbox"]')[1].setValue(true)
    expect(wrapper.emitted('update:showOnlyAdditions')).toBeTruthy()
    expect(wrapper.emitted('update:showOnlyAdditions')[0]).toEqual([true])
  })
  
  it('emits apply event when Apply button is clicked', async () => {
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('apply')).toBeTruthy()
  })
  
  it('copies text to clipboard when Copy button is clicked', async () => {
    await wrapper.findAll('button')[0].trigger('click')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('This is the improved text.')
    expect(wrapper.vm.copied).toBe(true)
  })
  
  it('shows clickable spans for additions in diff view', async () => {
    await wrapper.setProps({ 
      originalText: 'This is text.',
      processedText: 'This is improved text.',
      showDiff: true
    })
    // Wait for diff to compute
    await wrapper.vm.$nextTick()
    
    // Find a green span (addition)
    const additionSpan = wrapper.find('.bg-green-100')
    expect(additionSpan.exists()).toBe(true)
    expect(additionSpan.text()).toContain('improved')
  })
  
  it('emits apply-change and change-applied events when clicking on an addition', async () => {
    await wrapper.setProps({ 
      originalText: 'This is text.',
      processedText: 'This is improved text.',
      showDiff: true
    })
    // Wait for diff to compute
    await wrapper.vm.$nextTick()
    
    // Find and click a green span (addition)
    const additionSpan = wrapper.find('.bg-green-100')
    await additionSpan.trigger('click')
    
    // Check both events were emitted
    expect(wrapper.emitted('apply-change')).toBeTruthy()
    expect(wrapper.emitted('change-applied')).toBeTruthy()
  })
}) 