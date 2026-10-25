const service = require('./service');

// GET /api/projects/:id/stages
async function list(req, res, next) {
  try {
    const stages = await service.listStages(req.user.companyId, req.params.id);
    res.json(stages);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:id/stages
async function create(req, res, next) {
  try {
    const stage = await service.createStage(req.user.companyId, req.params.id, req.body);
    res.status(201).json(stage);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:id/stages/:stageId
async function remove(req, res, next) {
  try {
    const deleted = await service.deleteStage(req.user.companyId, req.params.id, req.params.stageId);
    if (!deleted) return res.status(404).json({ message: 'Aşama bulunamadı' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
