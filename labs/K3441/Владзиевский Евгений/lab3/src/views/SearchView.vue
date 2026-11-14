<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import FilterSidebar from '../components/FilterSidebar.vue';
import ListingGrid from '../components/ListingGrid.vue';
import ThePagination from '../components/ThePagination.vue';
import EmptyState from '../components/EmptyState.vue';
import AppIcon from '../components/AppIcon.vue';
import { useListingSearch, PER_PAGE } from '../composables/useListingSearch.js';
import { useFormat } from '../composables/useFormat.js';

const { filters, page, total, listings, error, pending, reset } = useListingSearch();
const { plural } = useFormat();

const view = ref('grid');

const title = computed(() => filters.city ? `Аренда жилья: ${filters.city}` : 'Аренда жилья');
const summary = computed(() => pending.value ? 'Ищем…' : `Найдено ${total.value} ${plural(total.value)}`);
</script>

<template>
  <div class="search-top">
    <div class="container">
      <nav aria-label="Навигационная цепочка">
        <ol class="breadcrumb small mb-2">
          <li class="breadcrumb-item"><RouterLink :to="{ name: 'home' }">Главная</RouterLink></li>
          <li class="breadcrumb-item active" aria-current="page">Поиск</li>
        </ol>
      </nav>

      <h1 id="search-title" class="mb-3">{{ title }}</h1>

      <form class="row g-2" role="search" aria-label="Быстрый поиск по городу и адресу" @submit.prevent>
        <div class="col-md">
          <label class="visually-hidden" for="q">Район, метро или улица</label>
          <div class="input-group input-group-lg">
            <span class="input-group-text bg-transparent"><AppIcon name="search" /></span>
            <input id="q" v-model.trim="filters.q" class="form-control" type="search" placeholder="Район, метро или улица">
          </div>
        </div>
        <div class="col-6 col-md-3">
          <label class="visually-hidden" for="city">Город</label>
          <select id="city" v-model="filters.city" class="form-select form-select-lg">
            <option value="">Все города</option>
            <option>Санкт-Петербург</option>
            <option>Москва</option>
            <option>Казань</option>
          </select>
        </div>
        <div class="col-6 col-md-auto">
          <button class="btn btn-primary btn-lg w-100" type="submit">Найти</button>
        </div>
      </form>
    </div>
  </div>

  <div class="container py-4">
    <div class="row g-4">
      <aside class="col-lg-3">
        <FilterSidebar :filters="filters" @reset="reset" />
      </aside>

      <section class="col-lg-9" aria-labelledby="results-count">
        <div class="results-bar">
          <p id="results-count" class="m-0 fw-medium" aria-live="polite">{{ summary }}</p>

          <div class="d-flex flex-wrap gap-2 align-items-center">
            <button class="btn btn-outline-secondary d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#filters" aria-controls="filters">
              <AppIcon name="sliders" /> Фильтры
            </button>

            <label class="visually-hidden" for="sort">Сортировка</label>
            <select id="sort" v-model="filters.sort" class="form-select w-auto">
              <option value="new">Сначала новые</option>
              <option value="cheap">Сначала дешёвые</option>
              <option value="expensive">Сначала дорогие</option>
              <option value="area">По площади</option>
            </select>

            <div class="btn-group d-none d-sm-inline-flex" role="group" aria-label="Вид списка">
              <input id="view-grid" v-model="view" class="btn-check" type="radio" value="grid">
              <label class="btn btn-outline-secondary" for="view-grid" title="Плиткой">
                <AppIcon name="grid" /><span class="visually-hidden">Плиткой</span>
              </label>
              <input id="view-list" v-model="view" class="btn-check" type="radio" value="list">
              <label class="btn btn-outline-secondary" for="view-list" title="Списком">
                <AppIcon name="list" /><span class="visually-hidden">Списком</span>
              </label>
            </div>
          </div>
        </div>

        <EmptyState v-if="error" title="Не удалось загрузить объявления" :text="error.message" />

        <template v-else>
          <ListingGrid
            :listings="listings"
            :pending="pending"
            :row="view === 'list'"
            columns="col-sm-6 col-xl-4"
          />

          <EmptyState
            v-if="!pending && listings.length === 0"
            title="По этим условиям ничего нет"
            text="Попробуйте поднять цену или убрать часть условий."
          >
            <button class="btn btn-primary" type="button" @click="reset">Сбросить фильтры</button>
          </EmptyState>

          <ThePagination :page="page" :total="total" :per-page="PER_PAGE" @update:page="page = $event" />
        </template>
      </section>
    </div>
  </div>
</template>
