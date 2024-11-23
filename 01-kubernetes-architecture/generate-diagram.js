const { exec } = require('child_process');
const path = require('path');

// Install mmdc if not already installed
const installMermaid = () => {
    return new Promise((resolve, reject) => {
        exec('npm install -g @mermaid-js/mermaid-cli', (error, stdout, stderr) => {
            if (error) {
                console.error('Error installing mermaid-cli:', error);
                reject(error);
                return;
            }
            console.log('mermaid-cli installed successfully');
            resolve();
        });
    });
};

// Generate PNG from Mermaid file
const generateDiagram = () => {
    const inputFile = path.join(__dirname, 'architecture-diagram.mmd');
    const outputFile = path.join(__dirname, 'architecture-diagram.png');
    
    exec(`mmdc -i "${inputFile}" -o "${outputFile}" -b transparent`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error generating diagram:', error);
            return;
        }
        console.log('Diagram generated successfully');
    });
};

// Main execution
(async () => {
    try {
        await installMermaid();
        generateDiagram();
    } catch (error) {
        console.error('Failed to generate diagram:', error);
    }
})();
