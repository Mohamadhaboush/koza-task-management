// Activity Logs tablosu: Görevler üzerinde gerçekleşen önemli değişiklikleri
// otomatik olarak kaydeder. Bu kayıtlar yalnızca sistem tarafından üretilir;
// kullanıcılar doğrudan kayıt ekleyemez veya değiştiremez.
//
// NOT: task_id sütunu şu an integer olarak tanımlanmıştır.
// tasks tablosu (Modül 2) master'a merge edildikten sonra ayrı bir migration ile
// FOREIGN KEY kısıtlaması eklenecektir.
//
// Tetiklendiği durumlar:
//   - Görev oluşturulduğunda          (action_type: 'task_created')
//   - Sorumlu atandığında/değiştirildiğinde (action_type: 'assignee_changed')
//   - Öncelik güncellendiğinde        (action_type: 'priority_changed')
//   - Aşama (stage) değiştirildiğinde (action_type: 'stage_changed')

exports.up = (pgm) => {
  pgm.createTable('activity_logs', {
    id: 'id',

    company_id: {
      type: 'integer',
      notNull: true,
      references: 'companies',
      onDelete: 'cascade',
    },

    // task_id: tasks tablosu henüz oluşturulmamış olabileceği için
    // REFERENCES olmadan integer olarak tanımlandı.
    // tasks modülü merge olunca FK kısıtlaması ayrı migration ile eklenecek.
    task_id: {
      type: 'integer',
      notNull: true,
    },

    // Değişikliği yapan kullanıcı
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'cascade',
    },

    // Eylemin makine tarafından okunabilir türü:
    // task_created | assignee_changed | priority_changed | stage_changed
    action_type: { type: 'varchar(100)', notNull: true },

    // İnsan tarafından okunabilir açıklama:
    // Örnek: "Ayşe, önceliği 'medium'dan 'high'a güncelledi"
    description: { type: 'text', notNull: true },

    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // task_id üzerine index: Bir görevin tüm loglarını hızlıca getirmek için.
  pgm.createIndex('activity_logs', 'task_id');

  // company_id üzerine index: Multitenancy sorgularını hızlandırmak için.
  pgm.createIndex('activity_logs', 'company_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('activity_logs', 'task_id');
  pgm.dropIndex('activity_logs', 'company_id');
  pgm.dropTable('activity_logs');
};

