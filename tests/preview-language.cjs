// Local-only UI test server. Overrides are injected by this server, never by
// production HTML/JS. Only the one test preference is changed on this origin.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const presets = {pl: ['pl-PL', 'en-US'], en: ['en-GB'], 'en-pl': ['en-GB', 'pl-PL'], 'de-pl': ['de-DE', 'pl-PL'], ru: ['ru-RU']};
const types = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain'};
http.createServer((request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1:8772');
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.startsWith('.git')) { response.writeHead(403); response.end(); return; }
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    let content = fs.readFileSync(file);
    if (file.endsWith('.html') && url.searchParams.has('qa-language')) {
      const languages = presets[url.searchParams.get('qa-language')] || presets.en;
      const saved = url.searchParams.get('qa-choice');
      let injection = `Object.defineProperty(navigator,'languages',{value:${JSON.stringify(languages)}});Object.defineProperty(navigator,'language',{value:${JSON.stringify(languages[0])}});`;
      if (saved === 'reset') injection += "try{localStorage.removeItem('expiry.site-language.v1')}catch{};";
      if (saved === 'en' || saved === 'pl') injection += `try{localStorage.setItem('expiry.site-language.v1',${JSON.stringify(saved)})}catch{};`;
      if (url.searchParams.get('qa-block-storage') === '1') injection += "Object.defineProperty(window,'localStorage',{get(){throw new Error('Local QA: blocked storage')}});";
      content = Buffer.from(content.toString().replace('</head>', `<script>${injection}</script></head>`));
    }
    response.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    response.end(content);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(8772, '127.0.0.1', () => console.log('Language UI test server: http://127.0.0.1:8772/?qa-language=pl&qa-choice=reset'));
