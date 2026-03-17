const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const routes = require('./src/routes/index');

const app = express();
const PORT = process.env.PORT || 2999;

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://assets.calendly.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["https://calendly.com"],
      connectSrc: ["'self'"],
    },
  },
}));

// Compression
app.use(compression());

// Static files
app.use(express.static(path.join(__dirname, 'src/public'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
}));

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).redirect('/');
});

app.listen(PORT, () => {
  console.log(`\n  ✓ PozziTech Landing rodando em http://localhost:${PORT}\n`);
});
