const pool = require('../../config/db');
const { buildSort, buildMeta } = require('../../utils/pagination');

// Sıralama için izin verilen kolonlar (SQL Injection'a karşı whitelist)
const ALLOWED_SORT_COLUMNS = ['name', 'created_at'];

// Şirketin projelerini listeler.
// ! her sorgu companyId ile filtrelenir (multitenancy kuralı).
async function listProjects(companyId, { search, is_archived, sort, page, limit, offset }) {
  const orderBy = buildSort({ sort }, ALLOWED_SORT_COLUMNS, 'created_at:desc');

  const filters = ['company_id = $1'];
  const params = [companyId];

  // Proje adı veya açıklamasında büyük/küçük harf duyarsız arama yapar.
  if (search !== undefined) {
    params.push(`%${search}%`);
    filters.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }

  // Arşiv durumuna göre filtreleme (true/false/undefined)
  if (is_archived !== undefined) {
    params.push(is_archived);
    filters.push(`is_archived = $${params.length}`);
  }

  const whereClause = filters.join(' AND ');

  const dataResult = await pool.query(
    `SELECT * FROM projects WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM projects WHERE ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count, 10);
  return { data: dataResult.rows, meta: buildMeta(total, page, limit) };
}

// Tekil proje getirir. companyId filtresi ile başka şirketin projesine erişim engellenir.
async function getProjectById(companyId, id) {
  const result = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  return result.rows[0];
}

// Yeni proje oluşturur.
async function createProject(companyId, { name, description }) {
  const result = await pool.query(
    `INSERT INTO projects (company_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [companyId, name, description || null]
  );
  return result.rows[0];
}

// Proje adını ve/veya açıklamasını günceller.
// Sadece değer gönderilen alanlar güncellenir.
async function updateProject(companyId, id, { name, description }) {
  // Sadece gönderilen alanları güncelle
  const fields = [];
  const params = [];

  if (name !== undefined) {
    params.push(name);
    fields.push(`name = $${params.length}`);
  }
  if (description !== undefined) {
    params.push(description);
    fields.push(`description = $${params.length}`);
  }

  if (fields.length === 0) {
    // Güncellenecek alan yoksa mevcut projeyi döndür
    return getProjectById(companyId, id);
  }

  params.push(id, companyId);
  const result = await pool.query(
    `UPDATE projects SET ${fields.join(', ')}
     WHERE id = $${params.length - 1} AND company_id = $${params.length}
     RETURNING *`,
    params
  );
  return result.rows[0];
}

// Projeyi tamamen siler.
// (Bağlı board_stages ve ileride eklenecek tasks de cascade ile silinir)
async function deleteProject(companyId, id) {
  const result = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND company_id = $2 RETURNING id',
    [id, companyId]
  );
  return result.rows[0];
}

// Projeyi arşivler (is_archived = true).
// Arşivlenen proje geçmiş verileriyle okunabilir kalır ama
// yeni görev/yorum eklenemez (bu kontrol görev/yorum servislerinde yapılır).
async function archiveProject(companyId, id) {
  const result = await pool.query(
    `UPDATE projects SET is_archived = true
     WHERE id = $1 AND company_id = $2
     RETURNING *`,
    [id, companyId]
  );
  return result.rows[0];
}

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
};
