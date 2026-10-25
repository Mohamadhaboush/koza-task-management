exports.up = (pgm) => {
  pgm.createTable('task_comments', {
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
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'cascade',
    },
    content: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('task_comments', ['company_id', 'task_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('task_comments');
};
