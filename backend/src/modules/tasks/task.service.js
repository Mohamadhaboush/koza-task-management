const pool = require('../../config/db');
const { buildPagination, buildSort, buildMeta } = require('../../utils/pagination');
const { createActivityLog, ACTION_TYPES } = require('../activity-logs/service');

const ALLOWED_SORT_COLUMNS = ['title', 'priority', 'due_date', 'created_at'];

// Kullanıcının bu şirkette var olduğunu doğrular ve kullanıcı bilgisini döndürür.
// Dönen nesne activity log description'ında kullanılır: { id, email }
async function ensureAssignedUser(companyId, assignedUserId) {
  if (assignedUserId === undefined || assignedUserId === null) return null;

  const result = await pool.query(
    'SELECT id, email FROM users WHERE company_id = $1 AND id = $2',
    [companyId, assignedUserId]
  );

  if (!result.rows[0]) {
    const err = new Error('Atanan kullanıcı bu şirkette bulunamadı');
    err.status = 400;
    throw err;
  }

  return result.rows[0];
}

// Arşivlenmiş bir projeye görev veya checklist eklenemez.
// projectId null ise kontrol yapılmaz (projeye bağlı olmayan görevler için).
async function ensureProjectNotArchived(companyId, projectId) {
  if (!projectId) return;

  const result = await pool.query(
    'SELECT is_archived FROM projects WHERE id = $1 AND company_id = $2',
    [projectId, companyId]
  );

  if (!result.rows[0]) {
    const err = new Error('Proje bulunamadı');
    err.status = 404;
    throw err;
  }

  if (result.rows[0].is_archived) {
    const err = new Error('Arşivlenmiş bir projeye görev eklenemez');
    err.status = 400;
    throw err;
  }
}

async function listTasks(companyId, filters) {
  const { page, limit, offset } = buildPagination(filters);
  const orderBy = buildSort(filters, ALLOWED_SORT_COLUMNS, 'created_at:desc');
  const where = ['company_id = $1'];
  const params = [companyId];

  if (filters.projectId !== undefined) { params.push(filters.projectId); where.push(`project_id = $${params.length}`); }
  if (filters.stageId !== undefined) { params.push(filters.stageId); where.push(`stage_id = $${params.length}`); }
  if (filters.assignedUserId !== undefined) { params.push(filters.assignedUserId); where.push(`assigned_user_id = $${params.length}`); }
  if (filters.priority !== undefined) { params.push(filters.priority); where.push(`priority = $${params.length}`); }
  if (filters.dueAfter) { params.push(filters.dueAfter); where.push(`due_date >= $${params.length}`); }
  if (filters.dueBefore) { params.push(filters.dueBefore); where.push(`due_date <= $${params.length}`); }
  if (filters.search) { params.push(`%${filters.search}%`); where.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`); }

  const whereClause = where.join(' AND ');
  const dataResult = await pool.query(
    `SELECT * FROM tasks WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const countResult = await pool.query(`SELECT COUNT(*) FROM tasks WHERE ${whereClause}`, params);
  const total = Number.parseInt(countResult.rows[0].count, 10);

  return { data: dataResult.rows, meta: buildMeta(total, page, limit) };
}

async function getTaskById(companyId, id) {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE company_id = $1 AND id = $2',
    [companyId, id]
  );
  return result.rows[0];
}

// Görevi oluşturur ve otomatik olarak 'task_created' activity log'u üretir.
// Arşivlenmiş bir projeye görev eklenemez.
async function createTask(companyId, userId, payload) {
  // Önce projenin arşivlenmemiş olduğunu doğrula
  await ensureProjectNotArchived(companyId, payload.projectId);
  await ensureAssignedUser(companyId, payload.assignedUserId);

  const result = await pool.query(
    `INSERT INTO tasks
      (company_id, project_id, stage_id, title, description, priority, due_date, assigned_user_id)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'medium'), $7, $8)
     RETURNING *`,
    [companyId, payload.projectId ?? null, payload.stageId ?? null, payload.title, payload.description ?? null,
      payload.priority, payload.dueDate ?? null, payload.assignedUserId ?? null]
  );
  const task = result.rows[0];

  // --- OTOMATİK ACTİVİTY LOG: Görev oluşturuldu ---
  await createActivityLog(pool, {
    companyId,
    taskId: task.id,
    userId,
    actionType: ACTION_TYPES.TASK_CREATED,
    description: `"${task.title}" görevi oluşturuldu`,
  });

  return task;
}

