const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const JWT_SECRET = 'BatuhanAydin67!';

const transporter = nodemailer.createTransport({
  host: "mail.abart.studio",
  port: 587,
  secure: false,
  auth: {
    user: 'batuhan@abart.studio',
    pass: 'Hayattabela1'
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Member.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Geçersiz şifre' });
    }
    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error("Login endpoint hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, membershipType, isAdmin } = req.body;
  try {
    const randomPassword = Math.random().toString(36).slice(-10);
    const newMember = new Member({
      name,
      email,
      membershipType,
      password: randomPassword,
      isAdmin: isAdmin || false
    });
    await newMember.save();
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hosgeldin@abart.studio',
      to: email,
      subject: 'Hesap Şifreniz',
      text: `Merhaba ${name},\n\nHesabınız oluşturuldu. Giriş için şifreniz: ${randomPassword}\nLütfen giriş yaptıktan sonra şifrenizi değiştiriniz.`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Mail gönderme hatası:', error);
      } else {
        console.log('Mail gönderildi: ' + info.response);
      }
    });
    res.status(201).json({ message: 'Kullanıcı oluşturuldu ve şifre e-posta ile gönderildi.' });
  } catch (err) {
    console.error('Üye oluşturulurken hata:', err);
    res.status(500).json({ error: 'Kullanıcı oluşturulurken hata oluştu.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Member.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    const resetLink = `http://localhost:8080/reset-password?token=${token}&email=${email}`;
    const mailOptions = {
      from: 'password_reset@gmail.com',
      to: email,
      subject: 'Şifre Sıfırlama',
      text: `Merhaba ${user.name},\n\nŞifre sıfırlama isteğinde bulundunuz. Lütfen aşağıdaki linke tıklayarak yeni şifrenizi belirleyin:\n\n${resetLink}\n\nBu link 1 saat geçerlidir.`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Mail gönderme hatası:', error);
      } else {
        console.log('Şifre sıfırlama maili gönderildi: ' + info.response);
      }
    });
    res.json({ message: 'Şifre sıfırlama linki e-posta ile gönderildi.' });
  } catch (err) {
    res.status(500).json({ error: 'Şifre sıfırlama isteği gönderilirken hata oluştu.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword, confirmPassword } = req.body;
  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Şifreler uyuşmuyor.' });
    }
    const user = await Member.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ error: 'Token geçersiz veya süresi dolmuş.' });
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (error) {
    res.status(500).json({ error: 'Şifre güncellenirken hata oluştu.' });
  }
});

module.exports = router;
