import axios, { AxiosError } from 'axios';

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  data?: any;
}

// Função para tratar erros da API de forma padronizada
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Erro de rede (sem resposta do servidor)
    if (!axiosError.response) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
      };
    }

    const statusCode = axiosError.response.status;
    const data = axiosError.response.data as any;
    const errorMessage = data?.message || axiosError.message || 'Ocorreu um erro na solicitação';

    // Mapeamento dos códigos HTTP para tipos de erro
    switch (statusCode) {
      case 401:
        return {
          type: ErrorType.UNAUTHORIZED,
          message: 'Acesso não autorizado. Por favor, faça login novamente.',
          statusCode,
          data
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: 'Recurso não encontrado.',
          statusCode,
          data
        };
      case 400:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: errorMessage,
          statusCode,
          data
        };
      case 422:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: errorMessage,
          statusCode,
          data
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER_ERROR,
          message: 'Erro no servidor. Por favor, tente novamente mais tarde.',
          statusCode,
          data
        };
      default:
        return {
          type: ErrorType.UNKNOWN_ERROR,
          message: errorMessage,
          statusCode,
          data
        };
    }
  }
  
  // Para erros que não são do Axios
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: error?.message || 'Ocorreu um erro inesperado',
  };
};

// Função simples para logar o erro no console
export const showErrorNotification = (error: ApiError): void => {
  console.error('API Error:', error);
};

// Função utilitária para tratar e exibir erros
export const handleAndNotifyError = (error: any): ApiError => {
  const processedError = handleApiError(error);
  showErrorNotification(processedError);
  return processedError;
};