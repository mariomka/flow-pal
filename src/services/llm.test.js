import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { improveWriting, textProcessor } from './llm'
import { ChatOpenAI } from '@langchain/openai'

// Mock ChatOpenAI implementation
vi.mock('@langchain/openai', () => {
  return {
    ChatOpenAI: vi.fn().mockImplementation(() => {
      return {
        invoke: vi.fn().mockResolvedValue({
          content: 'Processed response from language model'
        })
      }
    })
  }
})

describe('LLM Service', () => {
  let originalLocalStorage
  
  beforeEach(() => {
    // Mock localStorage
    originalLocalStorage = global.localStorage
    global.localStorage = {
      getItem: vi.fn().mockReturnValue('test-api-key'),
      setItem: vi.fn()
    }
    
    // Clear mock history between tests
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage
  })
  
  describe('LLMProvider', () => {
    it('should throw an error if API key is not configured', async () => {
      // Mock localStorage to return empty API key
      localStorage.getItem.mockReturnValueOnce('')
      
      await expect(improveWriting('Test text')).rejects.toThrow('OpenAI API key is not configured')
    })
    
    it('should handle API key errors correctly', async () => {
      const mockError = new Error('Invalid API key provided')
      ChatOpenAI.mockImplementationOnce(() => ({
        invoke: vi.fn().mockRejectedValue(mockError)
      }))
      
      await expect(improveWriting('Test text')).rejects.toThrow('Invalid API key')
    })
    
    it('should handle rate limit errors correctly', async () => {
      const mockError = new Error('429 error message')
      ChatOpenAI.mockImplementationOnce(() => ({
        invoke: vi.fn().mockRejectedValue(mockError)
      }))
      
      await expect(improveWriting('Test text')).rejects.toThrow('Rate limit exceeded')
    })
    
    it('should handle server errors correctly', async () => {
      const mockError = new Error('500 server error')
      ChatOpenAI.mockImplementationOnce(() => ({
        invoke: vi.fn().mockRejectedValue(mockError)
      }))
      
      await expect(improveWriting('Test text')).rejects.toThrow('OpenAI service is currently experiencing issues')
    })
    
    it('should handle empty responses from language model', async () => {
      ChatOpenAI.mockImplementationOnce(() => ({
        invoke: vi.fn().mockResolvedValue({
          content: null
        })
      }))
      
      await expect(improveWriting('Test text')).rejects.toThrow('No response received from the language model')
    })
  })
  
  describe('improveWriting', () => {
    it('should process text with default options', async () => {
      const result = await improveWriting('Test text')
      
      // Check ChatOpenAI was initialized with correct parameters
      expect(ChatOpenAI).toHaveBeenCalledWith({
        modelName: 'gpt-4',
        temperature: 0.3,
        openAIApiKey: 'test-api-key'
      })
      
      // Get the mocked instance and check invoke was called properly
      const mockInvoke = ChatOpenAI.mock.results[0].value.invoke
      expect(mockInvoke).toHaveBeenCalled()
      
      // Check the system prompt contains default style instructions
      const systemPrompt = mockInvoke.mock.calls[0][0][0].content
      expect(systemPrompt).toContain('Maintain the original writing style')
      expect(systemPrompt).not.toContain('English Region Instructions')
      
      // Check the user message contains the input text
      expect(mockInvoke.mock.calls[0][0][1].content).toBe('Test text')
      
      // Check the result
      expect(result).toBe('Processed response from language model')
    })
    
    it('should include grammar-only instructions when onlyGrammar is true', async () => {
      await improveWriting('Test text', { onlyGrammar: true })
      
      const mockInvoke = ChatOpenAI.mock.results[0].value.invoke
      const systemPrompt = mockInvoke.mock.calls[0][0][0].content
      
      // Check for grammar-specific instructions
      expect(systemPrompt).toContain('fix grammar and spelling errors only')
      expect(systemPrompt).toContain('Making minimal changes to preserve the original writing style')
      expect(systemPrompt).not.toContain('Writing Style Instructions')
    })
    
    it('should include writing style instructions', async () => {
      await improveWriting('Test text', { writingStyle: 'business' })
      
      const mockInvoke = ChatOpenAI.mock.results[0].value.invoke
      const systemPrompt = mockInvoke.mock.calls[0][0][0].content
      
      // Check for business style instructions
      expect(systemPrompt).toContain('Use clear, concise, and professional language')
      expect(systemPrompt).toContain('Keep sentences brief and well-structured')
    })
    
    it('should include English region instructions', async () => {
      await improveWriting('Test text', { englishRegion: 'uk' })
      
      const mockInvoke = ChatOpenAI.mock.results[0].value.invoke
      const systemPrompt = mockInvoke.mock.calls[0][0][0].content
      
      // Check for UK English instructions
      expect(systemPrompt).toContain('English Region Instructions')
      expect(systemPrompt).toContain('Use British English spelling')
      expect(systemPrompt).toContain('using UK English conventions')
    })
    
    it('should include custom instructions when provided', async () => {
      await improveWriting('Test text', { 
        customInstructions: 'Make it sound more enthusiastic.' 
      })
      
      const mockInvoke = ChatOpenAI.mock.results[0].value.invoke
      const systemPrompt = mockInvoke.mock.calls[0][0][0].content
      
      // Check for custom instructions
      expect(systemPrompt).toContain('Additional custom instructions')
      expect(systemPrompt).toContain('Make it sound more enthusiastic.')
    })
    
    it('should handle foreign language text properly', async () => {
      await improveWriting('Text with español mixed in')
      
      const mockInvoke = ChatOpenAI.mock.results[0].value.invoke
      const systemPrompt = mockInvoke.mock.calls[0][0][0].content
      
      // Check for foreign language handling instructions
      expect(systemPrompt).toContain('Foreign Language Handling')
      expect(systemPrompt).toContain('Identify any non-English words, phrases, or sentences')
    })
  })
  
  describe('textProcessor', () => {
    it('should have the correct configuration', () => {
      expect(textProcessor.name).toBe('Improve Writing')
      expect(textProcessor.processor).toBe(improveWriting)
      expect(textProcessor.description).toContain('Enhances text')
    })
  })
}) 