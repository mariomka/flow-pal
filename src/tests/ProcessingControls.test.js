import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProcessingControls from '../components/ProcessingControls/ProcessingControls.vue'

describe('ProcessingControls Component', () => {
  const writingStyles = [
    { id: 'preserve', label: 'Preserve Original Style', description: 'Maintain the original writing style while fixing errors' },
    { id: 'business', label: 'Business', description: 'Professional and clear tone for business communication' }
  ]
  
  let wrapper
  
  beforeEach(() => {
    wrapper = mount(ProcessingControls, {
      props: {
        onlyGrammar: false,
        handleSpanish: true,
        writingStyle: 'preserve',
        isProcessing: false,
        writingStyles
      }
    })
  })
  
  it('renders all controls correctly', () => {
    expect(wrapper.text()).toContain('Only Fix Grammar')
    expect(wrapper.text()).toContain('Handle Spanish Text')
    expect(wrapper.text()).toContain('Style:')
    expect(wrapper.text()).toContain('Improve Writing')
    expect(wrapper.text()).toContain('Clear All')
  })
  
  it('renders writing style options', () => {
    const options = wrapper.findAll('option')
    expect(options.length).toBe(writingStyles.length)
    expect(options[0].text()).toBe(writingStyles[0].label)
    expect(options[1].text()).toBe(writingStyles[1].label)
  })
  
  it('displays Processing... when isProcessing is true', async () => {
    await wrapper.setProps({ isProcessing: true })
    expect(wrapper.text()).toContain('Processing...')
    expect(wrapper.text()).not.toContain('Improve Writing')
  })
  
  it('emits update:onlyGrammar event when grammar checkbox is changed', async () => {
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:onlyGrammar')).toBeTruthy()
    expect(wrapper.emitted('update:onlyGrammar')[0]).toEqual([true])
  })
  
  it('emits update:handleSpanish event when Spanish checkbox is changed', async () => {
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    await checkboxes[1].setValue(false)
    expect(wrapper.emitted('update:handleSpanish')).toBeTruthy()
    expect(wrapper.emitted('update:handleSpanish')[0]).toEqual([false])
  })
  
  it('emits update:writingStyle event when style selector is changed', async () => {
    await wrapper.find('select').setValue('business')
    expect(wrapper.emitted('update:writingStyle')).toBeTruthy()
    expect(wrapper.emitted('update:writingStyle')[0]).toEqual(['business'])
  })
  
  it('emits process event when Improve Writing button is clicked', async () => {
    await wrapper.find('.btn-primary').trigger('click')
    expect(wrapper.emitted('process')).toBeTruthy()
  })
  
  it('emits clear event when Clear All button is clicked', async () => {
    await wrapper.find('.btn-secondary').trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })
  
  it('disables the process button when isProcessing is true', async () => {
    await wrapper.setProps({ isProcessing: true })
    expect(wrapper.find('.btn-primary').attributes('disabled')).toBeDefined()
  })
}) 