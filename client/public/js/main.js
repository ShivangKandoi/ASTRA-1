class App {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupTheme();
        this.notifications = new NotificationSystem();
        this.loading = new LoadingSpinner();
    }

    initializeElements() {
        // Buttons
        this.themeToggle = document.getElementById('theme-toggle');
        this.startCodingBtn = document.getElementById('start-coding');
        this.generateBtn = document.querySelector('.btn-generate');
        
        // Sections
        this.homepage = document.getElementById('homepage');
        this.codingInterface = document.getElementById('coding-interface');
        this.mainInterface = document.getElementById('main-interface');
        
        // Forms
        this.generationForm = document.getElementById('generation-form');
        
        // Auth elements
        this.authButtons = document.getElementById('auth-buttons');
        this.userProfile = document.getElementById('user-profile');
        
        // Add modal elements
        this.loginModal = document.getElementById('login-modal');
        this.signupModal = document.getElementById('signup-modal');
        this.loginBtn = document.querySelector('.btn-login');
        this.signupBtn = document.querySelector('.btn-signup');
        this.modalCloseButtons = document.querySelectorAll('.modal-close');
        this.switchToSignup = document.getElementById('switch-to-signup');
        this.switchToLogin = document.getElementById('switch-to-login');

        // Chat messages container
        this.chatMessages = document.getElementById('chat-messages');
    }

    setupEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        if (this.startCodingBtn) {
            this.startCodingBtn.addEventListener('click', () => {
                this.homepage.style.display = 'none';
                this.codingInterface.classList.add('active');
                this.mainInterface.classList.remove('hidden');
            });
        }
        
        if (this.generationForm) {
            this.generationForm.addEventListener('submit', (e) => this.handleCodeGeneration(e));
        }
        
        // Modal event listeners
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.showModal('login'));
        }
        if (this.signupBtn) {
            this.signupBtn.addEventListener('click', () => this.showModal('signup'));
        }
        
        this.modalCloseButtons.forEach(button => {
            button.addEventListener('click', () => this.hideModals());
        });

        if (this.switchToSignup) {
            this.switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('signup');
            });
        }
        
        if (this.switchToLogin) {
            this.switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('login');
            });
        }

        // Form submissions
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModals();
            }
        });

        // Generation options buttons
        document.querySelectorAll('.option-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.option-button').forEach(btn => 
                    btn.classList.remove('active')
                );
                button.classList.add('active');
            });
        });

        // Handle textarea enter key
        const projectDescription = document.getElementById('project-description');
        if (projectDescription) {
            projectDescription.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.generationForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
    }

    async handleCodeGeneration(e) {
        e.preventDefault();
        
        const description = document.getElementById('project-description')?.value;
        const activeButton = document.querySelector('.option-button.active');
        
        if (!description) {
            this.notifications.error('Please enter a project description');
            return;
        }

        if (!activeButton) {
            this.notifications.error('Please select a generation type');
            return;
        }

        const generationType = activeButton.dataset.type;

        // Add user message to chat
        this.addChatMessage(description, 'user');

        this.loading.show();
        
        try {
            console.log('Sending request with:', { description, generationType });

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    description,
                    generationType
                })
            });
            
            const data = await response.json();
            console.log('Server response:', data);
            
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to generate code');
            }
            
            if (data.success && data.code) {
                // Add AI response to chat
                this.addChatMessage('Here\'s your generated code:', 'ai');
                
                if (window.codeEditor) {
                    // Handle different code response formats
                    if (typeof data.code === 'string') {
                        window.codeEditor.setCode(data.code);
                    } else if (data.code.code) {
                        // Component response
                        window.codeEditor.setCode(data.code.code);
                        if (data.code.language) {
                            window.codeEditor.setLanguage(data.code.language);
                        }
                    } else {
                        // Full project response
                        const formattedCode = JSON.stringify(data.code, null, 2);
                        window.codeEditor.setCode(formattedCode);
                    }
                } else {
                    console.error('Code editor not initialized');
                    throw new Error('Code editor not available');
                }
                
                this.notifications.success('Code generated successfully!');
            } else {
                throw new Error('Invalid response format from server');
            }
            
        } catch (error) {
            console.error('Error generating code:', error);
            this.notifications.error(error.message || 'Failed to generate code');
            this.addChatMessage('Sorry, I encountered an error while generating the code. Please try again.', 'ai');
        } finally {
            this.loading.hide();
            const projectDescription = document.getElementById('project-description');
            if (projectDescription) {
                projectDescription.value = '';
            }
        }
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    showModal(type) {
        this.hideModals();
        if (type === 'login') {
            this.loginModal.classList.remove('hidden');
            this.loginModal.classList.add('active');
        } else {
            this.signupModal.classList.remove('hidden');
            this.signupModal.classList.add('active');
        }
    }

    hideModals() {
        this.loginModal.classList.add('hidden');
        this.loginModal.classList.remove('active');
        this.signupModal.classList.add('hidden');
        this.signupModal.classList.remove('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                this.notifications.success('Logged in successfully!');
                this.hideModals();
                this.updateAuthUI(data.user);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.notifications.error(error.message);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (password !== confirmPassword) {
            this.notifications.error('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                this.notifications.success('Account created successfully!');
                this.hideModals();
                this.updateAuthUI(data.user);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.notifications.error(error.message);
        }
    }

    updateAuthUI(user) {
        if (user) {
            this.authButtons.classList.add('hidden');
            this.userProfile.classList.remove('hidden');
            document.getElementById('username').textContent = user.username;
        } else {
            this.authButtons.classList.remove('hidden');
            this.userProfile.classList.add('hidden');
            document.getElementById('username').textContent = '';
        }
    }

    addChatMessage(message, type = 'user') {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 