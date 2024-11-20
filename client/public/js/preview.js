class CodePreview {
    constructor() {
        this.iframe = document.getElementById('preview-iframe');
        this.consoleOutput = document.getElementById('console-content');
        this.setupPreviewEnvironment();
        this.setupEventListeners();
    }

    setupPreviewEnvironment() {
        this.resetPreview();
    }

    setupEventListeners() {
        document.getElementById('btn-run').addEventListener('click', () => this.runCode());
    }

    resetPreview() {
        // Reset iframe content with proper sandbox permissions
        this.iframe.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style id="preview-styles"></style>
                <script>
                    // Create a safe console wrapper
                    const consoleOutput = [];
                    const safeConsole = {
                        log: (...args) => {
                            consoleOutput.push(['log', args]);
                            window.parent.postMessage({ type: 'console', method: 'log', args }, '*');
                        },
                        error: (...args) => {
                            consoleOutput.push(['error', args]);
                            window.parent.postMessage({ type: 'console', method: 'error', args }, '*');
                        },
                        warn: (...args) => {
                            consoleOutput.push(['warn', args]);
                            window.parent.postMessage({ type: 'console', method: 'warn', args }, '*');
                        }
                    };
                    window.console = safeConsole;

                    // Handle runtime errors
                    window.onerror = (message, source, lineno, colno, error) => {
                        safeConsole.error(message);
                        return true;
                    };
                </script>
            </head>
            <body>
                <div id="preview-content"></div>
            </body>
            </html>
        `;

        // Clear console output
        this.consoleOutput.innerHTML = '';
    }

    async runCode() {
        this.resetPreview();
        const code = window.codeEditor.getCode();

        try {
            // Try to parse as JSON first
            let parsedCode;
            try {
                parsedCode = JSON.parse(code);
            } catch {
                // If not JSON, treat as raw code
                parsedCode = code;
            }

            // For Python code or simple string code
            if (typeof parsedCode === 'string') {
                // Display code output in console
                this.appendToConsole('log', 'Code Output:');
                this.appendToConsole('log', parsedCode);
                return;
            }

            // For web code (HTML, CSS, JS)
            const { html, css, javascript } = this.parseWebCode(parsedCode);
            
            // Get the iframe's document
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;

            // Create a new HTML document with all the code
            const fullHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>${javascript}</script>
                </body>
                </html>
            `;

            // Display in iframe
            iframeDoc.open();
            iframeDoc.write(fullHtml);
            iframeDoc.close();

        } catch (error) {
            this.appendToConsole('error', error.message);
        }
    }

    parseWebCode(code) {
        // If code is already in the correct format
        if (code.html !== undefined || code.css !== undefined || code.javascript !== undefined) {
            return {
                html: code.html || '',
                css: code.css || '',
                javascript: code.javascript || code.js || ''
            };
        }

        // If code is a single component
        if (code.code && code.language) {
            switch (code.language) {
                case 'html':
                    return { html: code.code, css: '', javascript: '' };
                case 'css':
                    return { html: '', css: code.code, javascript: '' };
                case 'javascript':
                    return { html: '', css: '', javascript: code.code };
                default:
                    return { html: '', css: '', javascript: '' };
            }
        }

        // Default empty response
        return { html: '', css: '', javascript: '' };
    }

    appendToConsole(type, ...args) {
        const line = document.createElement('div');
        line.className = `console-line console-${type}`;
        line.textContent = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }
}

// Handle console messages from iframe
window.addEventListener('message', (event) => {
    if (event.data.type === 'console') {
        window.preview.appendToConsole(event.data.method, ...event.data.args);
    }
});

// Initialize preview when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.preview = new CodePreview();
}); 