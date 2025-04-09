import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomInstructions from '../components/CustomInstructions/CustomInstructions.vue'

describe('CustomInstructions Component', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(CustomInstructions)
    expect(wrapper.text()).toContain('Custom Instructions')
    expect(wrapper.find('textarea').exists()).toBe(false) // Should be hidden by default
  })

  it('shows textarea when visible is true', () => {
    const wrapper = mount(CustomInstructions, {
      props: {
        visible: true
      }
    })
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('shows indicator when instructions exist but section is collapsed', () => {
    const wrapper = mount(CustomInstructions, {
      props: {
        instructions: 'Some custom instructions',
        visible: false
      }
    })
    expect(wrapper.find('.rounded-full').exists()).toBe(true)
  })

  it('shows character count for longer instructions', () => {
    const longInstructions = 'This is a very long instruction that should show a character count'
    const wrapper = mount(CustomInstructions, {
      props: {
        instructions: longInstructions,
        visible: false
      }
    })
    // Should round to nearest 10
    expect(wrapper.text()).toContain(`${Math.round(longInstructions.length / 10) * 10}c`)
  })

  it('emits update:visible event when toggle button is clicked', async () => {
    const wrapper = mount(CustomInstructions)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')[0]).toEqual([true])
  })

  it('emits update:instructions event when textarea is updated', async () => {
    const wrapper = mount(CustomInstructions, {
      props: {
        visible: true
      }
    })
    await wrapper.find('textarea').setValue('New instructions')
    expect(wrapper.emitted('update:instructions')).toBeTruthy()
    expect(wrapper.emitted('update:instructions')[0]).toEqual(['New instructions'])
  })
}) 