<template>
  <div class="user-reservations">
    <h2>Benim Rezervasyonlarım</h2>
    <div class="reservation-grid">
      <div
        v-for="reservation in reservations"
        :key="reservation._id"
        class="reservation-card"
      >
        <p class="reservation-book">
          <strong>Kitap:</strong> {{ reservation.book.title }}
        </p>
        <p class="reservation-date">
          <strong>Tarih:</strong> {{ getDisplayDate(reservation) }}
        </p>
        <p class="reservation-status">
          <strong>Durum:</strong> {{ reservation.status }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserReservations",
  props: ["reservations"],
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString();
    },
    getDisplayDate(reservation) {
      if (reservation.status === "rezerve edildi") {
        return this.formatDate(reservation.reservationDate);
      } else if (
        reservation.status === "ödünç verildi" ||
        reservation.status === "ödünç alındı"
      ) {
        return this.formatDate(reservation.loanDate);
      } else if (reservation.status === "iade edildi") {
        return this.formatDate(reservation.returnDate);
      } else if (reservation.status === "iptal edildi") {
        return this.formatDate(reservation.reservationDate);
      }
      return "";
    }
  }
};
</script>

<style scoped>
.user-reservations {
  background: #f9f9f9;
}

.user-reservations h2 {
  text-align: center;
  color: #1e3a8a;
  font-size: 1.75rem;
}

.reservation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.reservation-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.reservation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reservation-book,
.reservation-date,
.reservation-status {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: #333;
}

@media (max-width: 600px) {
  .reservation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .reservation-card {
    padding: 0.75rem;
  }
  .reservation-book,
  .reservation-date,
  .reservation-status {
    font-size: 0.9rem;
  }
}
</style>
