const service = require('./service');
const { buildPagination } = require('../../utils/pagination');

// GET /api/tasks/:taskId/activity-logs
// Bir görevin tüm aktivite kayıtlarını getirir.
async function list(req, res, next) {
  try {
    const { page, limit, offset } = buildPagination(req.query);

    const result = await service.listActivityLogs(
      req.user.companyId,
      req.params.taskId,
      { page, limit, offset }
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
