import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage, checkChatbotStatus } from '../services/api';
import '../styles/ChatModal.css';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieContext?: {
    title?: string;
    genre?: string;
    year?: number;
  };
}

// Lista completa de 50+ sugestões variadas
const allSuggestions = [
  // Recomendações por género
  'Que filme de ação me recomendas?',
  'Melhores comédias dos últimos anos?',
  'Filmes de terror clássicos?',
  'Que documentário devo ver?',
  'Dramas históricos imperdíveis?',
  'Filmes de ficção científica top?',
  'Aventuras familiares divertidas?',
  'Suspenses psicológicos intensos?',
  'Animações para adultos?',
  'Musicais emocionantes?',
  
  // Por popularidade/crítica
  'Top 10 filmes de sempre?',
  'Filmes mais vistos este ano?',
  'Clássicos que toda a gente devia ver?',
  'Melhores filmes dos últimos 5 anos?',
  'Filmes premiados com Óscares?',
  'Sucessos de bilheteira recentes?',
  'Filmes cult imperdíveis?',
  'Obras-primas do cinema mundial?',
  
  // Por humor e emoção
  'Filmes para rir muito?',
  'Dramas que fazem chorar?',
  'Filmes motivacionais inspiradores?',
  'Comédias inteligentes e espirituosas?',
  'Thrillers psicológicos intensos?',
  'Comédias românticas fogas?',
  'Filmes de guerra históricos?',
  
  // Por época/década
  'Clássicos dos anos 80?',
  'Melhores filmes dos anos 90?',
  'Filmes icônicos dos anos 2000?',
  'Lançamentos recentes imperdíveis?',
  'Filmes em preto e branco famosos?',
  'Sucessos dos anos 70?',
  'Cinema dos anos 60?',
  'Filmes modernos premiados?',
  
  // Por características específicas
  'Filmes com plot twists incríveis?',
  'Sequelas melhores que o original?',
  'Filmes baseados em livros?',
  'Biografias inspiradoras?',
  'Filmes com finais surpreendentes?',
  'Trilogias épicas completas?',
  'Filmes que mudaram o cinema?',
  'Obras-primas subestimadas?',
  
  // Por realizadores famosos
  'Filmes do Christopher Nolan?',
  'Clássicos do Steven Spielberg?',
  'Obras do Quentin Tarantino?',
  'Filmes do Martin Scorsese?',
  'Cinema do Tim Burton?',
  'Filmes da Greta Gerwig?',
  
  // Por atores
  'Melhores filmes do Leonardo DiCaprio?',
  'Clássicos com Meryl Streep?',
  'Filmes icônicos do Tom Hanks?',
  'Cinema com Denzel Washington?',
  'Obras com Johnny Depp?',
  
  // Específicos e curiosos
  'Filmes para uma noite romântica?',
  'Cinema asiático imperdível?',
  'Filmes europeus de arte?',
  'Documentários sobre música?',
  'Filmes de super-heróis únicos?',
  'Cinema noir clássico?',
  'Filmes de viagem no tempo?',
  'Histórias de vingança épicas?'
];

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, movieContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para obter 3 sugestões aleatórias
  const getRandomSuggestions = (suggestions: string[], count: number = 3) => {
    const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Sugestões de perguntas baseadas no contexto
  const getSuggestions = useCallback(() => {
    if (movieContext?.title) {
      const contextSuggestions = [
        `Filmes similares a ${movieContext.title}?`,
        'Que outros filmes tem este realizador?',
        'Recomenda-me algo do mesmo género',
        'Este filme tem sequela?',
        'Filmes do mesmo ano que este?',
        'Atores principais noutros filmes?'
      ];
      return getRandomSuggestions([...contextSuggestions, ...allSuggestions], 3);
    } else if (movieContext?.genre) {
      const genreSuggestions = [
        `Melhores filmes de ${movieContext.genre}?`,
        `Clássicos de ${movieContext.genre}?`,
        `${movieContext.genre} mais recentes?`,
        `${movieContext.genre} subestimados?`,
        `Top 5 de ${movieContext.genre}?`
      ];
      return getRandomSuggestions([...genreSuggestions, ...allSuggestions], 3);
    } else {
      return getRandomSuggestions(allSuggestions, 3);
    }
  }, [movieContext]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (isOpen) {
      let welcomeMessage = '🎬 Olá! Sou o assistente de filmes do MoviePlanet. Como posso ajudar-te hoje?';
      
      if (movieContext) {
        if (movieContext.title) {
          welcomeMessage = `🎬 Olá! Vi que estás a ver "${movieContext.title}". Posso ajudar-te com recomendações similares ou qualquer dúvida sobre filmes!`;
        } else if (movieContext.genre) {
          welcomeMessage = `🎬 Olá! Vi que estás a explorar filmes de ${movieContext.genre}. Posso recomendar-te alguns ótimos filmes deste género!`;
        }
      }

      setMessages([
        {
          id: '1',
          content: welcomeMessage,
          isUser: false,
          timestamp: new Date()
        }
      ]);

      // Gerar sugestões aleatórias para esta sessão
      setCurrentSuggestions(getSuggestions());

      // Verificar status do chatbot
      checkChatbotStatus().then(setIsOnline);
      
      // Focar no input após um pequeno delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, movieContext, getSuggestions]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isOnline) return;

    if (inputMessage.length > 1000) {
      alert('Mensagem muito longa (máximo 1000 caracteres).');
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
      const response = await sendChatMessage(inputMessage.trim());

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
        content: `❌ ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
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

  const handleModalClick = (e: React.MouseEvent) => {
    // Fechar modal se clicar no overlay
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={handleModalClick}>
      <div className="chat-modal">
        <div className="chat-modal-header">
          <div className="chat-header-info">
            <h3>🤖 Assistente de Filmes</h3>
            <div className={`chat-status ${isOnline ? 'online' : 'offline'}`}>
              <span className="status-indicator"></span>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                {message.isUser ? (
                  // Mensagens do utilizador: texto simples
                  message.content
                ) : (
                  // Mensagens do bot: renderizar HTML
                  <div dangerouslySetInnerHTML={{ __html: message.content }} />
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('pt-PT', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="message-content typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          {!isOnline && (
            <div className="chat-offline-warning">
              ⚠️ Chatbot offline. Verifica a ligação à internet.
            </div>
          )}
            {/* Sugestões de perguntas */}
          {!isLoading && isOnline && messages.length <= 1 && currentSuggestions.length > 0 && (
            <div className="chat-suggestions">
              <div className="suggestions-header">
                <div className="suggestions-title">💡 Sugestões:</div>
                <button 
                  className="refresh-suggestions-btn"
                  onClick={() => setCurrentSuggestions(getSuggestions())}
                  title="Gerar novas sugestões"
                >
                  🔄 Outras sugestões
                </button>
              </div>
              <div className="suggestions-list">
                {currentSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isOnline ? "Escreve a tua pergunta sobre filmes..." : "Chatbot offline"}
              disabled={isLoading || !isOnline}
              maxLength={1000}
              className="chat-input"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading || !isOnline}
              className="chat-send-btn"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
          <div className="chat-char-count">
            {inputMessage.length}/1000
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
