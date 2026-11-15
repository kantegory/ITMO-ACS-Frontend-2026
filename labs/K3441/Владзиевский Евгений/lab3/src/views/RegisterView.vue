<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import { useAuth } from '../composables/useAuth.js';

const router = useRouter();
const { register } = useAuth();

const form = reactive({
  role: 'tenant', first: '', last: '', email: '', phone: '',
  password: '', password2: '', agree: false
});
const errors = reactive({});
const commonError = ref('');
const pending = ref(false);

const PHONE = /^\+?[78][\s\-(]?\d{3}[\s\-)]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;

function validate() {
  errors.first = form.first.trim() ? '' : 'Укажите имя';
  errors.last = form.last.trim() ? '' : 'Укажите фамилию';
  errors.email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ? '' : 'Введите почту в формате name@mail.ru';
  errors.phone = PHONE.test(form.phone.trim()) ? '' : 'Номер в формате +7 900 000-00-00';
  errors.password = form.password.length >= 8 ? '' : 'Не короче 8 символов';
  errors.password2 = form.password === form.password2 ? '' : 'Пароли не совпадают';
  errors.agree = form.agree ? '' : 'Без согласия зарегистрироваться нельзя';
  return Object.values(errors).every((value) => !value);
}

async function submit() {
  if (!validate()) return;
  pending.value = true;
  commonError.value = '';
  try {
    await register({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      name: `${form.first.trim()} ${form.last.trim()}`,
      role: form.role,
      phone: form.phone.trim(),
      since: new Date().toISOString().slice(0, 10),
      verified: false
    });
    router.replace({ name: 'profile' });
  } catch (error) {
    commonError.value = error.status === 400 && /exist/i.test(error.message)
      ? 'Такая почта уже зарегистрирована. Попробуйте войти.'
      : error.message;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="auth-wrap">
    <div class="auth-aside" style="background-image: url('/img/house-1.webp')">
      <blockquote>
        Сдаю дом в Репино третий год. Арендаторов проверяет сервис, а депозит лежит на счёте,
        так что спорить не о чем.
        <cite>Игорь, владелец</cite>
      </blockquote>
    </div>

    <div class="auth-form-col">
      <div class="auth-card">
        <h1 class="mb-2">Регистрация</h1>
        <p class="text-muted-2 mb-4">
          Уже есть аккаунт? <RouterLink :to="{ name: 'login' }">Войдите</RouterLink>.
        </p>

        <div v-if="commonError" class="alert alert-danger" role="alert">{{ commonError }}</div>

        <form novalidate @submit.prevent="submit">
          <fieldset class="mb-4">
            <legend class="form-label fs-6 mb-2">Что вы хотите сделать?</legend>
            <div class="role-switch">
              <input id="role-tenant" v-model="form.role" class="btn-check" type="radio" value="tenant">
              <label class="btn" for="role-tenant">
                <AppIcon name="search" class="me-1" /> Снять жильё<small>ищу квартиру или дом</small>
              </label>
              <input id="role-owner" v-model="form.role" class="btn-check" type="radio" value="owner">
              <label class="btn" for="role-owner">
                <AppIcon name="house-door" class="me-1" /> Сдать жильё<small>я владелец</small>
              </label>
            </div>
          </fieldset>

          <div class="row g-3">
            <div class="col-sm-6">
              <label class="form-label" for="reg-first">Имя</label>
              <input id="reg-first" v-model="form.first" class="form-control" :class="{ 'is-invalid': errors.first }" autocomplete="given-name">
              <div v-if="errors.first" class="invalid-feedback d-block">{{ errors.first }}</div>
            </div>
            <div class="col-sm-6">
              <label class="form-label" for="reg-last">Фамилия</label>
              <input id="reg-last" v-model="form.last" class="form-control" :class="{ 'is-invalid': errors.last }" autocomplete="family-name">
              <div v-if="errors.last" class="invalid-feedback d-block">{{ errors.last }}</div>
            </div>
            <div class="col-12">
              <label class="form-label" for="reg-email">Электронная почта</label>
              <input id="reg-email" v-model.trim="form.email" class="form-control" :class="{ 'is-invalid': errors.email }" type="email" autocomplete="email">
              <div v-if="errors.email" class="invalid-feedback d-block">{{ errors.email }}</div>
            </div>
            <div class="col-12">
              <label class="form-label" for="reg-phone">Телефон</label>
              <input id="reg-phone" v-model="form.phone" class="form-control" :class="{ 'is-invalid': errors.phone }" type="tel" autocomplete="tel" placeholder="+7 900 000-00-00" aria-describedby="phone-hint">
              <div id="phone-hint" class="form-text">Владельцы не увидят номер, пока вы сами его не отправите.</div>
              <div v-if="errors.phone" class="invalid-feedback d-block">{{ errors.phone }}</div>
            </div>
            <div class="col-sm-6">
              <label class="form-label" for="reg-password">Пароль</label>
              <input id="reg-password" v-model="form.password" class="form-control" :class="{ 'is-invalid': errors.password }" type="password" autocomplete="new-password" aria-describedby="pass-hint">
              <div v-if="errors.password" class="invalid-feedback d-block">{{ errors.password }}</div>
            </div>
            <div class="col-sm-6">
              <label class="form-label" for="reg-password2">Повторите пароль</label>
              <input id="reg-password2" v-model="form.password2" class="form-control" :class="{ 'is-invalid': errors.password2 }" type="password" autocomplete="new-password">
              <div v-if="errors.password2" class="invalid-feedback d-block">{{ errors.password2 }}</div>
            </div>
            <div class="col-12">
              <div id="pass-hint" class="form-text mt-0">Минимум 8 символов. Лучше добавить цифру.</div>
            </div>
            <div class="col-12">
              <div class="form-check">
                <input id="reg-agree" v-model="form.agree" class="form-check-input" :class="{ 'is-invalid': errors.agree }" type="checkbox">
                <label class="form-check-label" for="reg-agree">
                  Принимаю условия сервиса и согласен на обработку персональных данных
                </label>
                <div v-if="errors.agree" class="invalid-feedback d-block">{{ errors.agree }}</div>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg w-100 mt-4" type="submit" :disabled="pending">
            <span v-if="pending" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            {{ pending ? 'Создаём…' : 'Создать аккаунт' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
