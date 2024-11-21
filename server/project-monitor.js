const fs = require('fs').promises;
const path = require('path');

class ProjectMonitor {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.requiredFiles = [
            'package.json',
            'server/server.js',
            'server/routes/generate.js',
            'server/services/grok_service.py',
            'client/public/index.html',
            'client/public/js/main.js',
            'client/public/js/file-explorer.js',
            'client/public/css/styles.css',
            '.env',
            'requirements.txt'
        ];
    }

    async checkProjectStructure() {
        const issues = [];

        // Check required files
        for (const file of this.requiredFiles) {
            try {
                await fs.access(path.join(this.projectRoot, file));
            } catch (error) {
                issues.push({
                    type: 'missing_file',
                    file: file,
                    message: `Required file ${file} is missing`
                });
            }
        }

        // Check package.json dependencies
        try {
            const packageJson = require(path.join(this.projectRoot, 'package.json'));
            const requiredDeps = ['express', 'cors', 'dotenv', 'python-shell', 'mongoose'];
            
            for (const dep of requiredDeps) {
                if (!packageJson.dependencies[dep]) {
                    issues.push({
                        type: 'missing_dependency',
                        dependency: dep,
                        message: `Required npm dependency ${dep} is missing`
                    });
                }
            }
        } catch (error) {
            issues.push({
                type: 'package_json_error',
                message: 'Error reading package.json',
                error: error.message
            });
        }

        // Check Python environment
        try {
            const requirements = await fs.readFile(path.join(this.projectRoot, 'requirements.txt'), 'utf8');
            const requiredPyDeps = ['requests', 'python-dotenv', 'pathlib'];
            
            for (const dep of requiredPyDeps) {
                if (!requirements.includes(dep)) {
                    issues.push({
                        type: 'missing_python_dependency',
                        dependency: dep,
                        message: `Required Python dependency ${dep} is missing`
                    });
                }
            }
        } catch (error) {
            issues.push({
                type: 'requirements_error',
                message: 'Error reading requirements.txt',
                error: error.message
            });
        }

        // Check environment variables
        try {
            const envContent = await fs.readFile(path.join(this.projectRoot, '.env'), 'utf8');
            const requiredEnvVars = ['PORT', 'MONGODB_URI', 'GROK_API_KEY', 'PYTHON_PATH'];
            
            for (const envVar of requiredEnvVars) {
                if (!envContent.includes(envVar + '=')) {
                    issues.push({
                        type: 'missing_env_var',
                        variable: envVar,
                        message: `Required environment variable ${envVar} is missing`
                    });
                }
            }
        } catch (error) {
            issues.push({
                type: 'env_error',
                message: 'Error reading .env file',
                error: error.message
            });
        }

        return issues;
    }

    async monitorProject() {
        const issues = await this.checkProjectStructure();
        if (issues.length > 0) {
            console.error('\n🔍 ASTRA-1 Project Issues:');
            issues.forEach(issue => {
                console.error(`\n❌ ${issue.type.toUpperCase()}:`);
                console.error(`   ${issue.message}`);
                if (issue.file) console.error(`   File: ${issue.file}`);
                if (issue.dependency) console.error(`   Dependency: ${issue.dependency}`);
                if (issue.variable) console.error(`   Variable: ${issue.variable}`);
                if (issue.error) console.error(`   Error: ${issue.error}`);
            });
            console.error('\n');
        } else {
            console.log('\n✅ ASTRA-1 Project structure is valid\n');
        }
    }
}

module.exports = ProjectMonitor; 