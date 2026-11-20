import 'dotenv/config'
import express from 'express'
import OpenAI from 'openai'

const app = express()
const port = Number(process.env.PORT) || 3001
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

app.disable('x-powered-by')
app.use(express.json({ limit: '256kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', aiConfigured: client !== null })
})

app.post('/api/chat', async (request, response) => {
  const { messages } = request.body ?? {}

  if (
    !Array.isArray(messages)
    || messages.length === 0
    || messages.length > 40
    || messages.some((message) => (
      !message
      || !['user', 'assistant'].includes(message.role)
      || typeof message.content !== 'string'
      || message.content.trim().length === 0
      || message.content.length > 8000
    ))
  ) {
    response.status(400).json({ error: 'Send between 1 and 40 messages, each with a valid role and non-empty content under 8,000 characters.' })
    return
  }

  if (!client) {
    response.status(503).json({ error: 'The AI service is not configured. Add OPENAI_API_KEY to server/.env and restart the server.' })
    return
  }

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are Luma, a thoughtful, friendly assistant. Be clear, useful, and concise.',
        },
        ...messages.map(({ role, content }) => ({ role, content: content.trim() })),
      ],
      max_completion_tokens: 1200,
    })
    const answer = completion.choices[0]?.message?.content

    if (!answer) {
      response.status(502).json({ error: 'The AI service returned an empty response. Please try again.' })
      return
    }

    response.json({ message: answer })
  } catch (error) {
    console.error('OpenAI chat request failed:', error)
    response.status(502).json({ error: 'The AI service could not complete your request. Please try again.' })
  }
})

app.listen(port, () => {
  console.log(`Luma API listening on http://localhost:${port}`)
  if (!client) {
    console.warn('OPENAI_API_KEY is not set; chat requests will return a configuration error.')
  }
})
