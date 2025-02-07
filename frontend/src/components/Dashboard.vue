<template>
  <div class="dashboard">
    <h2 class="page-title">Dashboard</h2>
    <div class="stats-grid">
      <div class="card stat-card">
        <h3>Toplam Kitap</h3>
        <p class="stat-number">{{ stats.totalBooks }}</p>
      </div>
      <div class="card stat-card">
        <h3>Toplam Üye</h3>
        <p class="stat-number">{{ stats.totalMembers }}</p>
      </div>
      <div class="card stat-card">
        <h3>Aktif İşlem</h3>
        <p class="stat-number">{{ stats.activeTransactions }}</p>
      </div>
    </div>
    <div class="charts-row">
      <div class="chart-container">
        <canvas id="borrowChart"></canvas>
      </div>
      <div class="chart-container">
        <canvas id="dailyChart"></canvas>
      </div>
    </div>
    <div v-if="showOverdueModal" class="overdue-modal-overlay">
      <div class="overdue-modal">
        <h2>Dikkat!</h2>
        <p>Kitabınızı iade etmek için bir gün kaldı, lütfen kitabı iade ediniz.</p>
        <button @click="closeOverdueModal" class="btn overdue-close-btn">Tamam</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  name: "DashboardPage",
  data() {
    return {
      stats: {
        totalBooks: 0,
        totalMembers: 0,
        activeTransactions: 0
      },
      topBooksData: {
        labels: [],
        counts: []
      },
      dailyBorrowData: {
        labels: [],
        counts: []
      },
      showOverdueModal: false,
      currentUser: {},
      isMobile: window.innerWidth <= 768
    };
  },
  created() {
    this.fetchStats();
    this.fetchTopBooks();
    this.fetchDailyBorrowData();
    this.checkOverdueLoans();
    const user = localStorage.getItem("user");
    if (user) {
      this.currentUser = JSON.parse(user);
    }
  },
  mounted() {
    window.addEventListener("resize", this.updateIsMobile);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateIsMobile);
  },
  methods: {
    updateIsMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    async fetchStats() {
      try {
        const [booksRes, membersRes, transactionsRes] = await Promise.all([
          axios.get("http://localhost:3000/api/books"),
          axios.get("http://localhost:3000/api/members"),
          axios.get("http://localhost:3000/api/transactions")
        ]);
        this.stats.totalBooks = booksRes.data.length;
        this.stats.totalMembers = membersRes.data.length;
        this.stats.activeTransactions = transactionsRes.data.filter(
          t => t.status === "ödünç verildi" || t.status === "ödünç alındı"
        ).length;
      } catch (error) {
        console.error("İstatistikler alınırken hata:", error);
      }
    },
    async fetchTopBooks() {
      try {
        const response = await axios.get("http://localhost:3000/api/transactions");
        const transactions = response.data;
        const bookCounts = {};
        transactions.forEach(tx => {
          if (
            tx.status === "ödünç verildi" ||
            tx.status === "ödünç alındı" ||
            tx.status === "iade edildi"
          ) {
            const title = tx.bookTitle || (typeof tx.book === "object" && tx.book.title ? tx.book.title : null);
            if (title) {
              bookCounts[title] = (bookCounts[title] || 0) + 1;
            }
          }
        });
        const sortedBooks = Object.entries(bookCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        this.topBooksData.labels = sortedBooks.map(([title]) => title);
        this.topBooksData.counts = sortedBooks.map(item => item[1]);
        this.createBorrowedChart(this.topBooksData.labels, this.topBooksData.counts);
      } catch (error) {
        console.error("En çok ödünç alınan kitaplar alınırken hata:", error);
      }
    },
    async fetchDailyBorrowData() {
      try {
        const response = await axios.get("http://localhost:3000/api/transactions");
        const transactions = response.data;
        const today = new Date();
        let dates = [];
        for (let i = 4; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          dates.push(d.toISOString().split("T")[0]);
        }
        const transactionCounts = transactions.reduce((acc, tx) => {
          if (
            (tx.status === "ödünç verildi" ||
              tx.status === "ödünç alındı" ||
              tx.status === "iade edildi") &&
            tx.loanDate
          ) {
            const date = new Date(tx.loanDate).toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
          }
          return acc;
        }, {});
        const dailyCounts = dates.map(date => transactionCounts[date] || 0);
        this.dailyBorrowData.labels = dates;
        this.dailyBorrowData.counts = dailyCounts;
        this.createDailyChart(this.dailyBorrowData.labels, this.dailyBorrowData.counts);
      } catch (error) {
        console.error("Günlük ödünç verim verileri alınırken hata:", error);
      }
    },
    createBorrowedChart(labels, counts) {
      this.$nextTick(() => {
        const ctx = document.getElementById("borrowChart").getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Ödünç Sayısı",
                data: counts,
                backgroundColor: "rgba(30,58,138,0.5)",
                borderColor: "rgba(30,58,138,1)",
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "none" },
              title: { display: true, text: "En Çok Ödünç Alınan İlk 5 Kitap" }
            },
            scales: {
              x: {
                display: !this.isMobile,
                ticks: { display: !this.isMobile }
              },
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }
        });
      });
    },
    createDailyChart(labels, counts) {
      this.$nextTick(() => {
        const ctx = document.getElementById("dailyChart").getContext("2d");
        new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Ödünç Sayısı",
                data: counts,
                borderColor: "rgba(40,167,69,1)",
                backgroundColor: "rgba(40,167,69,0.3)",
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "none" },
              title: { display: true, text: "Son 5 Gün: Günlere Göre Ödünç Alınan Kitap Sayısı" }
            },
            scales: {
              x: {
                display: !this.isMobile,
                ticks: { display: !this.isMobile }
              },
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }
        });
      });
    },
    async checkOverdueLoans() {
      try {
        const response = await axios.get("http://localhost:3000/api/transactions");
        const transactions = response.data;
        const today = new Date();
        const userId = this.currentUser.id;
        const userName = this.currentUser.name;
        const userTransactions = transactions.filter(tx => {
          let memberId = null;
          if (tx.member) {
            if (typeof tx.member === "object" && tx.member._id) {
              memberId = tx.member._id.toString();
            } else {
              memberId = tx.member.toString();
            }
          }
          if (memberId) {
            return memberId === userId;
          } else if (tx.memberName) {
            return tx.memberName === userName;
          }
          return false;
        });
        const overdueLoans = userTransactions.filter(loan => {
          if (
            (loan.status === "ödünç verildi" || loan.status === "ödünç alındı") &&
            loan.loanDate
          ) {
            const loanDate = new Date(loan.loanDate);
            const diffTime = today - loanDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays >= 4;
          }
          return false;
        });
        if (overdueLoans.length > 0) {
          this.showOverdueModal = true;
        }
      } catch (error) {
        console.error("Geciken ödünç işlemleri alınırken hata:", error);
      }
    },
    closeOverdueModal() {
      this.showOverdueModal = false;
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  background: #f0f2f5;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.page-title {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #1e3a8a;
  text-align: center;
}
.stats-grid {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}
.charts-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
}
.card.stat-card {
  flex: 1;
  text-align: center;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.stat-number {
  font-size: 2rem;
  margin-top: 0.5rem;
  color: #172554;
}
.chart-container {
  flex: 1 1 300px;
  max-width: 600px;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.overdue-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.overdue-modal {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.overdue-modal h2 {
  margin: 0 0 1rem;
  font-size: 2rem;
  color: #dc3545;
}
.overdue-modal p {
  font-size: 1.25rem;
  margin: 1rem 0;
  color: #333;
}
.overdue-close-btn {
  background-color: #1e3a8a;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}
.overdue-close-btn:hover {
  background-color: #162f6b;
}
@media (max-width: 768px) {
  .stats-grid {
    flex-direction: column;
    align-items: center;
  }
  .charts-row {
    flex-direction: column;
    align-items: center;
  }
  .card.stat-card {
    width: 100%;
  }
  .chart-container {
    display: inline-block;
    width: auto;
    max-width: 100%;
    padding: 0.5rem;
  }
}
</style>
