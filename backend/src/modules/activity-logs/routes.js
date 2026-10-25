const express = require('express');
const controller = require('./controller');
const { taskIdRules, listActivityLogRules } = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// GET /api/tasks/:taskId/activity-logs?page=1&limit=20
// Bir görevin aktivite kayıtlarını sayfalı olarak getirir.
//
// !!!  Bu modülde yalnızca GET endpoint'i mevcuttur. !!!
// Activity logları sistem tarafından otomatik üretilir.
// Kullanıcıların POST/PUT/DELETE yapmasına İZİN VERİLMEZ.
router.get(
  '/',
  taskIdRules,
  listActivityLogRules,
  handleValidationErrors,
  controller.list
);

module.exports = router;
