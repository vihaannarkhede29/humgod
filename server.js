const https = require('https');
const fs = require('fs');
const path = require('path');

// Create a self-signed certificate for development
const { execSync } = require('child_process');

// Generate self-signed certificate if it doesn't exist
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log('Generating self-signed certificate...');
    try {
        execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`);
        console.log('Certificate generated successfully!');
    } catch (error) {
        console.error('Error generating certificate:', error.message);
        console.log('Please install OpenSSL or use: brew install openssl');
        process.exit(1);
    }
}

const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
};

const server = https.createServer(options, (req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'index.html');
    }
    
    const ext = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.ico': 'image/x-icon'
    }[ext] || 'text/plain';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 HumGod HTTPS Server running at https://localhost:${PORT}`);
    console.log('📱 Microphone access will now work!');
    console.log('⚠️  You may need to accept the self-signed certificate in your browser');
});

