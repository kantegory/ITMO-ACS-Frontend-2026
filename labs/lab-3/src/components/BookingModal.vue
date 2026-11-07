<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useAsync } from "../composables/useAsync";
import { createBooking } from "../api/bookings";

const props = defineProps({
  restaurant: { type: Object, required: true }
});

const emit = defineEmits(["booked"]);

const router = useRouter();
const { user } = useAuth();
const form = reactive({ date: "", time: "", guests: 2, comment: "" });
const { error, loading, run } = useAsync(createBooking);
let modalInstance = null;

async function submit() {
  if (!user.value) {
    router.push("/login");
    return;
  }

  try {
    await run({
      restaurantId: props.restaurant.id,
      restaurantName: props.restaurant.name,
      date: form.date,
      time: form.time,
      guests: form.guests,
      comment: form.comment,
      status: "confirmed",
      userId: user.value.id
    });
    form.date = "";
    form.time = "";
    form.guests = 2;
    form.comment = "";
    modalInstance?.hide();
    emit("booked");
  } catch (e) {
    // ошибка уже отражена в error из useAsync
  }
}

function onMounted(el) {
  modalInstance = new window.bootstrap.Modal(el);
}
</script>

<template>
  <div class="modal fade" id="bookingModal" tabindex="-1" aria-hidden="true" :ref="(el) => el && onMounted(el)">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="submit">
          <div class="modal-header">
            <h5 class="modal-title">Бронирование столика</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="!user" class="alert alert-info">
              Чтобы забронировать столик, <router-link to="/login">войдите в аккаунт</router-link>.
            </div>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div class="mb-3">
              <label class="form-label">Дата</label>
              <input type="date" class="form-control" v-model="form.date" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Время</label>
              <input type="time" class="form-control" v-model="form.time" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Количество гостей</label>
              <input type="number" class="form-control" v-model.number="form.guests" min="1" max="20" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Комментарий</label>
              <textarea class="form-control" v-model="form.comment" rows="2" placeholder="Например: столик у окна"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="submit" class="btn btn-brand" :disabled="!user || loading">Забронировать</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
