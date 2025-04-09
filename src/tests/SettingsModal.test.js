import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsModal from '../components/SettingsModal/SettingsModal.vue'

describe('SettingsModal Component', () => {
  it('does not render when show is false', () => {
    const wrapper = mount(SettingsModal, {
      props: {
        show: false,
        initialApiKey: ''
      }
    })
    expect(wrapper.find('.settings-modal').exists()).toBe(false)
  })

  it('renders when show is true', () => {
    const wrapper = mount(SettingsModal, {
      props: {
        show: true,
        initialApiKey: ''
      }
    })
    expect(wrapper.find('.settings-modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('OpenAI API Key')
  })

  it('updates apiKey when initialApiKey changes', async () => {
    const wrapper = mount(SettingsModal, {
      props: {
        show: true,
        initialApiKey: ''
      }
    })
    await wrapper.setProps({ initialApiKey: 'test-key' })
    expect(wrapper.vm.apiKey).toBe('test-key')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(SettingsModal, {
      props: {
        show: true,
        initialApiKey: ''
      }
    })
    await wrapper.find('button[class*="text-gray-500"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits update:apiKey and close events when save button is clicked', async () => {
    const wrapper = mount(SettingsModal, {
      props: {
        show: true,
        initialApiKey: ''
      }
    })
    await wrapper.find('input').setValue('new-api-key')
    await wrapper.find('.btn-primary').trigger('click')
    expect(wrapper.emitted('update:apiKey')).toBeTruthy()
    expect(wrapper.emitted('update:apiKey')[0]).toEqual(['new-api-key'])
    expect(wrapper.emitted('close')).toBeTruthy()
  })
}) 