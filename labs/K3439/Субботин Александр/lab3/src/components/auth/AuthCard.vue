<script setup>
import { assetUrl } from '@/utils/format'

// Общая раскладка страниц входа и регистрации: цветная колонка с картинкой и форма
</script>

<template>
  <div class="auth-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-xl-10">
          <div class="auth-card row g-0">
            <aside class="col-lg-5 auth-aside d-none d-lg-flex">
              <slot name="aside" />
              <img class="auth-image" :src="assetUrl('img/hero.svg')" alt="" width="480" height="420">
            </aside>

            <div class="col-lg-7 auth-form">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
