const { body, param, query } = require('express-validator');

const idRule = (field) => param(field)
  .isInt({ min: 1 }).withMessage(`${field} pozitif bir sayı olmalı`)
  .toInt();

const optionalIdRule = (field) => body(field)
  .optional({ nullable: true })
  .isInt({ min: 1 }).withMessage(`${field} pozitif bir sayı olmalı`)
  .toInt();

const requiredIdRule = (field) => body(field)
  .isInt({ min: 1 }).withMessage(`${field} pozitif bir sayı olmalı`)
  .toInt();

const titleRule = body('title')
  .isString().withMessage('Başlık metin olmalı')
  .bail()
  .trim()
  .notEmpty().withMessage('Başlık boş olamaz')
  .isLength({ max: 255 }).withMessage('Başlık en fazla 255 karakter olmalı');

const optionalTitleRule = body('title')
  .optional()
  .isString().withMessage('Başlık metin olmalı')
  .bail()
  .trim()
  .notEmpty().withMessage('Başlık boş olamaz')
  .isLength({ max: 255 }).withMessage('Başlık en fazla 255 karakter olmalı');

const createTaskRules = [
  titleRule,
  body('description').optional({ nullable: true }).isString().withMessage('Açıklama metin olmalı'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('priority low, medium veya high olmalı'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate geçerli bir tarih olmalı'),
  requiredIdRule('projectId'),
  requiredIdRule('stageId'),
  optionalIdRule('assignedUserId'),
];

const updateTaskRules = [
  idRule('id'),
  optionalTitleRule,
  body('description').optional({ nullable: true }).isString().withMessage('Açıklama metin olmalı'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('priority low, medium veya high olmalı'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate geçerli bir tarih olmalı'),
  body('projectId').not().exists().withMessage('projectId güncellenemez'),
  optionalIdRule('stageId'),
  optionalIdRule('assignedUserId'),
];

const listTaskRules = [
  query('projectId').optional().isInt({ min: 1 }).toInt(),
  query('stageId').optional().isInt({ min: 1 }).toInt(),
  query('assignedUserId').optional().isInt({ min: 1 }).toInt(),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('priority low, medium veya high olmalı'),
  query('dueBefore').optional().isISO8601(),
  query('dueAfter').optional().isISO8601(),
  query('search').optional().isString().withMessage('search metin olmalı').bail().trim().isLength({ max: 255 }).withMessage('search en fazla 255 karakter olmalı'),
  query('sort').optional().matches(/^(title|priority|due_date|created_at):(asc|desc)$/i).withMessage('Geçersiz sort değeri').toLowerCase(),
  query('page').optional().isInt({ min: 1 }).withMessage('page pozitif bir sayı olmalı').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit 1 ile 100 arasında olmalı').toInt(),
];

const taskIdRules = [idRule('id')];


module.exports = { createTaskRules, updateTaskRules, listTaskRules, taskIdRules };
