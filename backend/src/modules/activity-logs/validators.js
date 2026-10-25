const { param, query } = require('express-validator');

// URL'den gelen görev id'sini doğrular.
const taskIdRules = [
  param('taskId')
    .isInt({ min: 1 })
    .withMessage('taskId pozitif bir tam sayı olmalıdır')
    .bail()
    .toInt(),
];

// Sayfalama için query parametre kuralları.
const listActivityLogRules = [
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
];

module.exports = { taskIdRules, listActivityLogRules };
