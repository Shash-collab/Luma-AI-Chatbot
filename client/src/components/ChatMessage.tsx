import Icon from './Icon'
import type { Message } from '../types'

export default function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant'

  return (
    <article className={`message message--${message.role}`}>
      {isAssistant ? (
        <span className="assistant-avatar"><Icon name="spark" size={17} /></span>
      ) : (
        <span className="user-avatar">A</span>
      )}
      <div className="message-content">
        <div className="message-author">{isAssistant ? 'Luma' : 'You'}</div>
        <p>{message.content}</p>
      </div>
    </article>
  )
}
