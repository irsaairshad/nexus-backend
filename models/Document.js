const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    version: { type: Number, default: 1 },
    status: { type: String, enum: ['draft', 'review', 'approved'], default: 'draft' },
    signatureUrl: { type: String, default: '' },
    isSigned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);