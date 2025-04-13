import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsModal from './SettingsModal.vue'

describe('SettingsModal Component', () => {
  let wrapper

  const defaultProps = {
    show: true,
    initialApiKey: 'test-api-key',
    writingStyle: 'preserve',
    englishRegion: 'default',
    customInstructions: 'test instructions',
    writingStyles: [
      { id: 'preserve', label: 'Preserve Original Style', description: 'Maintain the original writing style while fixing errors' },
      { id: 'business', label: 'Business', description: 'Professional and clear tone for business communication' }
    ],
    englishRegions: [
      { id: 'default', label: 'Default', description: 'Default English without specific regional preferences' },
      { id: 'us', label: 'US English', description: 'American English spelling and expressions' }
    ]
  }

  beforeEach(() => {
    wrapper = mount(SettingsModal, {
      props: defaultProps
    })
  })

  it('renders based on show prop', async () => {
    expect(wrapper.isVisible()).toBe(true)
    
    await wrapper.setProps({ show: false })
    expect(wrapper.isVisible()).toBe(false)
  })

  it('initializes with provided API key', () => {
    const input = wrapper.find('input')
    expect(input.element.value).toBe('test-api-key')
  })

  it('updates the apiKey when changed', async () => {
    const input = wrapper.find('input')
    await input.setValue('new-api-key')
    expect(wrapper.vm.apiKeyValue).toBe('new-api-key')
  })

  it('updates the writingStyle when initializing', async () => {
    expect(wrapper.vm.writingStyleValue).toBe('preserve')
    
    await wrapper.setProps({ writingStyle: 'business' })
    expect(wrapper.vm.writingStyleValue).toBe('business')
  })

  it('updates the englishRegion when initializing', async () => {
    expect(wrapper.vm.englishRegionValue).toBe('default')
    
    await wrapper.setProps({ englishRegion: 'us' })
    expect(wrapper.vm.englishRegionValue).toBe('us')
  })

  it('updates the customInstructions when initializing', async () => {
    expect(wrapper.vm.customInstructionsValue).toBe('test instructions')
    
    await wrapper.setProps({ customInstructions: 'new instructions' })
    expect(wrapper.vm.customInstructionsValue).toBe('new instructions')
  })

  it('emits close event when closeModal is called', async () => {
    await wrapper.vm.closeModal()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits update events when saveSettings is called', async () => {
    await wrapper.vm.saveSettings()
    
    expect(wrapper.emitted('update:api-key')).toBeTruthy()
    expect(wrapper.emitted('update:api-key')[0]).toEqual(['test-api-key'])
    
    expect(wrapper.emitted('update:writing-style')).toBeTruthy()
    expect(wrapper.emitted('update:writing-style')[0]).toEqual(['preserve'])
    
    expect(wrapper.emitted('update:english-region')).toBeTruthy()
    expect(wrapper.emitted('update:english-region')[0]).toEqual(['default'])
    
    expect(wrapper.emitted('update:custom-instructions')).toBeTruthy()
    expect(wrapper.emitted('update:custom-instructions')[0]).toEqual(['test instructions'])
  })

  it('emits close event after saveSettings', async () => {
    await wrapper.vm.saveSettings()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('toggles API key visibility', async () => {
    expect(wrapper.vm.showApiKey).toBe(false)
    
    const toggleButton = wrapper.find('button[type="button"]')
    await toggleButton.trigger('click')
    
    expect(wrapper.vm.showApiKey).toBe(true)
  })

  it('closes modal when backdrop is clicked', async () => {
    const backdrop = wrapper.find('.backdrop-overlay')
    await backdrop.trigger('click')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('closes modal when X button is clicked', async () => {
    const closeButton = wrapper.find('.text-gray-500.hover\\:text-gray-700')
    await closeButton.trigger('click')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('returns correct style description', () => {
    wrapper.vm.writingStyleValue = 'business'
    expect(wrapper.vm.getStyleDescription()).toBe('Professional and clear tone for business communication')
  })

  it('returns correct region description', () => {
    wrapper.vm.englishRegionValue = 'us'
    expect(wrapper.vm.getRegionDescription()).toBe('American English spelling and expressions')
  })
}) 