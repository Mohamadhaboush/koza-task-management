exports.up = (pgm) => {
  // PROJECTS TABLOSU 
  // Şirketlerin sahip olduğu projeleri tutar
  // Her proje mutlaka bir şirkete (company_id) bağlıdır (multitenancy kuralı).
  pgm.createTable('projects', {
    id: 'id',
    company_id: {
      type: 'integer',
      notNull: true,
      references: 'companies',
      onDelete: 'cascade',
    },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    // is_archived: Projeyi silmeden kapatmak için kullanılır.
    // true olduğunda projeye yeni görev veya yorum eklenemez.
    is_archived: { type: 'boolean', notNull: true, default: false },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  //  BOARD_STAGES TABLOSU 
  // Projeye özgü Kanban sütunlarını tutar 
  // mesela "Yapılacaklar", "Devam Ediyor", "Tamamlandı"
  pgm.createTable('board_stages', {
    id: 'id',
    company_id: {
      type: 'integer',
      notNull: true,
      references: 'companies',
      onDelete: 'cascade',
    },
    project_id: {
      type: 'integer',
      notNull: true,
      references: 'projects',
      onDelete: 'cascade',
    },
    name: { type: 'varchar(100)', notNull: true },
    // order_no: Sütunların panodaki soldan sağa görünüm sırasını belirler.
    order_no: { type: 'integer', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Aynı proje içinde aynı sıra numarasından birden fazla sütun olamaz.
  pgm.addConstraint('board_stages', 'board_stages_project_order_unique', {
    unique: ['project_id', 'order_no'],
  });
};

exports.down = (pgm) => {
  // Geri alırken önce board_stages silinir (projects'e bağımlı olduğu için)
  pgm.dropTable('board_stages');
  pgm.dropTable('projects');
};
