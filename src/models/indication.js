// src/models/Indication.js
import mongoose from 'mongoose';

// Definindo o schema para Indication
const indicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  electoralCard: {
    type: String,
    required: true,
  },
  electoralZone: {
    type: String,
    required: true,
  },
  electoralSection: {
    type: String,
    required: true,
  },
  electoralLocation: {
    type: String,
    required: true,
  },
  leaderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Leader", 
    equired: true 
  },
  ownerLeader: {
    type: Boolean,
    required: false,
  },
}, {
  timestamps: true, // Para criar campos createdAt e updatedAt automaticamente
});

const Indication = mongoose.models.Indication || mongoose.model('Indication', indicationSchema);

export default Indication;