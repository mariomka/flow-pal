import { ChatOpenAI } from '@langchain/openai'

// LLM Configuration
const config = {
  openai: {
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3, // Lower temperature for more consistent, focused responses
    apiKey: import.meta.env.VITE_OPENAI_API_KEY
  }
}

// LLM Provider class to abstract the implementation details
class LLMProvider {
  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured')
    }

    this.model = new ChatOpenAI({
      modelName: config.openai.modelName,
      temperature: config.openai.temperature,
      openAIApiKey: config.openai.apiKey
    })
  }

  async process(text, instruction) {
    try {
      const response = await this.model.invoke([
        {
          role: 'system',
          content: instruction
        },
        {
          role: 'user',
          content: text
        }
      ])

      if (!response.content) {
        throw new Error('No response received from the language model')
      }

      return response.content
    } catch (error) {
      console.error('LLM Processing Error:', error)
      
      // Handle specific error cases
      if (error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your configuration.')
      }
      if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      }
      if (error.message.includes('500')) {
        throw new Error('OpenAI service is currently experiencing issues. Please try again later.')
      }
      
      throw new Error(error.message || 'Failed to process text. Please try again.')
    }
  }
}

// Text processing functions
export async function fixText(text) {
  const llm = new LLMProvider()
  const instruction = `You are a professional editor focused on fixing grammar and spelling errors.
    Fix any grammar and spelling errors in the provided text.
    Maintain the original meaning, style, and formatting.
    Return only the corrected text without any explanations or additional comments.
    If the text is already correct, return it as is.`
  
  return await llm.process(text, instruction)
}

export async function translateAndFix(text) {
  const llm = new LLMProvider()
  const instruction = `You are a bilingual Spanish-English editor and translator.
    Your task is to:
    1. Identify any Spanish words or phrases in the provided text
    2. Translate them to English, choosing the most natural and contextually appropriate translation
    3. Fix any grammar or spelling errors in the entire text
    4. Ensure the final text flows naturally in English
    
    Return only the final English text without any explanations or comments.
    If you encounter ambiguous Spanish terms, choose the most likely meaning based on context.`
  
  return await llm.process(text, instruction)
}

export async function improveWriting(text, options = { onlyGrammar: false, handleSpanish: true }) {
  const llm = new LLMProvider()
  
  let instruction = `You are an expert English language editor with native-level mastery.
    Your task is to ${options.onlyGrammar ? 'fix grammar and spelling errors only' : 'improve the provided text by'}:
    ${options.onlyGrammar ? `
    1. Fixing grammar and spelling errors
    2. Making minimal changes to preserve the original writing style
    3. Not changing word choice or phrasing unless necessary for grammar
    ` : `
    1. Enhancing clarity and flow while maintaining the original meaning
    2. Using natural, idiomatic English expressions
    3. Choosing vocabulary and phrases that native English speakers commonly use
    4. Improving sentence structure for better readability
    5. Maintaining an appropriate tone based on the context
    6. Fixing any grammar or spelling errors
    `}

    ${options.handleSpanish ? `
    Additional Spanish handling:
    - Identify any Spanish words or phrases in the text
    - Translate them to natural, contextually appropriate English
    - Ensure the translations flow naturally with the rest of the text
    ` : ''}

    IMPORTANT FORMATTING RULES:
    - Preserve all line breaks exactly as they appear in the original text
    - Maintain paragraph structure and spacing
    - Keep any special formatting like bullet points, numbering, or indentation
    - Respect the original text's list formats and structural elements
    - If text has multiple paragraphs, maintain the same paragraph breaks
    
    The goal is to ${options.onlyGrammar ? 'fix grammar while preserving the original writing as much as possible' : 'make the text sound as if it was written by a skilled native English speaker'} while keeping the exact same formatting.
    Return only the ${options.onlyGrammar ? 'corrected' : 'improved'} text without any explanations or comments.`
  
  return await llm.process(text, instruction)
}

// Export other processing functions as needed
export const textProcessors = {
  fix: {
    name: 'Fix Grammar & Spelling',
    processor: fixText,
    description: 'Corrects grammar and spelling errors while maintaining the original meaning'
  },
  translateFix: {
    name: 'Translate & Fix (Spanish → English)',
    processor: translateAndFix,
    description: 'Translates Spanish words/phrases to English and fixes grammar'
  },
  improve: {
    name: 'Improve Writing',
    processor: improveWriting,
    description: 'Enhances text to sound more natural and native-like while maintaining meaning'
  }
  // Add more processors here as needed
}

// Export the processor with its configuration
export const textProcessor = {
  name: 'Improve Writing',
  processor: improveWriting,
  description: 'Enhances text to sound more natural and native-like while maintaining meaning'
} 