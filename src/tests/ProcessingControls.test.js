import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProcessingControls from '../components/ProcessingControls/ProcessingControls.vue'

describe('ProcessingControls Component', () => {
  const writingStyles = [
    { id: 'preserve', label: 'Preserve Original Style', description: 'Maintain the original writing style while fixing errors' },
    { id: 'business', label: 'Business', description: 'Professional and clear tone for business communication' }
  ]
  
  const englishRegions = [
    { id: 'default', label: 'Default', description: 'Default English without specific regional preferences' },
    { id: 'us', label: 'US English', description: 'American English spelling and expressions' }
  ]
  
  let wrapper
  
  beforeEach(() => {
    wrapper = mount(ProcessingControls, {
      props: {
        onlyGrammar: false,
        autoMode: false,
        writingStyle: 'preserve',
        englishRegion: 'default',
        isProcessing: false,
        writingStyles,
        englishRegions
      }
    })
  })
  
  it('renders all controls correctly', () => {
    expect(wrapper.text()).toContain('Only Fix Grammar')
    expect(wrapper.text()).toContain('Auto Mode')
    expect(wrapper.text()).toContain('Style:')
    expect(wrapper.text()).toContain('Region:')
    expect(wrapper.text()).toContain('Improve Writing')
    expect(wrapper.text()).toContain('Clear All')
  })
  
  it('renders writing style options', () => {
    const styleSelect = wrapper.find('#writing-style')
    const options = styleSelect.findAll('option')
    expect(options.length).toBe(writingStyles.length)
    expect(options[0].text()).toBe(writingStyles[0].label)
    expect(options[1].text()).toBe(writingStyles[1].label)
  })
  
  it('renders English region options', () => {
    const regionSelect = wrapper.find('#english-region')
    const options = regionSelect.findAll('option')
    expect(options.length).toBe(englishRegions.length)
    expect(options[0].text()).toBe(englishRegions[0].label)
    expect(options[1].text()).toBe(englishRegions[1].label)
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
  
  it('emits update:autoMode event when auto mode checkbox is changed', async () => {
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    // Auto Mode is the second checkbox
    await checkboxes[1].setValue(true)
    expect(wrapper.emitted('update:autoMode')).toBeTruthy()
    expect(wrapper.emitted('update:autoMode')[0]).toEqual([true])
  })
  
  it('emits update:writingStyle event when style selector is changed', async () => {
    await wrapper.find('#writing-style').setValue('business')
    expect(wrapper.emitted('update:writingStyle')).toBeTruthy()
    expect(wrapper.emitted('update:writingStyle')[0]).toEqual(['business'])
  })
  
  it('emits update:englishRegion event when region selector is changed', async () => {
    await wrapper.find('#english-region').setValue('us')
    expect(wrapper.emitted('update:englishRegion')).toBeTruthy()
    expect(wrapper.emitted('update:englishRegion')[0]).toEqual(['us'])
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