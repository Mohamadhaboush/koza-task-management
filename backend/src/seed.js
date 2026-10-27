const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seed() {
  const client = await pool.connect();
  try {
    // Tabloların var olup olmadığını kontrol et
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Tablolar henüz oluşturulmamış, seed atlanıyor.');
      return;
    }

    // Kullanıcı var mı kontrol et
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count, 10) > 0) {
      console.log('Veritabanında zaten veri var, seed işlemi atlandı.');
      return;
    }

    console.log('Demo verileri oluşturuluyor...');
    await client.query('BEGIN');

    // 1. Şirket oluştur
    const companyRes = await client.query(
      `INSERT INTO companies (name, slug) 
       VALUES ('Koza Tech', 'koza') 
       RETURNING id`
    );
    const companyId = companyRes.rows[0].id;

    // 2. Admin kullanıcı oluştur (Admin123!)
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const userRes = await client.query(
      `INSERT INTO users (company_id, email, password_hash, role) 
       VALUES ($1, 'admin@koza.com', $2, 'admin') 
       RETURNING id`,
      [companyId, passwordHash]
    );
    const userId = userRes.rows[0].id;

    // 3. Demo Proje oluştur
    const projectRes = await client.query(
      `INSERT INTO projects (company_id, name, description, is_archived) 
       VALUES ($1, 'Web Uygulama Geliştirme', 'Koza görev ve pano yönetim sistemi', false) 
       RETURNING id`,
      [companyId]
    );
    const projectId = projectRes.rows[0].id;

    // 4. Pano Aşamaları (Board Stages)
    const stage1 = await client.query(
      `INSERT INTO board_stages (company_id, project_id, name, order_no) VALUES ($1, $2, 'Yapılacaklar', 1) RETURNING id`,
      [companyId, projectId]
    );
    const stage2 = await client.query(
      `INSERT INTO board_stages (company_id, project_id, name, order_no) VALUES ($1, $2, 'Geliştirme', 2) RETURNING id`,
      [companyId, projectId]
    );
    const stage3 = await client.query(
      `INSERT INTO board_stages (company_id, project_id, name, order_no) VALUES ($1, $2, 'Test & İnceleme', 3) RETURNING id`,
      [companyId, projectId]
    );
    const stage4 = await client.query(
      `INSERT INTO board_stages (company_id, project_id, name, order_no) VALUES ($1, $2, 'Tamamlandı', 4) RETURNING id`,
      [companyId, projectId]
    );

    const s1Id = stage1.rows[0].id;
    const s2Id = stage2.rows[0].id;
    const s3Id = stage3.rows[0].id;
    const s4Id = stage4.rows[0].id;

    // 5. Görevler (Tasks)
    const task1 = await client.query(
      `INSERT INTO tasks (company_id, project_id, stage_id, title, description, priority, assigned_user_id)
       VALUES ($1, $2, $3, 'Kullanıcı Kimlik Doğrulama Modülü', 'JWT ve bcrypt ile multi-tenant auth mimarisi', 'high', $4)
       RETURNING id`,
      [companyId, projectId, s2Id, userId]
    );

    const task2 = await client.query(
      `INSERT INTO tasks (company_id, project_id, stage_id, title, description, priority, assigned_user_id)
       VALUES ($1, $2, $3, 'Kanban Kart Sürükleme ve Sıralama', 'Pano aşamaları arasında hızlı görev transferi', 'medium', $4)
       RETURNING id`,
      [companyId, projectId, s3Id, userId]
    );

    const task3 = await client.query(
      `INSERT INTO tasks (company_id, project_id, stage_id, title, description, priority)
       VALUES ($1, $2, $3, 'Mobil Arayüz & Responsive Uyum', 'Küçük ekranlar için sidebar ve modal iyileştirmesi', 'low')
       RETURNING id`,
      [companyId, projectId, s1Id]
    );

    const task4 = await client.query(
      `INSERT INTO tasks (company_id, project_id, stage_id, title, description, priority, assigned_user_id)
       VALUES ($1, $2, $3, 'Docker ve Compose Yapılandırması', 'Multi-container izole orkestrasyon ortamı', 'high', $4)
       RETURNING id`,
      [companyId, projectId, s4Id, userId]
    );

    const t1Id = task1.rows[0].id;

    // 6. Checklists
    await client.query(
      `INSERT INTO task_checklists (company_id, task_id, title, "order", is_completed)
       VALUES 
       ($1, $2, 'JWT token üretimi ve doğrulama middleware', 1, true),
       ($1, $2, 'Company slug bazlı kullanıcı eşleştirme', 2, true),
       ($1, $2, 'Şifre sıfırlama akışı testi', 3, false)`,
      [companyId, t1Id]
    );

    // 7. Activity Logs
    await client.query(
      `INSERT INTO activity_logs (company_id, task_id, user_id, action_type, description)
       VALUES 
       ($1, $2, $3, 'task_created', '"Kullanıcı Kimlik Doğrulama Modülü" görevi oluşturuldu'),
       ($1, $2, $3, 'stage_changed', '"Kullanıcı Kimlik Doğrulama Modülü" görevi ''Yapılacaklar'' aşamasından ''Geliştirme'' aşamasına taşındı')`,
      [companyId, t1Id, userId]
    );

    await client.query('COMMIT');
    console.log('✅ Demo verileri (Koza Tech) başarıyla oluşturuldu!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed hatası:', err.message);
  } finally {
    client.release();
  }
}

// Doğrudan çağrılırsa çalıştır ve çık
if (require.main === module) {
  seed().then(() => pool.end());
}

module.exports = seed;
