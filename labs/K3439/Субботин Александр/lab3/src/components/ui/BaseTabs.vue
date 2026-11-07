<script setup>
import { nextTick, useTemplateRef } from 'vue'

// Вкладки по паттерну WAI-ARIA Tabs: активная вкладка в порядке Tab, между вкладками — стрелками,
// Home/End — к первой и последней. Содержимое каждой вкладки — именованный слот с её id
const props = defineProps({
  tabs: { type: Array, required: true },
})
const active = defineModel({ type: String, required: true })

const buttons = useTemplateRef('buttons')

function select(index) {
  const tab = props.tabs[(index + props.tabs.length) % props.tabs.length]
  active.value = tab.id
  nextTick(() => buttons.value.find((button) => button.id === `${tab.id}-tab`)?.focus())
}

function onKeydown(event) {
  const current = props.tabs.findIndex((tab) => tab.id === active.value)
  const moves = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: props.tabs.length - 1 }
  if (!(event.key in moves)) return
  event.preventDefault()
  select(moves[event.key])
}
</script>

<template>
  <ul class="nav nav-tabs mb-4" role="tablist" @keydown="onKeydown">
    <li v-for="tab in tabs" :key="tab.id" class="nav-item" role="presentation">
      <button
        :id="`${tab.id}-tab`"
        ref="buttons"
        class="nav-link"
        :class="{ active: active === tab.id }"
        type="button"
        role="tab"
        :aria-controls="tab.id"
        :aria-selected="String(active === tab.id)"
        :tabindex="active === tab.id ? 0 : -1"
        @click="active = tab.id"
      >
        {{ tab.label }}
      </button>
    </li>
  </ul>

  <div class="tab-content">
    <div
      v-for="tab in tabs"
      :id="tab.id"
      :key="tab.id"
      class="tab-pane"
      :class="{ 'active show': active === tab.id }"
      role="tabpanel"
      :aria-labelledby="`${tab.id}-tab`"
      tabindex="0"
    >
      <slot :name="tab.id" />
    </div>
  </div>
</template>
