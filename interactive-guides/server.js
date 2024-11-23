const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Handle command execution
app.post('/execute-command', (req, res) => {
    const { command } = req.body;
    
    // Execute command in Docker environment
    exec(command, { shell: true }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return res.status(500).send(stderr || error.message);
        }
        res.send(stdout || stderr);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
