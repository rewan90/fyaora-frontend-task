<template>
  <div id="app">
    <!-- Main Layout -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Mobile Sidebar Toggle -->
    <button class="sidebar-toggle" @click="toggleSidebar" id="sidebar-toggle-btn">
      <i class="bi bi-funnel"></i>
    </button>

    <!-- Toast Container -->
    <div class="toast-container" id="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast-custom', `toast-${toast.type}`, { 'toast-fadeout': toast.fading }]"
        >
          <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-info-circle-fill'"></i>
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Toast {
  id: number
  message: string
  type: string
  fading: boolean
}

const toasts = ref<Toast[]>([])
let toastId = 0

const addToast = (message: string, type = 'success') => {
  const id = ++toastId
  toasts.value.push({ id, message, type, fading: false })

  setTimeout(() => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) toast.fading = true
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 300)
  }, 3000)
}

provide('addToast', addToast)

const toggleSidebar = () => {
  document.querySelector('.sidebar')?.classList.toggle('open')
  document.querySelector('.sidebar-overlay')?.classList.toggle('open')
}
</script>
