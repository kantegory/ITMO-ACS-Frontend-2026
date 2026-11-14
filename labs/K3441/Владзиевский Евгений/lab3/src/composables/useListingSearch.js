// Поиск объявлений: состояние фильтров, перевод их в параметры запроса,
// пагинация и синхронизация с адресной строкой.
//
// Всё это нужно и странице поиска, и переходам с главной (?type=flat2&max=65),
// поэтому вынесено из компонента.

import { reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as api from '../api/resources.js';
import { useAsync } from './useAsync.js';

export const PER_PAGE = 6;

const SORTS = {
  new: { _sort: 'posted', _order: 'desc' },
  cheap: { _sort: 'price', _order: 'asc' },
  expensive: { _sort: 'price', _order: 'desc' },
  area: { _sort: 'area', _order: 'desc' }
};

function emptyFilters() {
  return {
    types: ['flat', 'studio', 'room', 'house'],
    rooms: [],
    min: '',
    max: '',
    area: '',
    city: '',
    q: '',
    nocommission: false,
    pets: false,
    kids: false,
    furniture: false,
    balcony: false,
    sort: 'new'
  };
}

export function useListingSearch() {
  const route = useRoute();
  const router = useRouter();

  const filters = reactive(emptyFilters());
  const page = ref(1);
  const total = ref(0);

  // Параметры с главной: ?type=flat2 значит «двухкомнатная квартира»
  function applyRouteQuery() {
    const query = route.query;
    if (query.type) {
      const base = String(query.type).replace(/\d/, '');
      if (filters.types.includes(base)) filters.types = [base];
      const rooms = String(query.type).match(/\d/);
      if (rooms) filters.rooms = [Number(rooms[0])];
    }
    if (query.city) filters.city = String(query.city);
    if (query.q) filters.q = String(query.q);
    if (query.max) {
      const max = Number(query.max);
      filters.max = max < 1000 ? max * 1000 : max;
    }
  }

  // Что из фильтров json-server умеет посчитать сам
  function toParams() {
    const params = {
      type: filters.types,
      price_gte: filters.min || undefined,
      price_lte: filters.max || undefined,
      area_gte: filters.area || undefined,
      city: filters.city || undefined,
      q: filters.q.trim() || undefined,
      ...SORTS[filters.sort],
      _page: page.value,
      _limit: PER_PAGE
    };
    if (filters.nocommission) params.commission = 0;
    for (const key of ['pets', 'kids', 'furniture', 'balcony']) {
      if (filters[key]) params[key] = true;
    }

    // Комнаты: 1–3 уходят списком значений, «4+» — это диапазон.
    // В один запрос json-server их не соберёт.
    const plain = filters.rooms.filter((r) => r < 4);
    const hasFourPlus = filters.rooms.includes(4);
    if (plain.length && !hasFourPlus) params.rooms = plain;
    if (hasFourPlus && !plain.length) params.rooms_gte = 4;

    return { params, mixedRooms: hasFourPlus && plain.length > 0 };
  }

  const { data: listings, error, pending, run } = useAsync(async () => {
    const { params, mixedRooms } = toParams();

    // Редкий случай «выбраны и 2, и 4+»: берём всё по остальным фильтрам
    // и отбираем комнаты на клиенте.
    if (mixedRooms) {
      const { _page, _limit, ...rest } = params;
      const { items } = await api.fetchListings(rest);
      const filtered = items.filter((l) =>
        filters.rooms.some((r) => (r === 4 ? l.rooms >= 4 : l.rooms === r)));
      total.value = filtered.length;
      return filtered.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE);
    }

    const { items, total: count } = await api.fetchListings(params);
    total.value = count;
    return items;
  }, { initial: [] });

  function reset() {
    Object.assign(filters, emptyFilters());
    page.value = 1;
  }

  // Фильтры живут в адресе: страницу можно переслать ссылкой
  function pushQuery() {
    const query = {};
    if (filters.city) query.city = filters.city;
    if (filters.q) query.q = filters.q;
    if (filters.max) query.max = filters.max;
    if (page.value > 1) query.page = page.value;
    router.replace({ query });
  }

  let first = true;
  watch(filters, () => {
    if (!first) page.value = 1;
    run();
    pushQuery();
  });
  watch(page, () => {
    run();
    pushQuery();
  });

  applyRouteQuery();
  if (route.query.page) page.value = Number(route.query.page) || 1;
  first = false;
  run();

  return { filters, page, total, listings, error, pending, reload: run, reset };
}