// Görevi günceller. Güncellenen alanlara göre ilgili activity log'larını otomatik üretir:
//   - assignedUserId değiştiyse → 'assignee_changed'
//   - priority değiştiyse      → 'priority_changed'
//   - stageId değiştiyse       → 'stage_changed'
async function updateTask(companyId, id, userId, payload) {
  if (
    !Object.hasOwn(payload, 'title') &&
    !Object.hasOwn(payload, 'description') &&
    !Object.hasOwn(payload, 'priority') &&
    !Object.hasOwn(payload, 'dueDate') &&
    !Object.hasOwn(payload, 'stageId') &&
    !Object.hasOwn(payload, 'assignedUserId')
  ) {
    throw new Error('Güncellenecek en az bir alan gönderilmeli');
  }

  const currentTask = await getTaskById(companyId, id);
  if (!currentTask) return undefined;

  const task = {
    title: Object.hasOwn(payload, 'title') ? payload.title : currentTask.title,
    description: Object.hasOwn(payload, 'description')
      ? payload.description
      : currentTask.description,
    priority: Object.hasOwn(payload, 'priority')
      ? payload.priority
      : currentTask.priority,
    dueDate: Object.hasOwn(payload, 'dueDate')
      ? payload.dueDate
      : currentTask.due_date,
    stageId: Object.hasOwn(payload, 'stageId')
      ? payload.stageId
      : currentTask.stage_id,
    assignedUserId: Object.hasOwn(payload, 'assignedUserId')
      ? payload.assignedUserId
      : currentTask.assigned_user_id,
  };

  // Sorumlu değişiyorsa: kullanıcıyı doğrula ve bilgilerini al.
  // ensureAssignedUser hem doğrulama yapar hem de kullanıcı nesnesini döndürür;
  // böylece aşağıda activity log için tekrar sorgu yapmaya gerek kalmaz.
  let newAssigneeUser = null;
  if (Object.hasOwn(payload, 'assignedUserId') && payload.assignedUserId !== currentTask.assigned_user_id) {
    newAssigneeUser = await ensureAssignedUser(companyId, task.assignedUserId);
  }

  // Öncelik değişiyorsa: mevcut ve yeni değerleri şimdiden kaydet (update sonrası da erişilebilir).
  const priorityChanged =
    Object.hasOwn(payload, 'priority') && payload.priority !== currentTask.priority;
  const oldPriority = currentTask.priority;

  // Aşama değişiyorsa: eski ve yeni aşama adlarını önceden çek.
  let oldStageName = null;
  let newStageName = null;
  if (Object.hasOwn(payload, 'stageId') && payload.stageId !== currentTask.stage_id) {
    const stageResult = await pool.query(
      `SELECT id, name FROM board_stages
       WHERE company_id = $1 AND id = ANY($2::int[])
       ORDER BY id`,
      [companyId, [currentTask.stage_id, payload.stageId].filter(Boolean)]
    );
    const stageMap = Object.fromEntries(stageResult.rows.map((s) => [s.id, s.name]));
    oldStageName = currentTask.stage_id ? (stageMap[currentTask.stage_id] ?? `#${currentTask.stage_id}`) : 'Belirtilmemiş';
    newStageName = payload.stageId ? (stageMap[payload.stageId] ?? `#${payload.stageId}`) : 'Belirtilmemiş';
  }

  const result = await pool.query(
    `UPDATE tasks
     SET title = $2,
         description = $3,
         priority = $4,
         due_date = $5,
         stage_id = $6,
         assigned_user_id = $7
     WHERE company_id = $1 AND id = $8
     RETURNING *`,
    [
      companyId,
      task.title,
      task.description,
      task.priority,
      task.dueDate,
      task.stageId,
      task.assignedUserId,
      id,
    ]
  );
  const updatedTask = result.rows[0];

  // --- OTOMATİK ACTİVİTY LOGLAR ---
  // Her log bloğu yukarıda yapılan validasyonun sonucunu kullanır;
  // aynı kontrol iki kez yapılmaz.

  // Sorumlu değiştiyse → assignee_changed
  // Kullanıcı adı + email log'a yazılır; ID metadata olarak eklenir.
  if (newAssigneeUser !== null || (Object.hasOwn(payload, 'assignedUserId') && payload.assignedUserId !== currentTask.assigned_user_id)) {
    const assigneeLabel = newAssigneeUser
      ? `${newAssigneeUser.email} [#${newAssigneeUser.id}]`
      : 'kaldırıldı';
    await createActivityLog(pool, {
      companyId,
      taskId: updatedTask.id,
      userId,
      actionType: ACTION_TYPES.ASSIGNEE_CHANGED,
      description: `"${updatedTask.title}" görevinin sorumlusu değiştirildi → ${assigneeLabel}`,
    });
  }

  // Öncelik değiştiyse → priority_changed
  if (priorityChanged) {
    await createActivityLog(pool, {
      companyId,
      taskId: updatedTask.id,
      userId,
      actionType: ACTION_TYPES.PRIORITY_CHANGED,
      description: `"${updatedTask.title}" görevinin önceliği '${oldPriority}' → '${payload.priority}' olarak değiştirildi`,
    });
  }

  // Aşama değiştiyse → stage_changed
  if (oldStageName !== null) {
    await createActivityLog(pool, {
      companyId,
      taskId: updatedTask.id,
      userId,
      actionType: ACTION_TYPES.STAGE_CHANGED,
      description: `"${updatedTask.title}" görevi '${oldStageName}' aşamasından '${newStageName}' aşamasına taşındı`,
    });
  }

  return updatedTask;
}

async function deleteTask(companyId, id) {
  const result = await pool.query(
    'DELETE FROM tasks WHERE company_id = $1 AND id = $2 RETURNING id',
    [companyId, id]
  );
  return result.rows[0];
}

module.exports = { listTasks, getTaskById, createTask, updateTask, deleteTask };
