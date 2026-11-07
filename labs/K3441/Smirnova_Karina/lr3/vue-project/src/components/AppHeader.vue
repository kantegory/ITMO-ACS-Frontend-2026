<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import spriteUrl from '@/assets/sprite.svg'
import { useAuthStore } from '@/stores/auth'
import { getUserInitials } from '@/utils/formatters'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

const isMenuOpen = ref(false)

const displayName = computed(() => {
  return user.value?.name || user.value?.email || 'Пользователь'
})

const userInitials = computed(() => {
  return getUserInitials(displayName.value)
})

const brandIconHref = `${spriteUrl}#house-door`

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

async function logout() {
  closeMenu()
  authStore.logout()
  await router.push({ name: 'login' })
}

watch(
  () => route.fullPath,
  () => closeMenu(),
)
</script>

<template>
  <header class="app-header">
    <div class="rs-container app-header__inner">
      <RouterLink
        class="app-brand"
        :to="{ name: 'search' }"
        aria-label="RentSpace — перейти к поиску"
      >
        <span class="app-brand__mark">
          <svg class="app-brand__icon" aria-hidden="true" focusable="false">
            <use :href="brandIconHref" />
          </svg>
        </span>

        <span>RentSpace</span>
      </RouterLink>

      <nav class="app-navigation" aria-label="Основная навигация">
        <RouterLink class="app-navigation__link" :to="{ name: 'search' }"> Найти жильё </RouterLink>

        <RouterLink class="app-navigation__link" :to="{ name: 'profile' }">
          Мои объекты
        </RouterLink>

        <RouterLink class="app-navigation__link" :to="{ name: 'activity' }">
          Сообщения и сделки
        </RouterLink>
      </nav>

      <div class="app-header__actions">
        <ThemeToggle />

        <div v-if="isAuthenticated" class="user-menu" @keydown.esc.stop="closeMenu">
          <button
            class="user-menu__trigger"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isMenuOpen"
            @click="toggleMenu"
          >
            <span class="user-avatar">
              {{ userInitials }}
            </span>

            <span class="user-menu__name">
              {{ displayName }}
            </span>

            <span class="user-menu__arrow" aria-hidden="true">
              <svg class="user-menu__arrow-icon" focusable="false">
                <use :href="`${spriteUrl}#chevron-down`" />
              </svg>
            </span>
          </button>

          <div v-if="isMenuOpen" class="user-menu__dropdown" role="menu">
            <RouterLink
              class="user-menu__item"
              :to="{ name: 'profile' }"
              role="menuitem"
              @click="closeMenu"
            >
              Личный кабинет
            </RouterLink>

            <div class="user-menu__divider" />

            <button
              class="user-menu__item user-menu__item--danger"
              type="button"
              role="menuitem"
              @click="logout"
            >
              Выйти
            </button>
          </div>
        </div>

        <div v-else class="guest-actions">
          <RouterLink class="guest-actions__login" :to="{ name: 'login' }"> Войти </RouterLink>

          <RouterLink class="guest-actions__register" :to="{ name: 'register' }">
            Регистрация
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  min-height: 80px;
  background: var(--rs-surface);
  border-bottom: 1px solid var(--rs-border);
}

.app-header__inner {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.app-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;

  color: var(--rs-text);
  font-size: 22px;
  font-weight: 700;
  white-space: nowrap;
}

.app-brand__mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;

  color: #fff;
  background: var(--rs-primary);
  border-radius: 10px;
}

.app-brand__icon {
  width: 21px;
  height: 21px;
  fill: currentColor;
}

.app-navigation {
  display: flex;
  align-items: center;
  gap: 30px;
}

.app-navigation__link {
  color: var(--rs-muted);
  font-weight: 500;
  white-space: nowrap;
}

.app-navigation__link:hover,
.app-navigation__link.router-link-exact-active {
  color: var(--rs-primary);
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-menu {
  position: relative;
}

.user-menu__trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;

  color: var(--rs-text);
  background: transparent;
  border: 0;

  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;

  color: var(--rs-primary);
  background: var(--rs-primary-soft);
  border-radius: 50%;
}

.user-menu__arrow {
  display: inline-flex;
  color: var(--rs-muted);
}

.user-menu__arrow-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 1000;

  min-width: 210px;
  padding: 10px;

  color: var(--rs-text);
  background: var(--rs-surface);
  border: 1px solid var(--rs-border);
  border-radius: 12px;
  box-shadow: var(--rs-shadow-dropdown);
}

.user-menu__item {
  width: 100%;
  display: block;
  padding: 10px 12px;

  color: var(--rs-text);
  background: transparent;
  border: 0;
  border-radius: 8px;

  font: inherit;
  text-align: left;
  cursor: pointer;
}

.user-menu__item:hover {
  background: var(--rs-surface-soft);
}

.user-menu__item--danger {
  color: #dc3545;
}

.user-menu__divider {
  height: 1px;
  margin: 6px 0;
  background: var(--rs-border);
}

.guest-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guest-actions__login,
.guest-actions__register {
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
}

.guest-actions__login {
  color: var(--rs-primary);
}

.guest-actions__register {
  color: #fff;
  background: var(--rs-primary);
}

@media (max-width: 1100px) {
  .app-header__inner {
    flex-wrap: wrap;
    padding-block: 16px;
  }

  .app-navigation {
    order: 3;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .app-navigation {
    justify-content: flex-start;
    gap: 16px;
    overflow-x: auto;
  }

  .user-menu__name,
  .user-menu__arrow {
    display: none;
  }
}

@media (max-width: 576px) {
  .app-brand > span:last-child {
    display: none;
  }

  .guest-actions__register {
    display: none;
  }
}
</style>
