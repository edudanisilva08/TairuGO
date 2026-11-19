const express = require('express');
const cors = require('cors');
const poiRoutes = require('./routes/poiRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Healthcheck da API e Motor Espacial
app.get('/api/health', (_req, res) => {
  res.json({
    service: 'TairúGo Spatial Backend API - Peruíbe/SP',
    status: 'online',
    postgis: 'enabled',
    timestamp: new Date().toISOString(),
  });
});

// Rotas principais RESTful
app.use('/api', poiRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[TairúGo API] Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
