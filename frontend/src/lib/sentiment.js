import vader from 'vader-sentiment'

const POSITIVE_THRESHOLD = 0.35
const NEGATIVE_THRESHOLD = -0.2

export function analyzeSentiment(feedback) {
  const sanitized = feedback?.trim() || ''
  const { compound } = vader.SentimentIntensityAnalyzer.polarity_scores(sanitized)

  let sentiment = 'Neutral'
  if (compound >= POSITIVE_THRESHOLD) {
    sentiment = 'Positive'
  } else if (compound <= NEGATIVE_THRESHOLD) {
    sentiment = 'Negative'
  }

  const confidence = Math.min(1, Math.abs(compound))

  return { sentiment, confidence, score: compound }
}

export function categorizeCustomer(sentiment) {
  switch (sentiment) {
    case 'Positive':
      return 'Happy Customer'
    case 'Negative':
      return 'At-Risk Customer'
    default:
      return 'Passive Customer'
  }
}