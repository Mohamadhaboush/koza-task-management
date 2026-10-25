const { body, param } = require('express-validator');

// URL'den gelen proje id bilgisini doğrular.
const projectIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Proje id pozitif bir tam sayı olmalıdır')
    .bail()
    .toInt(),
];

// URL'den gelen pano aşaması id bilgisini doğrular.
const stageIdRules = [
  param('stageId')
    .isInt({ min: 1 })
    .withMessage('Aşama id pozitif bir tam sayı olmalıdır')
    .bail()
    .toInt(),
];

// POST /api/projects/:id/stages için request body kuralları.
// bail(), bir kural başarısız olduğunda aynı alan için sonraki kontrolleri durdurur.
const createStageRules = [
  body('name')
    .isString()
    .withMessage('Aşama adı metin olmalıdır')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Aşama adı zorunludur')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Aşama adı en fazla 100 karakter olabilir'),
  body('order_no')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sıra numarası pozitif bir tam sayı olmalıdır')
    .bail()
    .toInt(),
];

module.exports = { projectIdRules, stageIdRules, createStageRules };
