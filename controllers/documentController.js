const Document = require('../models/Document');
const path = require('path');

// @desc    Upload a document
// @route   POST /api/documents/upload
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const document = await Document.create({
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      fileSize: req.file.size,
      uploadedBy: req.user._id,
    });

    await document.populate('uploadedBy', 'name email avatarUrl');
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all documents for logged-in user
// @route   GET /api/documents
exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { uploadedBy: req.user._id },
        { sharedWith: req.user._id }
      ]
    })
      .populate('uploadedBy', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    if (document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save e-signature for a document
// @route   PUT /api/documents/:id/sign
exports.signDocument = async (req, res) => {
  try {
    const { signatureUrl } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    document.signatureUrl = signatureUrl;
    document.isSigned = true;
    document.status = 'approved';
    await document.save();

    res.json({ message: 'Document signed successfully', document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};