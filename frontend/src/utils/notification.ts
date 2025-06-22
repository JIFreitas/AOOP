/**
 * Utilitário para exibir notificações na interface
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  maxWidth?: string;
}

/**
 * Exibe uma notificação na interface
 * 
 * @param message Texto da notificação
 * @param type Tipo da notificação (success, error, warning, info)
 * @param options Opções adicionais
 */
export function showNotification(
  message: string, 
  type: NotificationType = 'info', 
  options: NotificationOptions = {}
): void {
  // Configurações padrão
  const {
    duration = 5000,
    position = 'top',
    maxWidth = '400px'
  } = options;

  // Definir classes CSS e ícones com base no tipo
  let cssClass: string;
  let icon: string;

  switch (type) {
    case 'success':
      cssClass = 'alert-success';
      icon = 'bi-check-circle-fill';
      break;
    case 'error':
      cssClass = 'alert-danger';
      icon = 'bi-exclamation-triangle-fill';
      break;
    case 'warning':
      cssClass = 'alert-warning';
      icon = 'bi-exclamation-circle-fill';
      break;
    case 'info':
    default:
      cssClass = 'alert-info';
      icon = 'bi-info-circle-fill';
      break;
  }

  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = `alert ${cssClass} position-fixed start-50 translate-middle-x shadow-lg`;
  notification.style.zIndex = '9999';
  notification.style.maxWidth = maxWidth;
  
  // Posicionamento vertical
  if (position === 'top') {
    notification.style.top = '20px';
  } else {
    notification.style.bottom = '20px';
  }
  
  // Conteúdo da notificação
  notification.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi ${icon} me-2"></i>
      <span>${message}</span>
      <button type="button" class="btn-close ms-auto" aria-label="Fechar"></button>
    </div>
  `;
  
  // Adicionar evento para fechar ao clicar no botão
  const closeButton = notification.querySelector('.btn-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    });
  }
  
  // Adicionar ao corpo do documento
  document.body.appendChild(notification);
  
  // Remover após o tempo definido
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add('fade');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, duration);
}

// Atalhos para os diferentes tipos de notificações
export const Notification = {
  success: (message: string, options?: NotificationOptions) => 
    showNotification(message, 'success', options),
    
  error: (message: string, options?: NotificationOptions) => 
    showNotification(message, 'error', options),
    
  warning: (message: string, options?: NotificationOptions) => 
    showNotification(message, 'warning', options),
    
  info: (message: string, options?: NotificationOptions) => 
    showNotification(message, 'info', options)
};