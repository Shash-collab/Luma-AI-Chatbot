export type Message = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export type Chat = {
  id: string
  title: string
  messages: Message[]
}
