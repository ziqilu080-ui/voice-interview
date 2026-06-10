#!/usr/bin/env python3
"""
语音面试官 - Python 版本地服务器
如果你没有安装 Node.js，用这个 Python 脚本启动服务器。

使用: python3 server.py
然后打开: http://localhost:3000
"""

import json
import http.server
import urllib.request
import urllib.error
import ssl
import os

PORT = int(os.environ.get('PORT', 3000))

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    """Serves static files AND proxies /api/messages to Anthropic API."""

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
            return
        # Serve static files
        super().do_GET()

    API_TARGETS = {
        '/api/anthropic': {
            'url': 'https://api.anthropic.com/v1/messages',
            'extra_headers': {'anthropic-version': '2023-06-01'},
            'auth_header': 'x-api-key',
        },
        '/api/deepseek': {
            'url': 'https://api.deepseek.com/v1/chat/completions',
            'extra_headers': {},
            'auth_header': 'Authorization',
            'auth_prefix': 'Bearer ',
        },
    }

    def do_POST(self):
        target = self.API_TARGETS.get(self.path)
        if target:
            self.proxy_to_api(target)
        else:
            self.send_response(404)
            self.end_headers()

    def proxy_to_api(self, target):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        api_key = self.headers.get('x-api-key', '')

        if not api_key:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': {'message': 'Missing x-api-key header'}
            }).encode())
            return

        try:
            headers = {
                'Content-Type': 'application/json',
                **target['extra_headers'],
            }
            # Add auth header
            prefix = target.get('auth_prefix', '')
            headers[target['auth_header']] = f'{prefix}{api_key}'

            req = urllib.request.Request(
                target['url'],
                data=body,
                headers=headers,
                method='POST',
            )

            ctx = ssl.create_default_context()

            with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
                response_body = resp.read()
                self.send_response(resp.status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(response_body)

        except urllib.error.HTTPError as e:
            error_body = e.read()
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(error_body)

        except Exception as e:
            self.send_response(502)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': {'message': f'Proxy error: {str(e)}'}
            }).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version')
        self.end_headers()


if __name__ == '__main__':
    import sys
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    server = http.server.HTTPServer(('0.0.0.0', PORT), ProxyHandler)
    print(f'\n  🎙️  语音面试官已启动！')
    print(f'  📍 打开浏览器访问: http://localhost:{PORT}')
    print(f'  🐍 使用 Python 服务器')
    print(f'  ⌨️  按 Ctrl+C 停止服务器\n')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  服务器已停止。👋\n')
        server.shutdown()
