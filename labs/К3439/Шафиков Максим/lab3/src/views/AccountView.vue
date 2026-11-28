<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api.js';
import { useSession } from '../composables/useSession.js';
import { useResource } from '../composables/useResource.js';
import { useAction } from '../composables/useAction.js';
import ActivityList from '../components/ActivityList.vue';
import PlanDialog from '../components/PlanDialog.vue';
import LoadState from '../components/LoadState.vue';
import AppIcon from '../components/AppIcon.vue';

const route = useRoute();
const router = useRouter();
const { profile, restoring } = useSession();
const { data: account, pending, error, reload } = useResource(async () => {
  const [workouts, activity] = await Promise.all([api.workouts(), api.activity()]);
  return { workouts, activity };
}, () => profile.value?.id);

const { pending: changing, error: changeError, run: change } = useAction();
const { pending: saving, error: saveError, run: save } = useAction();
const feedback = ref('');
const dialog = ref(null);
const addButton = ref(null);

const indexedWorkouts = computed(() => new Map(account.value?.workouts.map(workout => [workout.id, workout])));
const plan = computed(() => presentEntries(account.value?.activity.plan, 1));
const history = computed(() => presentEntries(account.value?.activity.completed, -1));
const minutes = computed(() => history.value.reduce((sum, entry) => sum + (entry.details?.minutes ?? 0), 0));

function presentEntries(entries = [], order) {
  return entries.map(entry => ({ ...entry, details: indexedWorkouts.value.get(entry.workout) }))
    .sort((first, second) => order * first.date.localeCompare(second.date));
}

watch([dialog, () => route.query.plan], ([form, selection]) => {
  if (form && typeof selection === 'string' && indexedWorkouts.value.has(selection)) {
    form.open(selection);
    const { plan: _plan, ...query } = route.query;
    void router.replace({ name: 'account', query });
  }
}, { flush: 'post' });

function openPlan() {
  saveError.value = '';
  dialog.value?.open();
}

function restoreFocus() {
  addButton.value?.focus();
}

function savePlan(entry) {
  return save(() => api.addPlan(entry), activity => {
    account.value = { ...account.value, activity };
    feedback.value = 'Тренировка добавлена в план.';
    dialog.value?.close();
  });
}

function changePlan(id, action, message) {
  feedback.value = '';
  return change(() => action(id), async activity => {
    account.value = { ...account.value, activity };
    feedback.value = message;
    await nextTick();
    restoreFocus();
  });
}
</script>

<template>
  <section class="container site-width page-content">
    <div class="account-top">
      <div>
        <h1>Личный кабинет</h1>
        <p v-if="profile" class="muted mb-0">{{ profile.name }}</p>
      </div>
    </div>

    <p v-if="restoring" class="muted" role="status">Проверка сессии…</p>
    <template v-else-if="!profile">
      <p class="muted">Войдите, чтобы составить план и посмотреть историю тренировок.</p>
      <div class="d-flex flex-wrap gap-2">
        <RouterLink class="btn btn-primary" :to="{ name: 'login' }">Войти</RouterLink>
        <RouterLink class="btn btn-outline-secondary" :to="{ name: 'register' }">Создать аккаунт</RouterLink>
      </div>
    </template>
    <LoadState v-else :pending="pending" :error="error" @retry="reload">
      <template v-if="account">
        <dl class="metrics">
          <div><dt>Выполнено</dt><dd>{{ history.length }}</dd></div>
          <div><dt>Минут занятий</dt><dd>{{ minutes }}</dd></div>
          <div><dt>В плане</dt><dd>{{ plan.length }}</dd></div>
        </dl>
        <section class="mb-5" aria-labelledby="plan-heading">
          <div class="section-bar">
            <h2 id="plan-heading">План тренировок</h2>
            <button ref="addButton" class="btn btn-primary" type="button"
              :disabled="!account.workouts.length || changing" @click="openPlan">
              <AppIcon name="calendar" />Добавить в план
            </button>
          </div>
          <ActivityList :entries="plan" :pending="changing || saving" planned empty-text="В плане пока нет тренировок."
            @complete="id => changePlan(id, api.completePlan, 'Тренировка отмечена выполненной.')"
            @remove="id => changePlan(id, api.removePlan, 'Тренировка убрана из плана.')" />
        </section>
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" class="mb-3">История занятий</h2>
          <ActivityList :entries="history" empty-text="Здесь появятся выполненные тренировки." />
        </section>
        <p class="muted mt-3" role="status">{{ feedback }}</p>
        <p v-if="changeError" class="form-error" role="alert">{{ changeError }}</p>
        <PlanDialog ref="dialog" :workouts="account.workouts" :pending="saving" :error="saveError"
          @save="savePlan" @closed="restoreFocus" />
      </template>
    </LoadState>
  </section>
</template>
