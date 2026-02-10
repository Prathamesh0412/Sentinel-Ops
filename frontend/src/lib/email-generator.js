import { HfInference } from '@huggingface/inference'

const DEFAULT_MODEL = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2'

export async function generateEmailContent(input) {
  const template = buildRuleBasedEmail(input)

  if (!process.env.HUGGINGFACE_API_KEY) {
    return template
  }

  try {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)
    const prompt = buildPrompt(input)
    const response = await hf.textGeneration({
      model: DEFAULT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 220,
        temperature: 0.4,
        top_p: 0.9,
        return_full_text: false,
      },
    })

    const parsed = extractStructuredEmail(response.generated_text)
    if (parsed) {
      return { ...parsed, source: 'huggingface' }
    }
  } catch (error) {
    console.warn('[email-generator] Falling back to rule-based template', error)
  }

  return template
}

function buildPrompt(input) {
  return `You are a professional customer success assistant.
Create a concise plain-text email (no markdown, no emojis) that matches the instructions.
Sentiment: ${input.sentiment}
Category: ${input.category}
Customer: ${input.customerName}
Feedback: """${input.feedback}"""
The email must follow these rules:
- Maximum 180 words.
- Sound human, calm, and professional.
- Include a short subject line.
- Do not restate the sentiment label.
Provide the response using this exact format:
SUBJECT: <subject line>
BODY: <email body>`
}

function extractStructuredEmail(text) {
  if (!text) return null
  const match = text.match(/SUBJECT:\s*(.*)\nBODY:\s*([\s\S]*)/i)
  if (!match) return null
  return {
    subject: match[1].trim().replace(/^"|"$/g, ''),
    email_body: match[2].trim(),
  }
}

function buildRuleBasedEmail({ customerName, feedback, sentiment }) {
  const safeName = customerName || 'Valued Customer'
  const normalizedFeedback = feedback?.trim() || 'your recent experience with us'

  const templates = {
    Positive: {
      subject: 'Thank you for your feedback',
      body: `Dear ${safeName},\n\nThank you for sharing your encouraging feedback. We appreciate your continued trust and are delighted to know we are meeting your expectations. Please keep the insights coming so we can keep delivering value.\n\nWarm regards,\nAutoOps Success Team`,
    },
    Neutral: {
      subject: 'Thanks for staying in touch',
      body: `Dear ${safeName},\n\nThank you for taking the time to share your thoughts. We reviewed your note about ${normalizedFeedback} and would love to learn what improvements would make the experience better. If there is anything our team can clarify or optimize, please reply and we will follow up promptly.\n\nBest wishes,\nAutoOps Success Team`,
    },
    Negative: {
      subject: 'We are addressing your concern',
      body: `Dear ${safeName},\n\nI am sorry to hear about your recent experience regarding ${normalizedFeedback}. Your feedback is important, and our team is already reviewing the issue to ensure it is resolved quickly. Please let us know any additional details that would help us fix this completely.\n\nThank you for your patience,\nAutoOps Success Team`,
    },
  }

  const selected = templates[sentiment]
  return {
    subject: selected.subject,
    email_body: selected.body,
    source: 'template',
  }
}