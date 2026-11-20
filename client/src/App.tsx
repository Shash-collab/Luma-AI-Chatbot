import { useEffect, useRef, useState } from 'react'
import ChatComposer from './components/ChatComposer'
import ChatMessage from './components/ChatMessage'
import Icon from './components/Icon'
import Sidebar from './components/Sidebar'
import type { Chat, Message } from './types'

const initialChats: Chat[] = [
  {
    id: 'welcome',
    title: 'A little creative direction',
    messages: [
      {
        id: 'welcome-1',
        role: 'user',
        content: 'I want to make my mornings feel a little less rushed. Where should I start?',
      },
      {
        id: 'welcome-2',
        role: 'assistant',
        content:
          'Start with one small thing you can do the night before: set out your clothes, prep your coffee, or write down your top priority for tomorrow. The best routine is the one that feels easy enough to repeat.',
      },
    ],
  },
  { id: 'brand-notes', title: 'Notes for a new brand', messages: [] },
  { id: 'weekend-plans', title: 'A slower kind of weekend', messages: [] },
]

const ideas = [
  { icon: 'pen' as const, label: 'Help me write', prompt: 'Help me write a thoughtful note to a friend.' },
  { icon: 'globe' as const, label: 'Explore an idea', prompt: 'Help me explore an idea I have for a side project.' },
  { icon: 'code' as const, label: 'Make something', prompt: 'Help me make a simple personal website.' },
  { icon: 'spark' as const, label: 'Surprise me', prompt: 'Tell me something surprising and delightful.' },
]

export default function App() {
  const [chats, setChats] = useState(initialChats)
  const [activeChatId, setActiveChatId] = useState('welcome')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return window.localStorage.getItem('luma-theme') === 'dark' ? 'dark' : 'light'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingChatId, setPendingChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeChat = chats.find((chat) => chat.id === activeChatId)
  const messages = activeChat?.messages ?? []

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('luma-theme', theme)
  }, [theme])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, activeChatId])

  function startNewChat() {
    const id = `chat-${Date.now()}`
    setChats((current) => [{ id, title: 'New conversation', messages: [] }, ...current])
    setActiveChatId(id)
    setSidebarOpen(false)
  }

  async function sendMessage(text: string) {
    if (pendingChatId) return
    const chatId = activeChatId
    const previousMessages = chats.find((chat) => chat.id === chatId)?.messages ?? []
    const userMessage: Message = { id: `user-${crypto.randomUUID()}`, role: 'user', content: text }
    const conversation = [...previousMessages, userMessage]
    setChats((current) => {
      const exists = current.some((chat) => chat.id === chatId)
      const existingChat = current.find((chat) => chat.id === chatId)
      const nextChat: Chat = {
        id: chatId,
        title: existingChat?.messages.length
          ? existingChat.title
          : text.length > 30 ? `${text.slice(0, 30).trimEnd()}…` : text,
        messages: conversation,
      }
      return exists
        ? current.map((chat) => chat.id === chatId ? nextChat : chat)
        : [nextChat, ...current]
    })

    setPendingChatId(chatId)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversation.map(({ role, content }) => ({ role, content })),
        }),
      })
      const result = await response.json() as { message?: unknown; error?: unknown }
      if (!response.ok) {
        throw new Error(typeof result.error === 'string' ? result.error : 'The server could not complete your request.')
      }
      const answer = result.message
      if (typeof answer !== 'string' || !answer) {
        throw new Error('The server returned an invalid response.')
      }
      setChats((current) => current.map((chat) => (
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, { id: `assistant-${crypto.randomUUID()}`, role: 'assistant', content: answer }] }
          : chat
      )))
    } catch (error) {
      const content = error instanceof Error
        ? error.message
        : 'Unable to reach the chat server. Please try again.'
      setChats((current) => current.map((chat) => (
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, { id: `assistant-${crypto.randomUUID()}`, role: 'assistant', content }] }
          : chat
      )))
    } finally {
      setPendingChatId(null)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        isOpen={sidebarOpen}
        onNewChat={startNewChat}
        onSelectChat={(id) => {
          setActiveChatId(id)
          setSidebarOpen(false)
        }}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
              <Icon name="menu" />
            </button>
            <button className="workspace-picker">
              <span>Luma</span><span className="workspace-badge">Personal</span><Icon name="chevron" size={14} />
            </button>
          </div>
          <div className="topbar-right">
            <span className="status-indicator"><span className="status-dot" /> All systems normal</span>
            <button
              className="icon-button theme-toggle"
              onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
            </button>
            <button className="topbar-avatar" aria-label="Account">A</button>
          </div>
        </header>

        <section className="chat-area" aria-label="Chat">
          <div className={`conversation${messages.length ? ' conversation--has-messages' : ''}`}>
            {messages.length === 0 ? (
              <div className="welcome-panel">
                <div className="welcome-eyebrow"><span className="sparkle-mini"><Icon name="spark" size={15} /></span> YOUR THOUGHTFUL AI COMPANION</div>
                <h1>A little clarity<br /><span>goes a long way.</span></h1>
                <p className="welcome-description">A fresh space for your questions, big ideas, and everything in between.</p>
                <div className="idea-grid">
                  {ideas.map((idea) => (
                    <button className="idea-card" key={idea.label} onClick={() => sendMessage(idea.prompt)}>
                      <span className={`idea-icon idea-icon--${idea.icon}`}><Icon name={idea.icon} size={18} /></span>
                      <span>{idea.label}</span>
                      <Icon name="arrow" size={14} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="message-list">
                {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
                {pendingChatId === activeChatId && (
                  <div className="typing-indicator" role="status" aria-label="Luma is thinking">
                    <span className="assistant-avatar"><Icon name="spark" size={17} /></span>
                    <span><i /><i /><i /></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <ChatComposer onSend={sendMessage} disabled={pendingChatId !== null} />
        </section>
      </main>
    </div>
  )
}
