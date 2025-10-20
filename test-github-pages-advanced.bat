@echo off
echo ========================================
echo   Advanced GitHub Pages Test Server
echo ========================================
echo.
echo Starting advanced local server with GitHub Pages simulation...
echo.

REM Create a simple Node.js server script
echo const http = require('http'); > temp-server.js
echo const fs = require('fs'); >> temp-server.js
echo const path = require('path'); >> temp-server.js
echo. >> temp-server.js
echo const mimeTypes = { >> temp-server.js
echo   '.html': 'text/html', >> temp-server.js
echo   '.css': 'text/css', >> temp-server.js
echo   '.js': 'application/javascript', >> temp-server.js
echo   '.json': 'application/json', >> temp-server.js
echo   '.png': 'image/png', >> temp-server.js
echo   '.jpg': 'image/jpeg', >> temp-server.js
echo   '.gif': 'image/gif', >> temp-server.js
echo   '.svg': 'image/svg+xml' >> temp-server.js
echo }; >> temp-server.js
echo. >> temp-server.js
echo const server = http.createServer((req, res) =^> { >> temp-server.js
echo   let filePath = '.' + req.url; >> temp-server.js
echo   if (filePath === './') filePath = './index.html'; >> temp-server.js
echo   if (filePath === './Blocky-Builder/') filePath = './Blocky-Builder/index.html'; >> temp-server.js
echo. >> temp-server.js
echo   const extname = path.extname(filePath).toLowerCase(); >> temp-server.js
echo   const contentType = mimeTypes[extname] || 'application/octet-stream'; >> temp-server.js
echo. >> temp-server.js
echo   fs.readFile(filePath, (error, content) =^> { >> temp-server.js
echo     if (error) { >> temp-server.js
echo       if (error.code === 'ENOENT') { >> temp-server.js
echo         res.writeHead(404, { 'Content-Type': 'text/html' }); >> temp-server.js
echo         res.end('<h1>404 File not found</h1><p>File: ' + filePath + '</p>'); >> temp-server.js
echo       } else { >> temp-server.js
echo         res.writeHead(500); >> temp-server.js
echo         res.end('Server Error: ' + error.code); >> temp-server.js
echo       } >> temp-server.js
echo     } else { >> temp-server.js
echo       res.writeHead(200, { 'Content-Type': contentType }); >> temp-server.js
echo       res.end(content, 'utf-8'); >> temp-server.js
echo     } >> temp-server.js
echo   }); >> temp-server.js
echo }); >> temp-server.js
echo. >> temp-server.js
echo const PORT = 8080; >> temp-server.js
echo server.listen(PORT, () =^> { >> temp-server.js
echo   console.log('GitHub Pages Test Server running at:'); >> temp-server.js
echo   console.log('  Main site: http://localhost:' + PORT + '/'); >> temp-server.js
echo   console.log('  Runes of Tir Na Nog: http://localhost:' + PORT + '/RunesOfTirNaNog/landing.html'); >> temp-server.js
echo   console.log('  Blocky Builder: http://localhost:' + PORT + '/Blocky-Builder/'); >> temp-server.js
echo   console.log('  Blocky Builder Direct: http://localhost:' + PORT + '/Blocky-Builder/public/index.html'); >> temp-server.js
echo   console.log(''); >> temp-server.js
echo   console.log('Press Ctrl+C to stop the server'); >> temp-server.js
echo }); >> temp-server.js

echo Starting advanced test server...
node temp-server.js

REM Clean up
del temp-server.js
