class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.container.removeChild(notification);
        });

        // Add to container
        this.container.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
        }, duration);
    }

    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        this.show(message, 'error', duration);
    }

    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }

    warning(message, duration = 3500) {
        this.show(message, 'warning', duration);
    }
} 