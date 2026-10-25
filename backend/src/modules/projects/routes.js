const express = require('express');
const controller = require('./controller');
const { createProjectRules, updateProjectRules, projectIdRules, listProjectRules } = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

// Bu modüldeki tüm endpoint'ler JWT doğrulaması gerektirir.
router.use(authenticate);

// GET /api/projects?search=web&is_archived=false&sort=name:asc&page=1&limit=20
router.get('/', listProjectRules, handleValidationErrors, controller.list);

// GET  /api/projects/:id
router.get('/:id', projectIdRules, handleValidationErrors, controller.getOne);

// POST /api/projects
router.post('/', createProjectRules, handleValidationErrors, controller.create);

// PUT  /api/projects/:id
router.put('/:id', projectIdRules, updateProjectRules, handleValidationErrors, controller.update);

// DELETE /api/projects/:id
router.delete('/:id', projectIdRules, handleValidationErrors, controller.remove);

// PATCH /api/projects/:id/archive
router.patch('/:id/archive', projectIdRules, handleValidationErrors, controller.archive);

// Pano aşaması kendi route/controller/service katmanında tutulur.
// GET/POST /api/projects/:id/stages ve DELETE /api/projects/:id/stages/:stageId
router.use('/:id/stages', require('../board-stages/routes'));

module.exports = router;
