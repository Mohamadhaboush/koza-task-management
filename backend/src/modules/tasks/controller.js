const taskService = require('./task.service');

async function list(req, res, next) {
  try {
    const result = await taskService.listTasks(req.user.companyId, req.query);
    res.json(result);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.user.companyId, req.params.id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });
    res.json(task);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const task = await taskService.createTask(req.user.companyId, req.user.id, req.body);
    res.status(201).json(task);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const task = await taskService.updateTask(req.user.companyId, req.params.id, req.user.id, req.body);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });
    res.json(task);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const task = await taskService.deleteTask(req.user.companyId, req.params.id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove };
