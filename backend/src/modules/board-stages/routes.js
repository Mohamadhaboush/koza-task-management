const express = require('express');
const controller = require('./controller');
const { projectIdRules, stageIdRules, createStageRules } = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');

// project id bilgisini /api/projects/:id/stages yolundan alabilmek için mergeParams gerekir.
const router = express.Router({ mergeParams: true });

// GET /api/projects/:id/stages — Projeye ait tüm pano aşamalarını listeler.
router.get('/', projectIdRules, handleValidationErrors, controller.list);

// POST /api/projects/:id/stages — Projeye yeni pano aşaması ekler.
router.post('/', projectIdRules, createStageRules, handleValidationErrors, controller.create);

// DELETE /api/projects/:id/stages/:stageId — Belirtilen pano aşamasını siler.
router.delete('/:stageId', projectIdRules, stageIdRules, handleValidationErrors, controller.remove);

module.exports = router;
