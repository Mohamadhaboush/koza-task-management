const express = require('express');
const controller = require('./checklist.controller');
const validators = require('./checklist.validators');
const handleValidationErrors = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);
router.get('/', validators.getChecklistRules, handleValidationErrors, controller.list);
router.get('/:checklistId', validators.getOneChecklistRules, handleValidationErrors, controller.getOne);
router.post('/', validators.createChecklistRules, handleValidationErrors, controller.create);
router.patch('/:checklistId', validators.updateChecklistRules, handleValidationErrors, controller.update);
router.delete('/:checklistId', validators.deleteChecklistRules, handleValidationErrors, controller.remove);

module.exports = router;
