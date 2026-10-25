const pool = require('../../config/db');

// Projenin ilgili şirkete ait olduğunu doğrular.
// Böylece başka bir şirketin projesine ait aşamalara erişim engellenir.
async function assertProjectExists(companyId, projectId) {
  const result = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND company_id = $2',
    [projectId, companyId]
  );

  if (!result.rows[0]) {
    const err = new Error('Proje bulunamadı');
    err.status = 404;
    throw err;
  }
}

// Projenin pano aşamalarını sıralama numarasına göre listeler.
async function listStages(companyId, projectId) {
  await assertProjectExists(companyId, projectId);
  const result = await pool.query(
    'SELECT * FROM board_stages WHERE project_id = $1 AND company_id = $2 ORDER BY order_no ASC',
    [projectId, companyId]
  );
  return result.rows;
}

// Yeni pano aşaması oluşturur.
// order_no gönderilmezse aşama panonun en sonuna eklenir.
async function createStage(companyId, projectId, { name, order_no }) {
  await assertProjectExists(companyId, projectId);

  let finalOrderNo = order_no;
  if (finalOrderNo === undefined) {
    const maxResult = await pool.query(
      'SELECT COALESCE(MAX(order_no), 0) AS max_order FROM board_stages WHERE project_id = $1 AND company_id = $2',
      [projectId, companyId]
    );
    finalOrderNo = parseInt(maxResult.rows[0].max_order, 10) + 1;
  }

  const result = await pool.query(
    `INSERT INTO board_stages (company_id, project_id, name, order_no)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [companyId, projectId, name, finalOrderNo]
  );
  return result.rows[0];
}

// Pano aşamasını sadece ilgili proje ve şirket içinde siler.
async function deleteStage(companyId, projectId, stageId) {
  const result = await pool.query(
    'DELETE FROM board_stages WHERE id = $1 AND project_id = $2 AND company_id = $3 RETURNING id',
    [stageId, projectId, companyId]
  );
  return result.rows[0];
}

module.exports = { listStages, createStage, deleteStage };
