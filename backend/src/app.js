const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./modules/auth/routes'));
app.use('/api/tasks/:id/checklists', require('./modules/checklists/checklist.routes'));
app.use('/api/tasks/:taskId/comments', require('./modules/task-comments/routes'));
app.use('/api/tasks', require('./modules/tasks/routes'));

// Proje Yönetimi modülü
app.use('/api/projects', require('./modules/projects/routes'));

// Activity Logs modülü — Görev başına aktivite kaydı okuma (yalnızca GET)
// POST/PUT/DELETE yoktur; loglar yalnızca sistem tarafından üretilir.
app.use('/api/tasks/:taskId/activity-logs', require('./modules/activity-logs/routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Merkezi hata yönetimi en sonda olmalı
app.use(errorHandler);

module.exports = app;
