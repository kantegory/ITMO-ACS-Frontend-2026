<script setup>
import { reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import ListingGrid from '../components/ListingGrid.vue';
import { useAsync } from '../composables/useAsync.js';
import * as api from '../api/resources.js';

const router = useRouter();

// Шесть самых свежих объявлений: сортировку и ограничение считает сервер
const { data: fresh, pending, error } = useAsync(
  () => api.fetchListings({ _sort: 'posted', _order: 'desc', _limit: 6 }).then((r) => r.items),
  { initial: [], immediate: true }
);

const hero = reactive({ type: 'flat2', city: 'Санкт-Петербург', max: 65 });

const DISTRICTS = ['Петроградский', 'Центральный', 'Адмиралтейский', 'Василеостровский',
  'Выборгский', 'Московский', 'Приморский', 'Курортный'];

function submitHero() {
  router.push({ name: 'search', query: { type: hero.type, city: hero.city, max: hero.max } });
}
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="container">
      <h1 id="hero-title" class="visually-hidden">Поиск жилья в аренду</h1>

      <form class="hero-form" role="search" aria-labelledby="hero-title" @submit.prevent="submitHero">
        <p class="hero-sentence">
          Сниму
          <span class="slot">
            <label class="visually-hidden" for="hero-type">Тип жилья</label>
            <select id="hero-type" v-model="hero.type">
              <option value="flat2">двушку</option>
              <option value="flat1">однушку</option>
              <option value="flat3">трёшку</option>
              <option value="studio">студию</option>
              <option value="room">комнату</option>
              <option value="house">дом</option>
            </select>
          </span>
          в
          <span class="slot">
            <label class="visually-hidden" for="hero-city">Город</label>
            <select id="hero-city" v-model="hero.city">
              <option value="Санкт-Петербург">Петербурге</option>
              <option value="Москва">Москве</option>
              <option value="Казань">Казани</option>
            </select>
          </span>
          до
          <span class="slot">
            <label class="visually-hidden" for="hero-price">Максимальная цена в тысячах рублей</label>
            <input id="hero-price" v-model.number="hero.max" type="number" inputmode="numeric" min="10" max="999" step="1">
          </span>
          тысяч в месяц
        </p>

        <div class="hero-actions">
          <button class="btn btn-primary btn-lg px-4" type="submit">Показать варианты</button>
          <p class="hero-note">Объявления только от владельцев. Каждого проверяем по документам на квартиру.</p>
        </div>
      </form>
    </div>
  </section>

  <section class="section" aria-labelledby="fresh-title">
    <div class="container">
      <div class="section-head">
        <h2 id="fresh-title">Новые объявления</h2>
        <RouterLink class="fw-medium" :to="{ name: 'search' }">Все объявления</RouterLink>
      </div>

      <div v-if="error" class="empty-state">
        <h3 class="fs-5">Объявления не загрузились</h3>
        <p class="text-muted-2 mb-0">{{ error.message }}</p>
      </div>

      <ListingGrid v-else :listings="fresh" :pending="pending" />
    </div>
  </section>

  <section class="section pt-0" aria-labelledby="districts-title">
    <div class="container">
      <h2 id="districts-title" class="mb-3">Районы Петербурга</h2>
      <div class="districts">
        <RouterLink
          v-for="district in DISTRICTS"
          :key="district"
          :to="{ name: 'search', query: { city: 'Санкт-Петербург', q: district } }"
        >
          {{ district }}
        </RouterLink>
      </div>
    </div>
  </section>

  <section class="section pt-0" aria-labelledby="how-title">
    <div class="container">
      <h2 id="how-title" class="mb-4">Как снять квартиру через Ключи</h2>
      <ol class="steps">
        <li>
          <h3>Выберите вариант</h3>
          <p>Фильтруйте по цене, району и условиям. Сохраняйте понравившиеся квартиры в избранное.</p>
        </li>
        <li>
          <h3>Договоритесь о просмотре</h3>
          <p>Пишите владельцу в чат на сайте. Ваш телефон он увидит, только когда вы сами его отправите.</p>
        </li>
        <li>
          <h3>Подпишите договор онлайн</h3>
          <p>Шаблон договора и акт приёма-передачи готовы заранее. Подпись через Госуслуги.</p>
        </li>
        <li>
          <h3>Платите через сервис</h3>
          <p>Депозит хранится у нас до конца аренды, поэтому владелец вернёт его без споров.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="section pt-0" aria-labelledby="landlord-title">
    <div class="container">
      <div class="landlord-band d-lg-flex justify-content-between align-items-center gap-4">
        <div>
          <h2 id="landlord-title">Сдаёте квартиру?</h2>
          <p class="mb-lg-0">
            Разместите объявление бесплатно. Мы проверим арендатора по паспорту и истории платежей,
            а договор и акт подготовим сами.
          </p>
        </div>
        <RouterLink class="btn btn-tag btn-lg px-4 flex-shrink-0" :to="{ name: 'profile', hash: '#landlord' }">
          Разместить объявление
        </RouterLink>
      </div>
    </div>
  </section>
</template>
