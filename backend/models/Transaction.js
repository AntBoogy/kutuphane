const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  reservationDate: { type: Date },
  status: {
    type: String,
    enum: ['rezerve edildi', 'ödünç verildi', 'iade edildi', 'iptal edildi'],
    default: 'rezerve edildi'
  },
  loanDate: { type: Date },
  returnDate: { type: Date },
  memberName: { type: String }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
