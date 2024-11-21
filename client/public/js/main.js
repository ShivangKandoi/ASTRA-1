document.addEventListener('DOMContentLoaded', () => {
    const consoleOutput = document.getElementById('consoleOutput');
    const userInput = document.getElementById('userInput');
    const generateBtn = document.getElementById('generateBtn');
    const chatMessages = document.getElementById('chat-messages');
    const componentBtn = document.getElementById('componentBtn');
    const fullProjectBtn = document.getElementById('fullProjectBtn');
    const runCodeBtn = document.getElementById('runCode');
    const saveCodeBtn = document.getElementById('saveCode');

    let generationType = 'component';

    // Add initial greeting
    addMessage('ai', 'Hello! I\'m your AI coding assistant. I can help you write, understand, and improve code. What would you like to create?');

    // Console output handling
    const console = {
        log: (...args) => {
            const output = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            appendToConsole(output, 'log');
        },
        error: (...args) => {
            const output = args.map(arg => {
                if (arg instanceof Error) {
                    return `${arg.name}: ${arg.message}\n${arg.stack}`;
                }
                return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
            }).join(' ');
            appendToConsole(output, 'error');
        },
        warn: (...args) => {
            const output = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            appendToConsole(output, 'warning');
        }
    };

    function appendToConsole(text, type = 'log') {
        const line = document.createElement('div');
        switch(type) {
            case 'error':
                line.className = 'console-line error';
                text = `🔴 ${text}`;
                break;
            case 'warning':
                line.className = 'console-line warning';
                text = `⚠️ ${text}`;
                break;
            default:
                line.className = 'console-line success';
                text = `✓ ${text}`;
        }
        line.textContent = text;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function clearConsole() {
        consoleOutput.innerHTML = '';
    }

    // Save code with feedback
    saveCodeBtn.addEventListener('click', () => {
        if (window.currentFile && window.monacoEditor) {
            const content = window.monacoEditor.getValue();
            window.currentFile.content = content;
            window.fileExplorer.updateFileContent(window.currentFile.id, content);
            addMessage('ai', `I've saved your changes to ${window.currentFile.name}. Is there anything else you'd like me to help you with?`);
        } else {
            addMessage('ai', 'Please create a new file first before saving. Would you like me to help you create one?');
        }
    });

    // Run code with feedback
    runCodeBtn.addEventListener('click', async () => {
        clearConsole();
        const code = window.monacoEditor ? window.monacoEditor.getValue() : '';
        
        if (!code.trim()) {
            console.warn('No code to execute');
            return;
        }

        console.log('Executing code...');
        
        try {
            // Extract dependencies from comments
            const dependencies = code.match(/\/\/ @requires (.+)/g)?.map(dep => 
                dep.replace('// @requires ', '').trim()
            ) || [];

            const response = await fetch('/api/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    language: window.currentFile?.type || 'javascript',
                    dependencies
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(data.output);
            } else {
                console.error('Execution error:', data.error);
            }
        } catch (error) {
            console.error('Error running code:', error);
        }
    });

    // Generate code with conversation
    generateBtn.addEventListener('click', async () => {
        const description = userInput.value.trim();
        if (!description) {
            addMessage('ai', 'Please describe what you\'d like me to create.');
            return;
        }

        addMessage('user', description);
        addMessage('ai', 'Generating code...');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description,
                    generationType,
                    filename: window.currentFile?.name || ''
                })
            });

            const data = await response.json();
            
            if (data.success) {
                window.monacoEditor.setValue(data.code);
                addMessage('ai', 'I\'ve generated the code based on your description. Would you like me to explain how it works or make any modifications?');
            } else {
                const errorMessage = data.error || 'Unknown error occurred';
                addMessage('ai', `I encountered an error while generating the code: ${errorMessage}. Would you like to try a different approach?`);
            }
        } catch (error) {
            addMessage('ai', `I apologize, but I encountered an error: ${error.message}. Would you like to try again or take a different approach?`);
        }

        userInput.value = '';
    });

    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        
        // Format code blocks in messages
        if (content.includes('```')) {
            const formattedContent = content.replace(/```([\s\S]*?)```/g, 
                (match, code) => `<pre class="code-block">${code.trim()}</pre>`);
            messageDiv.innerHTML = formattedContent;
        } else {
            messageDiv.textContent = content;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Component/Project toggle with feedback
    componentBtn.addEventListener('click', () => {
        generationType = 'component';
        componentBtn.classList.add('bg-blue-600');
        fullProjectBtn.classList.remove('bg-blue-600');
        addMessage('ai', 'I\'ll help you create a component. What would you like to build?');
    });

    fullProjectBtn.addEventListener('click', () => {
        generationType = 'project';
        fullProjectBtn.classList.add('bg-blue-600');
        componentBtn.classList.remove('bg-blue-600');
        addMessage('ai', 'I\'ll help you create a full project. What kind of project would you like to build?');
    });

    // Copy code with feedback
    document.getElementById('copyCode').addEventListener('click', () => {
        const code = window.monacoEditor ? window.monacoEditor.getValue() : '';
        navigator.clipboard.writeText(code);
        addMessage('ai', 'I\'ve copied the code to your clipboard. Is there anything else you\'d like me to help you with?');
    });

    // Download code with feedback
    document.getElementById('downloadCode').addEventListener('click', () => {
        const code = window.monacoEditor ? window.monacoEditor.getValue() : '';
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = window.currentFile?.name || 'generated-code.txt';
        a.click();
        URL.revokeObjectURL(url);
        addMessage('ai', `I've prepared your code for download as ${a.download}. Would you like to make any changes before working with it?`);
    });

    // Clear console with feedback
    document.getElementById('clearConsole').addEventListener('click', () => {
        clearConsole();
        addMessage('ai', 'I\'ve cleared the console output for you. Ready for the next task!');
    });

    // Handle user input with Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateBtn.click();
        }
    });
}); 