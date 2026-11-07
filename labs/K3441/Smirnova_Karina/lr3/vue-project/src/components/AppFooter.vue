<template>
  <footer class="app-footer">
    <div class="rs-container app-footer__row">
      <strong>RentSpace</strong>
      <span>2026 Сервис аренды недвижимости</span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  padding: 28px 0;
  border-top: 1px solid var(--rs-border);
  background: var(--rs-surface);
  color: var(--rs-muted);
}
.app-footer__row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
@media (max-width: 576px) {
  .app-footer__row {
    flex-direction: column;
  }
}
</style>
