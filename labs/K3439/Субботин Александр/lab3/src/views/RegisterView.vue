<script setup>
import { reactive, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'

import AuthCard from '@/components/auth/AuthCard.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuth } from '@/composables/useAuth'
import { useFormValidation } from '@/composables/useFormValidation'

const router = useRouter()
const { register } = useAuth()

const form = useTemplateRef('form')
const confirmInput = useTemplateRef('confirmInput')
const { validated, submitting, formError, resync, onSubmit } = useFormValidation(form)

const account = reactive({ name: '', email: '', phone: '', password: '', passwordConfirm: '', agree: false })

// Пароли должны совпадать — сообщаем об этом через Constraint Validation API
watch(() => [account.password, account.passwordConfirm], ([password, confirm]) => {
  confirmInput.value.setCustomValidity(confirm && confirm !== password ? 'mismatch' : '')
})

const benefits = [
  'Бронь в любом ресторане за 30 секунд',
  'История визитов и напоминания',
  'Избранные места и честные отзывы',
]

const submit = onSubmit(async () => {
  await register(account)
  router.push({ name: 'profile' })
})
</script>

<template>
  <AuthCard>
    <template #aside>
      <h2 class="h3">Присоединяйтесь</h2>
      <ul class="auth-benefits list-unstyled mb-4">
        <li v-for="benefit in benefits" :key="benefit"><AppIcon name="check" />{{ benefit }}</li>
      </ul>
    </template>

    <h1 class="h2 mb-1">Регистрация</h1>
    <p class="text-muted-warm mb-4">Уже есть аккаунт? <RouterLink :to="{ name: 'login' }">Войдите</RouterLink></p>

    <form
      ref="form"
      class="needs-validation"
      :class="{ 'was-validated': validated }"
      novalidate
      @submit.prevent="submit"
      @input="resync"
      @change="resync"
    >
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label" for="registerName">Имя и фамилия</label>
          <input
            id="registerName"
            v-model="account.name"
            class="form-control"
            type="text"
            autocomplete="name"
            minlength="2"
            placeholder="Иван Петров"
            required
            aria-errormessage="registerNameError"
          >
          <div id="registerNameError" class="invalid-feedback">Как к вам обращаться?</div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="registerEmail">Электронная почта</label>
          <input
            id="registerEmail"
            v-model="account.email"
            class="form-control"
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
            required
            aria-errormessage="registerEmailError"
          >
          <div id="registerEmailError" class="invalid-feedback">Введите корректный адрес почты.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="registerPhone">Телефон</label>
          <input
            id="registerPhone"
            v-model="account.phone"
            class="form-control"
            type="tel"
            autocomplete="tel"
            placeholder="+7 900 123-45-67"
            pattern="^\+?[0-9\s\-\(\)]{10,18}$"
            required
            aria-errormessage="registerPhoneError"
          >
          <div id="registerPhoneError" class="invalid-feedback">Например: +7 900 123-45-67.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="registerPassword">Пароль</label>
          <PasswordInput
            id="registerPassword"
            v-model="account.password"
            autocomplete="new-password"
            :minlength="8"
            describedby="passwordHelp"
            error="Минимум 8 символов."
          />
          <div id="passwordHelp" class="form-text">Лучше сочетать буквы и цифры.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="registerPasswordConfirm">Повторите пароль</label>
          <input
            id="registerPasswordConfirm"
            ref="confirmInput"
            v-model="account.passwordConfirm"
            class="form-control"
            type="password"
            autocomplete="new-password"
            required
            aria-errormessage="registerPasswordConfirmError"
          >
          <div id="registerPasswordConfirmError" class="invalid-feedback">Повторите пароль — он должен совпадать с первым.</div>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input id="registerAgree" v-model="account.agree" class="form-check-input" type="checkbox" required aria-errormessage="registerAgreeError">
            <label class="form-check-label" for="registerAgree">Согласен с правилами сервиса и обработкой персональных данных</label>
            <div id="registerAgreeError" class="invalid-feedback">Без согласия зарегистрироваться не получится.</div>
          </div>
        </div>
        <div class="col-12">
          <div v-if="formError" class="alert alert-danger mb-3" role="alert">{{ formError }}</div>
          <button class="btn btn-primary btn-lg w-100" type="submit" :disabled="submitting">Создать аккаунт</button>
        </div>
      </div>
    </form>
  </AuthCard>
</template>
