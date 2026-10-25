const pool = require('../../config/db');
const { buildPagination, buildMeta } = require('../../utils/pagination');

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function normalizeCompleted(value) {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw badRequest('isCompleted boolean olmalı');
}

async function listChecklists(companyId, taskId, filters) {
  const { page, limit, offset } = buildPagination(filters);
  const params = [companyId, taskId];
  const dataResult = await pool.query(
    `SELECT * FROM task_checklists
     WHERE company_id = $1 AND task_id = $2
     ORDER BY "order" ASC
     LIMIT $3 OFFSET $4`,
    [...params, limit, offset]
  );
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM task_checklists WHERE company_id = $1 AND task_id = $2',
    params
  );
  const total = Number.parseInt(countResult.rows[0].count, 10);

  return { data: dataResult.rows, meta: buildMeta(total, page, limit) };
}

async function getChecklistById(companyId, taskId, checklistId) {
  const result = await pool.query(
    'SELECT * FROM task_checklists WHERE company_id = $1 AND task_id = $2 AND id = $3',
    [companyId, taskId, checklistId]
  );
  return result.rows[0];
}

async function createChecklist(companyId, taskId, { title, order }) {
  // Görevi bul ve bağlı olduğu projenin arşivlenmediğini kontrol et.
  // Arşivlenmiş bir projenin görevi için checklist eklenemez.
  const task = await pool.query(
    'SELECT id, project_id FROM tasks WHERE company_id = $1 AND id = $2',
    [companyId, taskId]
  );
  if (!task.rows[0]) return undefined;

  if (task.rows[0].project_id) {
    const project = await pool.query(
      'SELECT is_archived FROM projects WHERE id = $1 AND company_id = $2',
      [task.rows[0].project_id, companyId]
    );
    if (project.rows[0]?.is_archived) {
      const err = new Error('Arşivlenmiş bir projenin görevine checklist eklenemez');
      err.status = 400;
      throw err;
    }
  }

  let checklistOrder = order;
  if (checklistOrder === undefined) {
    const lastChecklist = await pool.query(
      `SELECT "order" FROM task_checklists
       WHERE company_id = $1 AND task_id = $2
       ORDER BY "order" DESC
       LIMIT 1`,
      [companyId, taskId]
    );
    checklistOrder = lastChecklist.rows[0] ? lastChecklist.rows[0].order + 1 : 0;
  }

  const result = await pool.query(
    `INSERT INTO task_checklists (company_id, task_id, title, "order")
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [companyId, taskId, title, checklistOrder]
  );
  return result.rows[0];
}


async function updateChecklist(companyId, taskId, checklistId, payload) {
  if (
    !Object.hasOwn(payload, 'title') &&
    !Object.hasOwn(payload, 'isCompleted') &&
    !Object.hasOwn(payload, 'order')
  ) {
    throw new Error('Güncellenecek en az bir alan gönderilmeli');
  }

  const currentChecklist = await getChecklistById(companyId, taskId, checklistId);
  if (!currentChecklist) return undefined;

  const checklist = {
    title: Object.hasOwn(payload, 'title') ? payload.title : currentChecklist.title,
    isCompleted: Object.hasOwn(payload, 'isCompleted') ? normalizeCompleted(payload.isCompleted) : currentChecklist.is_completed,
    order: Object.hasOwn(payload, 'order') ? payload.order : currentChecklist.order,
  };

  const result = await pool.query(
    `UPDATE task_checklists
     SET title = $2,
         is_completed = $3,
         "order" = $4
     WHERE company_id = $1 AND task_id = $5 AND id = $6
     RETURNING *`,
    [
      companyId,
      checklist.title,
      checklist.isCompleted,
      checklist.order,
      taskId,
      checklistId,
    ]
  );

  return result.rows[0];
}

async function deleteChecklist(companyId, taskId, checklistId) {
  const result = await pool.query(
    'DELETE FROM task_checklists WHERE company_id = $1 AND task_id = $2 AND id = $3 RETURNING id',
    [companyId, taskId, checklistId]
  );
  return result.rows[0];
}

module.exports = { listChecklists, getChecklistById, createChecklist, updateChecklist, deleteChecklist };
