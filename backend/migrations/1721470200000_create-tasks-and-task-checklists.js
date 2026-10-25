exports.up = (pgm) => {
  pgm.createTable('tasks', {
    id: 'id',
    company_id: {
      type: 'integer',
      notNull: true,
      references: 'companies',
      onDelete: 'cascade',
    },
    // Modül 1 merge edilene kadar foreign key tanımlanmadı.
    // project_id: { type: 'integer', notNull: true, references: 'projects', onDelete: 'cascade' },
    project_id: { type: 'integer' },
    // stage_id: { type: 'integer', notNull: true, references: 'board_stages', onDelete: 'set null' },
    stage_id: { type: 'integer' },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    priority: { type: 'varchar(20)', notNull: true, default: 'medium' },
    due_date: { type: 'date' },
    assigned_user_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'set null',
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('tasks', ['company_id', 'project_id']);
  pgm.createIndex('tasks', ['company_id', 'stage_id']);

  pgm.createTable('task_checklists', {
    id: 'id',
    company_id: {
      type: 'integer',
      notNull: true,
      references: 'companies',
      onDelete: 'cascade',
    },
    task_id: {
      type: 'integer',
      notNull: true,
      references: 'tasks',
      onDelete: 'cascade',
    },
    title: { type: 'varchar(255)', notNull: true },
    order: { type: 'integer', notNull: true, default: 0 },
    is_completed: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('task_checklists', ['company_id', 'task_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('task_checklists');
  pgm.dropTable('tasks');
};
