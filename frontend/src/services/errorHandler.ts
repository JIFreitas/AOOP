import axios from 'axios';
import { Notification } from '../utils/notification';

export interface ApiError {
  type: string;
  message: string;
}

/**
 * Função melhorada para tratamento padronizado de erros da API
 */
export function handleApiError(error: any): ApiError {
  // Se for um erro do Axios
  if (axios.isAxiosError(error)) {
    // Verificar se existe uma resposta do servidor
    if (error.response) {
      const { data, status } = error.response;
      
      // Se o servidor retornou uma mensagem de erro estruturada
      if (data && data.message) {
        return {
          type: `error_${status}`,
          message: data.message
        };
      }
      
      // Caso não tenha uma mensagem específica, usar mensagens padrão baseadas no código de status
      switch (status) {
        case 400:
          return { type: 'error_400', message: 'Solicitação inválida. Verifique os dados enviados.' };
        case 401:
          return { type: 'error_401', message: 'Sessão expirada ou inválida. Por favor, faça login novamente.' };
        case 403:
          return { type: 'error_403', message: 'Acesso negado. Você não tem permissão para esta operação.' };
        case 404:
          return { type: 'error_404', message: 'Recurso não encontrado.' };
        case 422:
          return { type: 'error_422', message: 'Dados inválidos. Verifique as informações enviadas.' };
        case 429:
          return { type: 'error_429', message: 'Muitas requisições. Por favor, aguarde um momento e tente novamente.' };
        case 500:
          return { type: 'error_500', message: 'Erro no servidor. Por favor, tente novamente mais tarde.' };
        default:
          return { type: `error_${status}`, message: 'Ocorreu um erro inesperado. Por favor, tente novamente.' };
      }
    }
    
    // Erro de rede (sem resposta do servidor)
    if (error.request) {
      return {
        type: 'error_network',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.'
      };
    }
  }
  
  // Erro genérico ou não previsto
  return {
    type: 'error_unknown',
    message: error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'
  };
}

/**
 * Função que trata o erro e já exibe uma notificação
 */
export function handleAndNotifyError(error: any): ApiError {
  const apiError = handleApiError(error);
  Notification.error(apiError.message);
  return apiError;
}