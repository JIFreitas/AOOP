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

export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (!axiosError.response) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Erro de ligação. Verifique a sua Internet e tente novamente.',
      };
    }

    const statusCode = axiosError.response.status;
    const data = axiosError.response.data as any;
    const errorMessage = data?.message || axiosError.message || 'Ocorreu um erro no pedido';

    switch (statusCode) {
      case 401:
        return {
          type: ErrorType.UNAUTHORIZED,
          message: 'Acesso não autorizado. Por favor, inicie sessão novamente.',
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
  
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: error?.message || 'Ocorreu um erro inesperado',
  };
};

export const showErrorNotification = (error: ApiError): void => {
  console.error('API Error:', error);
};

export const handleAndNotifyError = (error: any): ApiError => {
  const processedError = handleApiError(error);
  showErrorNotification(processedError);
  return processedError;
};