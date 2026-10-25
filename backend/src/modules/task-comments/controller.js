const commentService = require('./service');

async function create(req, res, next) {
  try {
    const comment = await commentService.createComment(
      req.user.companyId,
      req.user.id,
      req.params.taskId,
      req.body.content
    );
    if (!comment) return res.status(404).json({ message: 'Görev bulunamadı' });
    return res.status(201).json(comment);
  } catch (err) { return next(err); }
}

async function list(req, res, next) {
  try {
    const comments = await commentService.listComments(
      req.user.companyId,
      req.params.taskId,
      req.query
    );
    if (!comments) return res.status(404).json({ message: 'Görev bulunamadı' });
    return res.json(comments);
  } catch (err) { return next(err); }
}

module.exports = { create, list };
