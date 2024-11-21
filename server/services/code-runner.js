const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class CodeRunner {
    constructor() {
        this.tempDir = path.join(os.tmpdir(), 'astra-code-runner');
        this.runners = {
            'python': this.runPython.bind(this),
            'javascript': this.runJavaScript.bind(this),
            'java': this.runJava.bind(this),
            'cpp': this.runCpp.bind(this),
            'c': this.runC.bind(this)
        };
    }

    async init() {
        await fs.mkdir(this.tempDir, { recursive: true });
    }

    async runCode(code, language, dependencies = []) {
        const runner = this.runners[language];
        if (!runner) {
            throw new Error(`Language ${language} not supported`);
        }
        return await runner(code, dependencies);
    }

    async runPython(code, dependencies = []) {
        const fileName = path.join(this.tempDir, `temp_${Date.now()}.py`);
        await fs.writeFile(fileName, code);

        // Install dependencies if any
        if (dependencies.length > 0) {
            await new Promise((resolve, reject) => {
                const pip = spawn('pip', ['install', ...dependencies]);
                pip.stderr.on('data', data => console.error(`pip error: ${data}`));
                pip.on('close', code => code === 0 ? resolve() : reject());
            });
        }

        return new Promise((resolve, reject) => {
            const python = spawn('python', [fileName]);
            let output = '';
            let error = '';

            python.stdout.on('data', data => output += data);
            python.stderr.on('data', data => error += data);
            python.on('close', code => {
                fs.unlink(fileName).catch(console.error);
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(error);
                }
            });
        });
    }

    async runJavaScript(code, dependencies = []) {
        const fileName = path.join(this.tempDir, `temp_${Date.now()}.js`);
        
        // Create package.json if there are dependencies
        if (dependencies.length > 0) {
            const packageJson = {
                name: 'temp-project',
                dependencies: {}
            };
            
            for (const dep of dependencies) {
                await new Promise((resolve, reject) => {
                    const npm = spawn('npm', ['install', dep]);
                    npm.stderr.on('data', data => console.error(`npm error: ${data}`));
                    npm.on('close', code => code === 0 ? resolve() : reject());
                });
                packageJson.dependencies[dep] = '*';
            }
            
            await fs.writeFile(
                path.join(this.tempDir, 'package.json'),
                JSON.stringify(packageJson)
            );
        }

        await fs.writeFile(fileName, code);

        return new Promise((resolve, reject) => {
            const node = spawn('node', [fileName]);
            let output = '';
            let error = '';

            node.stdout.on('data', data => output += data);
            node.stderr.on('data', data => error += data);
            node.on('close', code => {
                fs.unlink(fileName).catch(console.error);
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(error);
                }
            });
        });
    }

    async runJava(code, dependencies = []) {
        const className = 'Main';
        const fileName = path.join(this.tempDir, `${className}.java`);
        await fs.writeFile(fileName, code);

        // Compile
        await new Promise((resolve, reject) => {
            const javac = spawn('javac', [fileName]);
            javac.stderr.on('data', data => console.error(`javac error: ${data}`));
            javac.on('close', code => code === 0 ? resolve() : reject());
        });

        // Run
        return new Promise((resolve, reject) => {
            const java = spawn('java', ['-cp', this.tempDir, className]);
            let output = '';
            let error = '';

            java.stdout.on('data', data => output += data);
            java.stderr.on('data', data => error += data);
            java.on('close', code => {
                fs.unlink(fileName).catch(console.error);
                fs.unlink(path.join(this.tempDir, `${className}.class`)).catch(console.error);
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(error);
                }
            });
        });
    }

    async runCpp(code, dependencies = []) {
        const fileName = path.join(this.tempDir, `temp_${Date.now()}.cpp`);
        const execName = path.join(this.tempDir, `temp_${Date.now()}.exe`);
        await fs.writeFile(fileName, code);

        // Compile
        await new Promise((resolve, reject) => {
            const gpp = spawn('g++', [fileName, '-o', execName]);
            gpp.stderr.on('data', data => console.error(`g++ error: ${data}`));
            gpp.on('close', code => code === 0 ? resolve() : reject());
        });

        // Run
        return new Promise((resolve, reject) => {
            const exe = spawn(execName);
            let output = '';
            let error = '';

            exe.stdout.on('data', data => output += data);
            exe.stderr.on('data', data => error += data);
            exe.on('close', code => {
                fs.unlink(fileName).catch(console.error);
                fs.unlink(execName).catch(console.error);
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(error);
                }
            });
        });
    }

    async runC(code, dependencies = []) {
        const fileName = path.join(this.tempDir, `temp_${Date.now()}.c`);
        const execName = path.join(this.tempDir, `temp_${Date.now()}.exe`);
        await fs.writeFile(fileName, code);

        // Compile
        await new Promise((resolve, reject) => {
            const gcc = spawn('gcc', [fileName, '-o', execName]);
            gcc.stderr.on('data', data => console.error(`gcc error: ${data}`));
            gcc.on('close', code => code === 0 ? resolve() : reject());
        });

        // Run
        return new Promise((resolve, reject) => {
            const exe = spawn(execName);
            let output = '';
            let error = '';

            exe.stdout.on('data', data => output += data);
            exe.stderr.on('data', data => error += data);
            exe.on('close', code => {
                fs.unlink(fileName).catch(console.error);
                fs.unlink(execName).catch(console.error);
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(error);
                }
            });
        });
    }
}

module.exports = new CodeRunner(); 