// Configure Monaco Editor
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

let editor;

require(['vs/editor/editor.main'], function() {
    // Create Monaco editor instance
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: '',
        language: 'plaintext',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
            enabled: true
        },
        fontSize: 14,
        fontFamily: "'Consolas', 'Monaco', monospace",
        scrollBeyondLastLine: false,
        roundedSelection: false,
        renderLineHighlight: 'all',
        occurrencesHighlight: false,
        cursorStyle: 'line',
        cursorBlinking: 'blink',
        renderWhitespace: 'selection',
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on'
    });

    // Make editor instance globally available
    window.monacoEditor = editor;

    // Set up language detection
    window.setEditorLanguage = function(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const languageMap = {
            'py': 'python',
            'js': 'javascript',
            'html': 'html',
            'css': 'css',
            'c': 'c',
            'cpp': 'cpp',
            'java': 'java',
            'json': 'json',
            'md': 'markdown',
            'txt': 'plaintext'
        };
        const language = languageMap[ext] || 'plaintext';
        monaco.editor.setModelLanguage(editor.getModel(), language);
    };

    // Update editor content
    window.updateEditorContent = function(content, language) {
        editor.setValue(content || '');
        if (language) {
            monaco.editor.setModelLanguage(editor.getModel(), language);
        }
    };

    // Get editor content
    window.getEditorContent = function() {
        return editor.getValue();
    };
}); 