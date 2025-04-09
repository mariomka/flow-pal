// vitest.setup.js
import { beforeAll, afterEach, vi } from 'vitest'

// Mock localStorage
beforeAll(() => {
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
})

// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks()
}) 