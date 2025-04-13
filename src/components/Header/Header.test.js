import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Header from './Header.vue'
import ThemeSwitcher from '../ThemeSwitcher.vue'

// Mock the ThemeSwitcher component
vi.mock('../ThemeSwitcher.vue', () => ({
  default: {
    name: 'ThemeSwitcher',
    template: '<div data-testid="theme-switcher"></div>'
  }
}))

describe('Header Component', () => {
  it('renders properly', () => {
    const wrapper = mount(Header)
    expect(wrapper.text()).toContain('FlowPal')
    expect(wrapper.findComponent(ThemeSwitcher).exists()).toBe(true)
  })

  it('emits toggle-settings event when settings button is clicked', async () => {
    const wrapper = mount(Header)
    await wrapper.find('button[aria-label="Settings"]').trigger('click')
    expect(wrapper.emitted('toggle-settings')).toBeTruthy()
    expect(wrapper.emitted('toggle-settings').length).toBe(1)
  })
}) 