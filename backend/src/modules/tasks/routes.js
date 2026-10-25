const express = require('express');
const controller = require('./controller');
const validators = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', validators.listTaskRules, handleValidationErrors, controller.list);
router.get('/:id', validators.taskIdRules, handleValidationErrors, controller.getOne);
router.post('/', validators.createTaskRules, handleValidationErrors, controller.create);
router.patch('/:id', validators.updateTaskRules, handleValidationErrors, controller.update);
router.delete('/:id', validators.taskIdRules, handleValidationErrors, controller.remove);

module.exports = router;
