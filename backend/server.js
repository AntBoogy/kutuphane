const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const Book = require('./models/Book');
const Member = require('./models/Member');
const Transaction = require('./models/Transaction');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

/*-----------------------------------------------
  MONGODB BAĞLANTISI
-----------------------------------------------*/

mongoose.connect('mongodb://127.0.0.1:27017/library', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB'ye bağlandı"))
.catch(err => console.error("MongoDB bağlantı hatası:", err));

/*-----------------------------------------------
  KITAP İŞLEMLERİ
-----------------------------------------------*/
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error("Kitap ekleme hatası:", err);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) return res.status(404).json({ error: "Kitap bulunamadı" });
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ error: "Kitap bulunamadı" });
    res.json({ message: "Kitap silindi" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*-----------------------------------------------
  ÜYE İŞLEMLERİ
-----------------------------------------------*/
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const newMember = new Member(req.body);
    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMember) return res.status(404).json({ error: "Üye bulunamadı" });
    res.json(updatedMember);
  } catch (err) {
    console.error("Üye güncelleme hatası:", err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) return res.status(404).json({ error: "Üye bulunamadı" });
    res.json({ message: "Üye silindi" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*-----------------------------------------------
  ÖDÜNÇ/İADE İŞLEMLERİ
-----------------------------------------------*/
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('book')
      .populate('member');
    res.json(transactions);
  } catch (err) {
    console.error("Rezervasyonları çekerken hata:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    let memberName = '';
    if (req.body.member) {
      const member = await Member.findById(req.body.member);
      if (!member) {
        return res.status(400).json({ error: "Geçersiz üye: Üye bulunamadı" });
      }
      memberName = member.name;
    }
    
    const newTransaction = new Transaction({
      ...req.body,
      memberName: memberName
    });
    
    await newTransaction.save();
    
    if (newTransaction.status === "rezerve edildi" || newTransaction.status === "ödünç verildi") {
      await Book.findByIdAndUpdate(req.body.book, { status: 1 });
    }
    
    res.status(201).json(newTransaction);
  } catch (err) {
    console.error("Ödünç işlemi ekleme hatası:", err);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (req.body.status === "iade edildi") {
      const bookId = typeof updatedTransaction.book === 'object' ? updatedTransaction.book._id : updatedTransaction.book;
      await Book.findByIdAndUpdate(bookId, { status: 0 });
    }
    
    res.json(updatedTransaction);
  } catch (err) {
    console.error("Transaction güncelleme hatası:", err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) return res.status(404).json({ error: "İşlem bulunamadı" });
    res.json({ message: "İşlem silindi" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

cron.schedule('0 9 * * *', async () => {
  console.log("Ceza hesaplama işi başlatıldı: ", new Date().toLocaleString());
  try {
    const activeLoans = await Transaction.find({ status: 'ödünç verildi' });
    const userPenalties = {};
    const now = new Date();

    activeLoans.forEach(loan => {
      const loanDate = new Date(loan.loanDate);
      const diffTime = now - loanDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      let penalty = 0;
      if (diffDays > 5) {
        penalty = (diffDays - 5) * 10;
      }
      const userId = loan.member.toString();
      if (!userPenalties[userId]) {
        userPenalties[userId] = 0;
      }
      userPenalties[userId] += penalty;
    });

    for (const userId in userPenalties) {
      const newPenalty = userPenalties[userId];
      await Member.findByIdAndUpdate(userId, { penalty: newPenalty });
      console.log(`Kullanıcı ${userId} için ceza güncellendi: ${newPenalty} TL`);
    }
    console.log("Ceza hesaplama işi tamamlandı.");
  } catch (error) {
    console.error("Ceza hesaplama işinde hata:", error);
  }
});

/*-----------------------------------------------
  Sunucuyu Başlat
-----------------------------------------------*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));
