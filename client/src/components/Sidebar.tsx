import Icon from './Icon'
import type { Chat } from '../types'

type Props = {
  chats: Chat[]
  activeChatId: string
  isOpen: boolean
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onClose: () => void
}

export default function Sidebar({
  chats,
  activeChatId,
  isOpen,
  onNewChat,
  onSelectChat,
  onClose,
}: Props) {
  return (
    <>
      {isOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-top">
          <a className="brand" href="#" aria-label="Luma home" onClick={(event) => event.preventDefault()}>
            <span className="brand-mark"><Icon name="spark" size={19} /></span>
            <span>luma<span className="brand-period">.</span></span>
          </a>
          <button className="icon-button sidebar-collapse" aria-label="Close navigation" onClick={onClose}>
            <Icon name="panel" />
          </button>
        </div>

        <div className="sidebar-actions">
          <button className="new-chat-button" onClick={onNewChat}>
            <Icon name="plus" size={17} />
            <span>New chat</span>
            <kbd>⌘ K</kbd>
          </button>
          <button className="nav-link" onClick={() => document.getElementById('chat-input')?.focus()}>
            <Icon name="search" size={17} />
            <span>Search chats</span>
            <kbd>⌘ /</kbd>
          </button>
        </div>

        <div className="history">
          <div className="section-label">Your conversations</div>
          {chats.length === 0 ? (
            <p className="history-empty">Your recent chats will show up here.</p>
          ) : (
            <div className="chat-list">
              {chats.map((chat) => (
                <button
                  className={`chat-history-item${chat.id === activeChatId ? ' is-active' : ''}`}
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  title={chat.title}
                >
                  <Icon name="message" size={15} />
                  <span>{chat.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Icon name="spark" size={16} /></div>
            <strong>A little more magic</strong>
            <p>Explore what Luma can do for you.</p>
            <button type="button" className="upgrade-link">Explore plans <Icon name="arrow" size={13} /></button>
          </div>
          <button className="profile-button">
            <span className="profile-avatar">A</span>
            <span className="profile-copy"><strong>Alex Morgan</strong><small>Personal space</small></span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </aside>
    </>
  )
}
