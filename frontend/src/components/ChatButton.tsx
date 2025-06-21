import React, { useState } from 'react';
import ChatModal from './ChatModal';
import '../styles/ChatButton.css';

interface ChatButtonProps {
  movieContext?: {
    title?: string;
    genre?: string;
    year?: number;
  };
  className?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ movieContext, className = '' }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <div 
        className={`chat-button-container ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button 
          className="chat-button"
          onClick={openChat}
          title="Assistente de Filmes"
          aria-label="Abrir chat do assistente de filmes"
        >
          <i className="bi bi-robot"></i>
          {isHovered && (
            <span className="chat-button-tooltip">
              🤖 Assistente de Filmes
            </span>
          )}
        </button>
      </div>

      <ChatModal
        isOpen={isChatOpen}
        onClose={closeChat}
        movieContext={movieContext}
      />
    </>
  );
};

export default ChatButton;
