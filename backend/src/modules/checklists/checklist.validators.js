const { body, param, query } = require('express-validator');

const taskIdRule = param('id')
  .isInt({ min: 1 }).withMessage('id pozitif bir sayı olmalı')
  .toInt();

const checklistIdRule = param('checklistId')
  .isInt({ min: 1 }).withMessage('checklistId pozitif bir sayı olmalı')
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

const orderRule = body('order')
  .optional()
  .isInt({ min: 0 }).withMessage('order sıfır veya pozitif bir sayı olmalı')
  .toInt();

const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page pozitif bir sayı olmalı')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit 1 ile 100 arasında olmalı')
    .toInt(),
];

const getChecklistRules = [taskIdRule, ...paginationRules];
const getOneChecklistRules = [taskIdRule, checklistIdRule];
const createChecklistRules = [taskIdRule, titleRule, orderRule];
const updateChecklistRules = [
  taskIdRule,
  checklistIdRule,
  optionalTitleRule,

  body('isCompleted').optional().isBoolean().withMessage('isCompleted boolean olmalı'),
  orderRule,
];
const deleteChecklistRules = [taskIdRule, checklistIdRule];

module.exports = {
  getChecklistRules,
  getOneChecklistRules,
  createChecklistRules,
  updateChecklistRules,
  deleteChecklistRules,
};
