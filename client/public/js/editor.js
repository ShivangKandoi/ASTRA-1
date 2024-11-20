class CodeEditor {
    constructor() {
        this.editor = null;
        this.initializeMonaco();
    }

    async initializeMonaco() {
        // Wait for Monaco to be loaded
        await new Promise((resolve) => {
            require(['vs/editor/editor.main'], () => {
                resolve();
            });
        });

        // Create editor instance
        this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: '// Start coding here...',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            scrollBeyondLastLine: false,
            roundedSelection: true,
            padding: { top: 10, bottom: 10 },
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            renderLineHighlight: 'all',
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
            formatOnType: true
        });

        // Set up event listeners after editor is initialized
        this.setupEventListeners();

        // Set up themes
        monaco.editor.defineTheme('vs-dark-custom', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#1e1e1e',
            }
        });
        monaco.editor.setTheme('vs-dark-custom');
    }

    setupEventListeners() {
        // Copy button
        document.getElementById('btn-copy').addEventListener('click', () => this.copyCode());
        
        // Download button
        document.getElementById('btn-download').addEventListener('click', () => this.downloadCode());
        
        // Save button
        document.getElementById('btn-save').addEventListener('click', () => this.saveProject());

        // Run button
        document.getElementById('btn-run').addEventListener('click', () => {
            // Show preview section
            document.querySelector('.preview-section').classList.add('active');
        });

        // Close preview button
        document.getElementById('btn-close-preview').addEventListener('click', () => {
            document.querySelector('.preview-section').classList.remove('active');
        });
    }

    // Get editor content
    getCode() {
        return this.editor ? this.editor.getValue() : '';
    }

    // Set editor content
    setCode(code) {
        if (this.editor) {
            // Detect language
            const language = this.detectLanguage(code);
            
            // Set language mode
            monaco.editor.setModelLanguage(this.editor.getModel(), language);
            
            // Set content
            this.editor.setValue(code);
            
            // Format document
            setTimeout(() => {
                this.editor.getAction('editor.action.formatDocument').run();
            }, 100);
        }
    }

    detectLanguage(code) {
        // Try to parse as JSON
        try {
            JSON.parse(code);
            return 'json';
        } catch (e) {
            // Not JSON, detect based on content
            if (code.includes('print(') || code.includes('def ') || code.includes('import ')) {
                return 'python';
            } else if (code.includes('<html') || code.includes('<div')) {
                return 'html';
            } else if (code.includes('{') && code.includes('}') && code.includes(';')) {
                if (code.includes('function') || code.includes('var') || code.includes('let')) {
                    return 'javascript';
                }
                return 'css';
            }
        }
        return 'plaintext';
    }

    // Copy code to clipboard
    async copyCode() {
        try {
            await navigator.clipboard.writeText(this.getCode());
            window.app.notifications.success('Code copied to clipboard!');
        } catch (error) {
            window.app.notifications.error('Failed to copy code');
        }
    }

    // Download code as file
    downloadCode() {
        const code = this.getCode();
        const language = this.detectLanguage(code);
        const extensions = {
            python: 'py',
            javascript: 'js',
            html: 'html',
            css: 'css',
            json: 'json',
            plaintext: 'txt'
        };
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `generated-code.${extensions[language]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Save project to database
    async saveProject() {
        if (!window.app.isAuthenticated()) {
            window.app.notifications.error('Please login to save projects');
            return;
        }

        try {
            const title = prompt('Enter project title:');
            if (!title) return;

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title,
                    description: document.getElementById('project-description').value,
                    code: this.getCode(),
                    type: document.querySelector('.option-button.active').dataset.type
                })
            });

            const data = await response.json();
            if (data.success) {
                window.app.notifications.success('Project saved successfully!');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            window.app.notifications.error(error.message);
        }
    }
}

// Initialize editor only after DOM and Monaco are fully loaded
window.onload = () => {
    require.config({
        paths: { 
            vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
        }
    });

    window.MonacoEnvironment = {
        getWorkerUrl: function(workerId, label) {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                self.MonacoEnvironment = {
                    baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/'
                };
                importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/base/worker/workerMain.js');
            `)}`;
        }
    };

    // Initialize editor
    window.codeEditor = new CodeEditor();
}; 