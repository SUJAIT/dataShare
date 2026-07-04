const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const multer = require('multer');
const { Server } = require('socket.io');
const mime = require('mime-types');

const STORAGE_DIR = path.join(__dirname, '..', 'storage');

// Make sure storage folder exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function startServer(port = 3000) {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  // Serve the mobile upload page (plain HTML/CSS/JS, no app install needed)
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // express.static only auto-serves "index.html" for "/" - our page is
  // named upload.html, so we need this explicit route for the QR link
  // (http://<ip>:3000/) to actually open the upload page.
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'upload.html'));
  });

  // Serve already-received files so the dashboard can preview them
  app.use('/files-data', express.static(STORAGE_DIR));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, STORAGE_DIR),
    filename: (req, file, cb) => {
      // Prevent overwriting files with the same name
      const timestamp = Date.now();
      const safeName = `${timestamp}-${file.originalname}`;
      cb(null, safeName);
    }
  });

  const upload = multer({ storage });

  // Mobile uploads one or many files/folders here
  app.post('/upload', upload.array('files'), (req, res) => {
    const uploaded = req.files.map((file) => ({
      name: file.originalname,
      storedName: file.filename,
      size: file.size,
      type: mime.lookup(file.originalname) || 'application/octet-stream',
      url: `/files-data/${file.filename}`,
      receivedAt: new Date().toISOString()
    }));

    // Push each new file to the PC dashboard instantly
    uploaded.forEach((fileInfo) => io.emit('new-file', fileInfo));

    res.json({ success: true, files: uploaded });
  });

  // Dashboard can ask for the full list on startup
  app.get('/files', (req, res) => {
    const files = fs.readdirSync(STORAGE_DIR)
      .filter((storedName) => !storedName.startsWith('.'))
      .map((storedName) => {
      const stats = fs.statSync(path.join(STORAGE_DIR, storedName));
      const originalName = storedName.split('-').slice(1).join('-');
      return {
        name: originalName,
        storedName,
        size: stats.size,
        type: mime.lookup(originalName) || 'application/octet-stream',
        url: `/files-data/${storedName}`,
        receivedAt: stats.birthtime
      };
    });
    res.json(files);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`DataShare server running on port ${port}`);
  });

  return { app, server, io, STORAGE_DIR };
}

module.exports = { startServer, STORAGE_DIR };
