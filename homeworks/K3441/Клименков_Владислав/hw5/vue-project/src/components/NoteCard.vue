<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex w-100 justify-content-between align-items-start gap-2">
        <h5 class="card-title">{{ name }}</h5>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <span class="text-muted" :title="dateTitle">{{ formattedDate }}</span>
          <button
            type="button"
            class="btn-close"
            aria-label="Удалить заметку"
            title="Удалить заметку"
            @click="$emit('delete')"
          ></button>
        </div>
      </div>
      <p class="card-text">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script>
import useDateFormat from '@/composables/useDateFormat'
import useIntlRelativeDateFormat from '@/composables/useIntlRelativeDateFormat'

export default {
  name: 'NoteCard',

  emits: ['delete'],

  props: {
    name: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: false,
      default: ''
    },
    createdAt: {
      type: String,
      required: false,
      default: ''
    }
  },

  setup(props) {
    const formattedDate = useIntlRelativeDateFormat(props.createdAt)
    const dateTitle = useDateFormat(props.createdAt)

    return { formattedDate, dateTitle }
  }
}
</script>
