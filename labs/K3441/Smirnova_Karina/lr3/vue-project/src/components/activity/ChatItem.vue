<script setup>
defineProps({
  chat:{
    type:Object,
    required:true
  },
  active:Boolean
})
defineEmits(['select'])
</script>

<template>
  <button
      :class="['chat-item',{active}]"
      type="button"
      :aria-pressed="active"
      @click="$emit('select')"
  >
    <img :src="`/${chat.listing.image}`" alt="" />
    <span class="chat-content">
      <span class="chat-meta">
        <strong>{{ chat.personName }}</strong>
        <small>{{ chat.lastTime }}</small>
      </span>
      <span>{{ chat.listing.title }}</span>
      <span class="chat-preview">{{ chat.lastMessage || 'Сообщений пока нет' }}</span>
    </span>
  </button>
</template>

<style scoped>
.chat-item{
  width:100%;
  display:grid;
  grid-template-columns:54px 1fr;
  gap:12px;
  padding:14px;
  border:0;
  border-bottom:1px solid var(--rs-border);
  background:transparent;
  color:var(--rs-text);
  text-align:left
}
.chat-item:hover, .chat-item.active{
  background:var(--rs-primary-soft)
}
.chat-item img{
  width:54px;
  height:54px;
  border-radius:10px;
  object-fit:cover
}
.chat-content,.chat-content span{
  display:block;
  min-width:0
}
.chat-meta{
  display:flex!important;
  justify-content:space-between;
  gap:10px
}
.chat-meta small,.chat-preview{
  color:var(--rs-muted);
  font-size:13px
}
.chat-preview{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap
}
</style>
