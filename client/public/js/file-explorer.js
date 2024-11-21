class FileExplorer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.files = [];
        this.currentFile = null;
        this.fileTypes = {
            '.py': 'python',
            '.js': 'javascript',
            '.html': 'html',
            '.css': 'css',
            '.c': 'c',
            '.cpp': 'cpp',
            '.java': 'java',
            '.json': 'json',
            '.md': 'markdown',
            '.txt': 'text'
        };
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `<div id="fileList" class="space-y-1"></div>`;
    }

    getFileIcon(fileName) {
        const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        const icons = {
            '.py': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_python.svg" class="file-icon" alt="Python">`,
            '.js': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_js.svg" class="file-icon" alt="JavaScript">`,
            '.html': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_html.svg" class="file-icon" alt="HTML">`,
            '.css': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_css.svg" class="file-icon" alt="CSS">`,
            '.c': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_c.svg" class="file-icon" alt="C">`,
            '.cpp': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_cpp.svg" class="file-icon" alt="C++">`,
            '.java': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_java.svg" class="file-icon" alt="Java">`,
            '.json': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_json.svg" class="file-icon" alt="JSON">`,
            '.md': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_markdown.svg" class="file-icon" alt="Markdown">`,
            '.txt': `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_text.svg" class="file-icon" alt="Text">`
        };
        return icons[ext] || `<img src="https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/default_file.svg" class="file-icon" alt="File">`;
    }

    getFileType(fileName) {
        const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return this.fileTypes[ext] || 'text';
    }

    setupEventListeners() {
        const newFileBtn = document.querySelector('.new-file-button');
        if (newFileBtn) {
            newFileBtn.addEventListener('click', () => {
                const fileName = prompt('Enter file name (include extension, e.g., main.py):');
                if (fileName) {
                    this.addFile(fileName);
                }
            });
        }
    }

    addFile(name) {
        const file = {
            name,
            content: '',
            id: Date.now().toString(),
            type: this.getFileType(name)
        };
        this.files.push(file);
        this.updateFileList();
        
        // Show editor when file is created
        document.getElementById('no-file-message').style.display = 'none';
        document.getElementById('editor-view').style.display = 'flex';
        
        this.selectFile(file.id);
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = this.files.map(file => `
            <div class="file-item ${this.currentFile?.id === file.id ? 'active' : ''}"
                 onclick="fileExplorer.selectFile('${file.id}')"
                 data-file-id="${file.id}"
                 data-type="${this.getFileType(file.name)}">
                ${this.getFileIcon(file.name)}
                <span class="file-name">${file.name}</span>
                <button class="delete-button" 
                        onclick="event.stopPropagation(); fileExplorer.deleteFile('${file.id}')">×</button>
            </div>
        `).join('');
    }

    selectFile(fileId) {
        // Save current file content before switching
        if (this.currentFile && window.monacoEditor) {
            this.currentFile.content = window.monacoEditor.getValue();
        }

        const file = this.files.find(f => f.id === fileId);
        if (file) {
            this.currentFile = file;
            this.updateFileList();
            
            // Show editor and hide no-file message
            document.getElementById('no-file-message').style.display = 'none';
            document.getElementById('editor-view').style.display = 'flex';
            
            // Update Monaco Editor
            if (window.updateEditorContent) {
                window.updateEditorContent(file.content, this.getFileType(file.name));
            }
            
            window.currentFile = file;
        }
    }

    updateFileContent(fileId, content) {
        const file = this.files.find(f => f.id === fileId);
        if (file) {
            file.content = content;
        }
    }

    deleteFile(fileId) {
        const index = this.files.findIndex(f => f.id === fileId);
        if (index !== -1) {
            this.files.splice(index, 1);
            if (this.currentFile?.id === fileId) {
                this.currentFile = this.files[0] || null;
                
                if (!this.currentFile) {
                    document.getElementById('no-file-message').style.display = 'flex';
                    document.getElementById('editor-view').style.display = 'none';
                    if (window.monacoEditor) {
                        window.monacoEditor.setValue('');
                    }
                } else {
                    this.selectFile(this.currentFile.id);
                }
            }
            this.updateFileList();
        }
    }
}

// Initialize file explorer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fileExplorer = new FileExplorer('file-explorer');
}); 