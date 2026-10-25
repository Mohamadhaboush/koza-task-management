const { body, param, query } = require('express-validator');

// URL'den gelen proje id bilgisini doğrular.
const projectIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Proje id pozitif bir tam sayı olmalıdır')
    .bail()
    .toInt(),
];

// GET /api/projects için query parametre kuralları.
const listProjectRules = [
  query('search')
    .optional()
    .isString()
    .withMessage('Arama metni metin olmalıdır')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Arama metni boş olamaz')
    .bail()
    .isLength({ max: 255 })
    .withMessage('Arama metni en fazla 255 karakter olabilir'),
  query('is_archived')
    .optional()
    .isBoolean()
    .withMessage('is_archived true veya false olmalıdır')
    .bail()
    .toBoolean(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page pozitif bir tam sayı olmalıdır')
    .bail()
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit 1 ile 100 arasında bir tam sayı olmalıdır')
    .bail()
    .toInt(),
  query('sort')
    .optional()
    .matches(/^(name|created_at):(asc|desc)$/)
    .withMessage('sort name:asc, name:desc, created_at:asc veya created_at:desc olmalıdır'),
];

// POST /api/projects — Proje oluşturma kuralları
const createProjectRules = [
  body('name')
    .isString()
    .withMessage('Proje adı metin olmalıdır')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Proje adı zorunludur')
    .bail()
    .isLength({ max: 255 })
    .withMessage('Proje adı en fazla 255 karakter olabilir'),
  body('description')
    .optional()
    .isString()
    .withMessage('Açıklama metin olmalıdır')
    .bail()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Açıklama en fazla 5000 karakter olabilir'),
];

// PUT /api/projects/:id — Proje güncelleme kuralları
const updateProjectRules = [
  body('name')
    .optional()
    .isString()
    .withMessage('Proje adı metin olmalıdır')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Proje adı boş olamaz')
    .bail()
    .isLength({ max: 255 })
    .withMessage('Proje adı en fazla 255 karakter olabilir'),
  body('description')
    .optional()
    .isString()
    .withMessage('Açıklama metin olmalıdır')
    .bail()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Açıklama en fazla 5000 karakter olabilir'),
];

module.exports = { projectIdRules, listProjectRules, createProjectRules, updateProjectRules };
