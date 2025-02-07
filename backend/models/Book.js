const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  isbn: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: String,
  year: Number,
  shelf: String,
  section: String,
  condition: { type: String, enum: ['normal', 'lost', 'damaged'], default: 'normal' },
  keywords: [String],
  status: { type: Number, default: 0 }
});

module.exports = mongoose.model('Book', BookSchema);
