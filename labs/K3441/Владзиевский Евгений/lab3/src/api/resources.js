// Тонкая прослойка над http: названия вместо адресов.
// Компоненты не собирают URL руками — они вызывают эти функции.

import { http, ApiError } from './http.js';

const data = (response) => response.data;

// ---------- Авторизация ----------
export const login = (email, password) => http.post('/login', { email, password }).then(data);
export const register = (fields) => http.post('/register', fields).then(data);

// ---------- Объявления ----------
export const fetchListings = (params = {}) =>
  http.get('/listings', { params }).then((response) => ({
    items: response.data,
    // json-server кладёт общее число записей в заголовок
    total: Number(response.headers['x-total-count'] ?? response.data.length)
  }));

export const fetchListing = (id) => http.get(`/listings/${id}`).then(data);
export const createListing = (body) => http.post('/listings', body).then(data);
export const updateListing = (id, body) => http.patch(`/listings/${id}`, body).then(data);
export const deleteListing = (id) => http.delete(`/listings/${id}`).then(data);

// ---------- Владельцы и отзывы ----------
export const fetchOwner = (id) => http.get(`/owners/${id}`).then(data);
export const fetchOwners = () => http.get('/owners').then(data);
export const fetchReviews = (ownerId) =>
  http.get('/reviews', { params: { ownerId, _sort: 'date', _order: 'desc' } }).then(data);

// ---------- Личные коллекции ----------
//
// Охранник json-server-auth на запрос всей коллекции проверяет владельца
// через Array.some(): достаточно одной своей записи — и коллекция уйдёт
// целиком (в исходниках помечено как «too relax»). Поэтому фильтр по
// userId ставим сами. Обратная сторона: если своих записей нет вовсе,
// some() даёт false и сервер отвечает 403 — для списка это просто «пусто».
function mine(resource) {
  return async (userId, params = {}) => {
    try {
      return await http.get(resource, { params: { userId, ...params } }).then(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) return [];
      throw error;
    }
  };
}

export const fetchFavorites = mine('/favorites');
export const fetchRentals = mine('/rentals');
export const fetchRequests = mine('/requests');
export const fetchDialogs = mine('/dialogs');
export const fetchDeals = mine('/deals');

export const addFavorite = (userId, listingId) =>
  http.post('/favorites', { userId, listingId: Number(listingId) }).then(data);
export const removeFavorite = (id) => http.delete(`/favorites/${id}`).then(data);

export const createDialog = (body) => http.post('/dialogs', body).then(data);
export const updateDialog = (id, body) => http.patch(`/dialogs/${id}`, body).then(data);
export const createMessage = (body) => http.post('/messages', body).then(data);
export const createDeal = (body) => http.post('/deals', body).then(data);
export const createViewing = (body) => http.post('/viewings', body).then(data);
export const updateRequest = (id, body) => http.patch(`/requests/${id}`, body).then(data);
export const updateUser = (id, body) => http.patch(`/users/${id}`, body).then(data);
