const { body, param, query } = require('express-validator');

const idRule = (field) => param(field)
  .isInt({ min: 1 }).withMessage(`${field} pozitif bir sayı olmalı`)
  .toInt();

const contentRule = body('content')
  .isString().withMessage('Yorum metin olmalı')
  .bail()
  .trim()
  .notEmpty().withMessage('Yorum boş olamaz')
  .isLength({ max: 5000 }).withMessage('Yorum en fazla 5000 karakter olmalı');

const listCommentRules = [
  idRule('taskId'),
  query('page').optional().isInt({ min: 1 }).withMessage('page pozitif bir sayı olmalı').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit 1 ile 100 arasında olmalı').toInt(),
];

const createCommentRules = [idRule('taskId'), contentRule];

module.exports = { createCommentRules, listCommentRules };
