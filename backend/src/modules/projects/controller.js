const service = require('./service');
const { buildPagination } = require('../../utils/pagination');

// GET /api/projects
async function list(req, res, next) {
  try {
    const { page, limit, offset } = buildPagination(req.query);

    const result = await service.listProjects(req.user.companyId, {
      search: req.query.search,
      is_archived: req.query.is_archived,
      sort: req.query.sort,
      page,
      limit,
      offset,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:id
async function getOne(req, res, next) {
  try {
    const project = await service.getProjectById(req.user.companyId, req.params.id);
    if (!project) return res.status(404).json({ message: 'Proje bulunamadı' });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects
async function create(req, res, next) {
  try {
    const project = await service.createProject(req.user.companyId, req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

// PUT /api/projects/:id
async function update(req, res, next) {
  try {
    const project = await service.updateProject(req.user.companyId, req.params.id, req.body);
    if (!project) return res.status(404).json({ message: 'Proje bulunamadı' });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:id
async function remove(req, res, next) {
  try {
    const deleted = await service.deleteProject(req.user.companyId, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Proje bulunamadı' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// PATCH /api/projects/:id/archive
async function archive(req, res, next) {
  try {
    const project = await service.archiveProject(req.user.companyId, req.params.id);
    if (!project) return res.status(404).json({ message: 'Proje bulunamadı' });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove, archive };
