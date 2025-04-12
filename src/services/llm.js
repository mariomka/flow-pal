import { ChatOpenAI } from '@langchain/openai'

// LLM Configuration
const config = {
  openai: {
    modelName: 'gpt-4',
    temperature: 0.3, // Lower temperature for more consistent, focused responses
    get apiKey() {
      return localStorage.getItem('openai_api_key') || '';
    }
  }
}

// LLM Provider class to abstract the implementation details
class LLMProvider {
  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured. Please enter your API key in the settings.')
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

export async function improveWriting(text, options = { 
  onlyGrammar: false, 
  handleSpanish: true, // Kept for backward compatibility but will always be treated as true
  customInstructions: '',
  writingStyle: 'preserve',
  englishRegion: 'default'
}) {
  const llm = new LLMProvider()
  
  // Ensure options are properly initialized with defaults
  const normalizedOptions = {
    onlyGrammar: options.onlyGrammar ?? false,
    handleSpanish: true, // Always true for backward compatibility
    customInstructions: options.customInstructions ?? '',
    writingStyle: options.writingStyle ?? 'preserve',
    englishRegion: options.englishRegion ?? 'default'
  }
  
  // Define style-specific instructions
  const styleInstructions = {
    preserve: `
      - Maintain the original writing style, voice, and tone
      - Only fix errors while preserving the author's unique expression
      - Keep the same level of formality and complexity
    `,
    business: `
      - Use clear, concise, and professional language
      - Maintain a confident and direct tone
      - Focus on clarity and actionable information
      - Use business-appropriate terminology
      - Keep sentences brief and well-structured
      - Emphasize professionalism and efficiency
    `,
    technical: `
      - Use precise and specific terminology
      - Maintain a clear and methodical structure
      - Focus on accuracy and detail
      - Use technical terms appropriately
      - Ensure explanations are thorough and exact
      - Present information in a logical sequence
    `,
    casual: `
      - Use friendly and conversational language
      - Include natural expressions and colloquialisms
      - Keep sentences relatively simple and easy to read
      - Maintain an engaging and personal tone
      - Use contractions and informal phrases when appropriate
      - Write as if speaking to a friend
    `,
    marketing: `
      - Use engaging and benefit-focused language
      - Create emotional connections with readers
      - Include persuasive calls to action
      - Highlight unique value propositions
      - Use power words and emotional triggers
      - Maintain brand voice consistency
    `,
    simple: `
      - Use clear, straightforward language
      - Keep sentences short and direct
      - Avoid jargon and complex terminology
      - Explain concepts in simple terms
      - Use active voice consistently
      - Focus on readability for general audiences
    `
  }
  
  // Define region-specific instructions
  const regionInstructions = {
    default: '',
    us: `
      - Use American English spelling (e.g., "color" instead of "colour")
      - Prefer American English vocabulary and expressions
      - Follow American English punctuation and grammar conventions
    `,
    uk: `
      - Use British English spelling (e.g., "colour" instead of "color")
      - Prefer British English vocabulary and expressions
      - Follow British English punctuation and grammar conventions
    `,
    au: `
      - Use Australian English spelling (mostly following British conventions with some exceptions)
      - Incorporate Australian English vocabulary and expressions where appropriate
      - Follow Australian English punctuation and grammar conventions
    `,
    ca: `
      - Use Canadian English spelling (a mix of British and American conventions, e.g., "colour" but "analyze")
      - Prefer Canadian English vocabulary and expressions
      - Follow Canadian English punctuation and grammar conventions
    `
  }
  
  let instruction = `You are an expert English language editor with native-level mastery.
    Your task is to ${normalizedOptions.onlyGrammar ? 'fix grammar and spelling errors only' : 'improve the provided text'} while:

    ${normalizedOptions.onlyGrammar ? `
    1. Fixing grammar and spelling errors
    2. Making minimal changes to preserve the original writing style
    3. Not changing word choice or phrasing unless necessary for grammar
    ` : `
    Writing Style Instructions:
    ${styleInstructions[normalizedOptions.writingStyle]}
    
    ${normalizedOptions.englishRegion !== 'default' ? `English Region Instructions:
    ${regionInstructions[normalizedOptions.englishRegion]}` : ''}
    
    General Improvements:
    1. Enhancing clarity and flow while maintaining the intended meaning
    2. Using appropriate expressions based on the selected style
    3. Improving sentence structure for better readability
    4. Maintaining an appropriate tone for the selected style
    5. Fixing any grammar or spelling errors
    `}

    Foreign Language Handling:
    - Identify any non-English words, phrases, or sentences in the text
    - Translate them to natural, contextually appropriate English
    - Ensure the translations flow naturally with the rest of the text

    ${normalizedOptions.customInstructions ? `
    Additional custom instructions:
    ${normalizedOptions.customInstructions}
    ` : ''}

    IMPORTANT FORMATTING RULES:
    - Preserve all line breaks exactly as they appear in the original text
    - Maintain paragraph structure and spacing
    - Keep any special formatting like bullet points, numbering, or indentation
    - Respect the original text's list formats and structural elements
    - If text has multiple paragraphs, maintain the same paragraph breaks
    
    The goal is to ${normalizedOptions.onlyGrammar ? 'fix grammar while preserving the original writing as much as possible' : `improve the text according to the ${normalizedOptions.writingStyle === 'preserve' ? 'original' : normalizedOptions.writingStyle} style guidelines`}${normalizedOptions.englishRegion !== 'default' ? ` using ${normalizedOptions.englishRegion.toUpperCase()} English conventions` : ''} while keeping the exact same formatting.
    Return only the ${normalizedOptions.onlyGrammar ? 'corrected' : 'improved'} text without any explanations or comments.`
  
  return await llm.process(text, instruction)
}

// Export the processor with its configuration
export const textProcessor = {
  name: 'Improve Writing',
  processor: improveWriting,
  description: 'Enhances text to sound more natural and native-like while maintaining meaning'
}