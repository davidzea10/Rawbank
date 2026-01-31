require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const corsOptions = require('./config/cors');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const operateursRoutes = require('./routes/operateursRoutes');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', healthRoutes);
app.use('/api/operateurs', operateursRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/score', scoreRoutes);

// Frontend - backend/public (copie de frontend/dist)
const publicPath = path.join(__dirname, 'public');

if (require('fs').existsSync(publicPath)) {
  app.use(express.static(publicPath));
  // Route / pour servir le frontend
  app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
  // SPA fallback : autres routes frontend → index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ ok: false, message: 'Route API non trouvée' });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.send('<h1>RawFinance Pro</h1><p>Exécutez <code>npm run build</code> à la racine pour compiler le frontend.</p>');
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;
