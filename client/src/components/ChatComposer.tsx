import { useState, type FormEvent, type KeyboardEvent } from 'react'
import Icon from './Icon'

type Props = {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatComposer({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={submit}>
        <textarea
          id="chat-input"
          aria-label="Message Luma"
          placeholder={disabled ? 'Luma is thinking...' : 'Ask anything...'}
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="composer-tools">
          <div className="composer-hints">
            <button type="button" className="tool-button" aria-label="Attach a file (coming soon)" title="File uploads coming soon">
              <Icon name="paperclip" size={17} />
            </button>
            <span className="tool-divider" />
            <span className="model-label"><span className="status-dot" /> Luma 1.0 <Icon name="chevron" size={13} /></span>
          </div>
          <button className="send-button" type="submit" disabled={!value.trim() || disabled} aria-label="Send message">
            <Icon name="send" size={16} />
          </button>
        </div>
      </form>
      <p className="composer-caption">Luma can make mistakes. Check important info.</p>
    </div>
  )
}
