const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['entrepreneur', 'investor'], required: true },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    isOnline: { type: Boolean, default: false },

    // Entrepreneur-specific fields (used only if role === 'entrepreneur')
    startupName: { type: String },
    pitchSummary: { type: String },
    fundingNeeded: { type: String },
    industry: { type: String },
    location: { type: String },
    foundedYear: { type: Number },
    teamSize: { type: Number },

    // Investor-specific fields (used only if role === 'investor')
    investmentInterests: [{ type: String }],
    investmentStage: [{ type: String }],
    portfolioCompanies: [{ type: String }],
    totalInvestments: { type: Number },
    minimumInvestment: { type: String },
    maximumInvestment: { type: String },
  },
  { timestamps: true } 
);

module.exports = mongoose.model('User', userSchema);