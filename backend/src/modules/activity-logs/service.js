const pool = require('../../config/db');
const { buildMeta } = require('../../utils/pagination');


const ACTION_TYPES = {
  TASK_CREATED: 'task_created',
  ASSIGNEE_CHANGED: 'assignee_changed',
  PRIORITY_CHANGED: 'priority_changed',
  STAGE_CHANGED: 'stage_changed',
};




async function createActivityLog(clientOrPool, { companyId, taskId, userId, actionType, description }) {
  await clientOrPool.query(
    `INSERT INTO activity_logs (company_id, task_id, user_id, action_type, description)
     VALUES ($1, $2, $3, $4, $5)`,
    [companyId, taskId, userId, actionType, description]
  );
}


async function listActivityLogs(companyId, taskId, { page, limit, offset }) {
  // Önce görevin bu şirkete ait olduğunu doğrula
  const taskCheck = await pool.query(
    'SELECT id FROM tasks WHERE id = $1 AND company_id = $2',
    [taskId, companyId]
  );

  if (!taskCheck.rows[0]) {
    const err = new Error('Görev bulunamadı');
    err.status = 404;
    throw err;
  }

  // Logları en yeni önce (DESC) getir ve kullanıcı bilgisini JOIN ile ekle
  const dataResult = await pool.query(
    `SELECT
       al.id,
       al.task_id,
       al.action_type,
       al.description,
       al.created_at,
       al.user_id,
       u.email AS user_email
     FROM activity_logs al
     INNER JOIN users u ON u.id = al.user_id
     WHERE al.task_id = $1 AND al.company_id = $2
     ORDER BY al.created_at DESC
     LIMIT $3 OFFSET $4`,
    [taskId, companyId, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM activity_logs WHERE task_id = $1 AND company_id = $2',
    [taskId, companyId]
  );

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    data: dataResult.rows,
    meta: buildMeta(total, page, limit),
  };
}

module.exports = {
  ACTION_TYPES,
  createActivityLog,
  listActivityLogs,
};
