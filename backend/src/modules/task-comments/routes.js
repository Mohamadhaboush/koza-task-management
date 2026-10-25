const express = require('express');
const controller = require('./controller');
const validators = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);
router.post('/', validators.createCommentRules, handleValidationErrors, controller.create);
router.get('/', validators.listCommentRules, handleValidationErrors, controller.list);

module.exports = router;
