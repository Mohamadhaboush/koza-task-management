const pool = require('../../config/db');
const { buildPagination, buildMeta } = require('../../utils/pagination');

async function getTaskById(companyId, taskId) {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE company_id = $1 AND id = $2',
    [companyId, taskId]
  );
  return result.rows[0];
}

async function isProjectArchived(companyId, projectId) {
  if (!projectId) return false;

  const result = await pool.query(
    'SELECT is_archived FROM projects WHERE company_id = $1 AND id = $2',
    [companyId, projectId]
  );

  return result.rows[0]?.is_archived === true;
}

async function createComment(companyId, userId, taskId, content) {
  const task = await getTaskById(companyId, taskId);
  if (!task) return undefined;

  if (await isProjectArchived(companyId, task.project_id)) {
    const err = new Error('Arşivlenmiş projeye ait göreve yorum eklenemez');
    err.status = 409;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO task_comments (company_id, task_id, user_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [companyId, taskId, userId, content]
  );
  return result.rows[0];
}

async function listComments(companyId, taskId, filters) {
  const task = await getTaskById(companyId, taskId);
  if (!task) return undefined;

  const { page, limit, offset } = buildPagination(filters);
  const params = [companyId, taskId];
  const dataResult = await pool.query(
    `SELECT *
     FROM task_comments
     WHERE task_comments.company_id = $1 AND task_comments.task_id = $2
     ORDER BY task_comments.created_at ASC, task_comments.id ASC
     LIMIT $3 OFFSET $4`,
    [...params, limit, offset]
  );
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM task_comments WHERE company_id = $1 AND task_id = $2',
    params
  );

  return {
    data: dataResult.rows,
    meta: buildMeta(Number.parseInt(countResult.rows[0].count, 10), page, limit),
  };
}

module.exports = { createComment, listComments };
