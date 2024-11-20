class FileExplorer {
    constructor() {
        this.files = [];
        this.activeFile = null;
        this.fileList = document.getElementById('file-list');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // New file button
        document.getElementById('new-file').addEventListener('click', () => this.createNewFile());
        
        // File list click handler
        this.fileList.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                this.setActiveFile(fileItem.dataset.id);
            }
        });
    }

    createNewFile() {
        const fileName = prompt('Enter file name:');
        if (!fileName) return;

        const extension = this.getFileExtension(fileName);
        const file = {
            id: Date.now().toString(),
            name: fileName,
            content: '',
            language: this.getLanguageFromExtension(extension)
        };

        this.files.push(file);
        this.addFileToList(file);
        this.setActiveFile(file.id);
    }

    addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.id = file.id;
        fileItem.innerHTML = `
            <span class="file-icon">📄</span>
            <span class="file-name">${file.name}</span>
            <button class="file-delete">×</button>
        `;

        // Add delete handler
        const deleteBtn = fileItem.querySelector('.file-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteFile(file.id);
        });

        this.fileList.appendChild(fileItem);
    }

    setActiveFile(fileId) {
        // Remove active class from current file
        const currentActive = this.fileList.querySelector('.file-item.active');
        if (currentActive) {
            currentActive.classList.remove('active');
            // Save current content
            if (this.activeFile) {
                const currentFile = this.files.find(f => f.id === this.activeFile);
                if (currentFile) {
                    currentFile.content = window.codeEditor.getCode();
                }
            }
        }

        // Set new active file
        const newActive = this.fileList.querySelector(`[data-id="${fileId}"]`);
        if (newActive) {
            newActive.classList.add('active');
            this.activeFile = fileId;
            
            // Load content
            const file = this.files.find(f => f.id === fileId);
            if (file) {
                window.codeEditor.setCode(file.content);
                window.codeEditor.setLanguage(file.language);
            }
        }
    }

    deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.files = this.files.filter(f => f.id !== fileId);
            const fileItem = this.fileList.querySelector(`[data-id="${fileId}"]`);
            if (fileItem) {
                fileItem.remove();
            }
            
            // If active file was deleted, set first file as active
            if (this.activeFile === fileId) {
                const firstFile = this.files[0];
                if (firstFile) {
                    this.setActiveFile(firstFile.id);
                } else {
                    window.codeEditor.setCode('');
                    this.activeFile = null;
                }
            }
        }
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    getLanguageFromExtension(ext) {
        const languageMap = {
            'js': 'javascript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'txt': 'plaintext'
        };
        return languageMap[ext] || 'plaintext';
    }
}

// Initialize file explorer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fileExplorer = new FileExplorer();
}); 