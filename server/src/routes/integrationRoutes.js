const express = require('express');
const integrationController = require('../controllers/integrationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getStatus);
router.post('/', integrationController.saveApiKey);
router.delete('/:provider', integrationController.disconnect);
router.get('/oauth/:provider/start', integrationController.startOAuth);
router.get('/oauth/:provider/callback', integrationController.callbackOAuth);

module.exports = router;
