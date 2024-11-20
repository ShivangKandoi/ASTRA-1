class LoadingSpinner {
    constructor() {
        this.spinner = this.createSpinner();
        this.overlay = this.createOverlay();
    }

    createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        return spinner;
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.appendChild(this.spinner);
        return overlay;
    }

    show() {
        document.body.appendChild(this.overlay);
    }

    hide() {
        if (this.overlay.parentNode) {
            document.body.removeChild(this.overlay);
        }
    }
} 