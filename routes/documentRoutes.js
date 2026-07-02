const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  signDocument,
} = require('../controllers/documentController');

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getMyDocuments);
router.delete('/:id', protect, deleteDocument);
router.put('/:id/sign', protect, signDocument);

module.exports = router;