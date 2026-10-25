const checklistService = require('./checklist.services');

async function list(req, res, next) {
  try {
    const result = await checklistService.listChecklists(
      req.user.companyId,
      req.params.id,
      req.query
    );
    res.json(result);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const checklist = await checklistService.getChecklistById(req.user.companyId, req.params.id, req.params.checklistId);
    if (!checklist) return res.status(404).json({ message: 'Checklist maddesi bulunamadı' });
    res.json(checklist);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const checklist = await checklistService.createChecklist(req.user.companyId, req.params.id, req.body);
    if (!checklist) return res.status(404).json({ message: 'Görev bulunamadı' });
    res.status(201).json(checklist);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const checklist = await checklistService.updateChecklist(req.user.companyId, req.params.id, req.params.checklistId, req.body);
    if (!checklist) return res.status(404).json({ message: 'Checklist maddesi bulunamadı' });
    res.json(checklist);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const checklist = await checklistService.deleteChecklist(req.user.companyId, req.params.id, req.params.checklistId);
    if (!checklist) return res.status(404).json({ message: 'Checklist maddesi bulunamadı' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove };
