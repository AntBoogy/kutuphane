const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  membershipType: { type: String, enum: ['öğrenci', 'öğretmen', 'genel üye'], required: true },
  penalty: { type: Number, default: 0 },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  phone: { type: String },
  tc: { type: Number },
  birthDate: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

MemberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

MemberSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Member', MemberSchema);
