#!/usr/bin/env python3
import http.server
import ssl
import socketserver
import os
import subprocess
import sys

# Generate self-signed certificate if it doesn't exist
cert_file = 'cert.pem'
key_file = 'key.pem'

if not os.path.exists(cert_file) or not os.path.exists(key_file):
    print("Generating self-signed certificate...")
    try:
        # Generate private key
        subprocess.run([
            'openssl', 'genrsa', '-out', key_file, '2048'
        ], check=True, capture_output=True)
        
        # Generate certificate
        subprocess.run([
            'openssl', 'req', '-new', '-x509', '-key', key_file, '-out', cert_file, '-days', '365', '-subj',
            '/C=US/ST=State/L=City/O=Organization/CN=localhost'
        ], check=True, capture_output=True)
        
        print("Certificate generated successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error generating certificate: {e}")
        print("Please install OpenSSL: brew install openssl")
        sys.exit(1)
    except FileNotFoundError:
        print("OpenSSL not found. Please install it: brew install openssl")
        sys.exit(1)

PORT = 3000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    httpd.socket = ssl.wrap_socket(httpd.socket,
                                   certfile=cert_file,
                                   keyfile=key_file,
                                   server_side=True)
    print(f"🚀 HumGod HTTPS Server running at https://localhost:{PORT}")
    print("📱 Microphone access will now work!")
    print("⚠️  You may need to accept the self-signed certificate in your browser")
    print("   Click 'Advanced' -> 'Proceed to localhost (unsafe)' if prompted")
    httpd.serve_forever()

