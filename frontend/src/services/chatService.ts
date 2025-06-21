const CHATBOT_API_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:3001';

export interface ChatMessage {
  mensagem: string;
}

export interface ChatResponse {
  resposta: string;
  timestamp?: string;
  status?: string;
  metadata?: {
    totalFilmes?: number;
    fonte?: string;
  };
}

export interface ChatError {
  erro: string;
  detalhes?: string;
  timestamp?: string;
  status?: string;
}

class ChatService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CHATBOT_API_URL;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensagem: message.trim()
        })
      });

      if (!response.ok) {
        const errorData: ChatError = await response.json().catch(() => ({
          erro: `Erro HTTP: ${response.status}`,
          timestamp: new Date().toISOString()
        }));
        
        throw new Error(errorData.erro || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no ChatService:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor do chatbot. Verifique se o serviço está em execução.');
      }
      
      throw error;
    }
  }

  async checkStatus(): Promise<{ status: string; service: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/chatbot/status`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status do chatbot:', error);
      throw new Error('Serviço de chatbot indisponível');
    }
  }

  isValidMessage(message: string): boolean {
    return message.trim().length > 0 && message.length <= 1000;
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Erro desconhecido ocorreu';
  }
}

export const chatService = new ChatService();
export default chatService;
