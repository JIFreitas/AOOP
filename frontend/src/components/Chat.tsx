import React, { useState, useRef, useEffect } from 'react';
import chatService from '../services/chatService';
import '../styles/Chat.css';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '🎬 Olá! Sou o assistente de filmes do MoviePlanet. Como posso ajudar-te hoje? Podes perguntar sobre recomendações, géneros, anos ou qualquer coisa relacionada com cinema!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Verificar status do chatbot ao carregar
    const checkChatbotStatus = async () => {
      try {
        await chatService.checkStatus();
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
        console.error('Chatbot offline:', error);
      }
    };

    checkChatbotStatus();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isOnline) return;

    if (!chatService.isValidMessage(inputMessage)) {
      alert('Mensagem inválida. Deve ter entre 1 e 1000 caracteres.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(inputMessage.trim());

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.resposta,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsOnline(true);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ ${chatService.getErrorMessage(error)}`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      // Se erro de conexão, marcar como offline
      if (error instanceof Error && error.message.includes('conectar')) {
        setIsOnline(false);
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Converter quebras de linha em <br>
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: '🎬 Chat limpo! Como posso ajudar-te agora?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="chat-container">      
    <div className="chat-header">
        <div className="chat-title">
          <i className="bi bi-robot me-2"></i>
          <span>Assistente de Filmes</span>
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
            <i className={`bi ${isOnline ? 'bi-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span className="status-text">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <button 
          className="btn btn-sm btn-outline-light"
          onClick={clearChat}
          title="Limpar conversa"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-avatar">
              {message.isUser ? (
                <i className="bi bi-person-circle"></i>
              ) : (
                <i className="bi bi-robot"></i>
              )}
            </div>
            <div className="message-content">
              <div className="message-text">
                {formatMessage(message.content)}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('pt-PT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <div className="message-avatar">
              <i className="bi bi-robot"></i>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-group">          
            <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder={isOnline ? "Pergunta sobre filmes..." : "Serviço temporariamente indisponível"}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !isOnline}
            maxLength={1000}
          />
          <button            className="btn btn-cosmic"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || !isOnline}
            title={!isOnline ? "Serviço offline" : "Enviar mensagem"}
          >
            {isLoading ? (
              <i className="bi bi-hourglass-split"></i>
            ) : (
              <i className="bi bi-send"></i>
            )}
          </button>
        </div>
        <div className="chat-help">
          💡 Experimente: "Recomenda-me um filme de ação" ou "Filmes dos anos 80"
        </div>
      </div>
    </div>
  );
};

export default Chat;
