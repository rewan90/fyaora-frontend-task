<template>
  <div id="app">
    <!-- Top Navbar -->
    <nav class="top-navbar" id="top-navbar">
      <div class="nav-links">
        <a href="#" id="nav-service-dashboard">Service Dashboard</a>
        <a href="#" id="nav-finance-forecast">Finance Forecast</a>
        <a href="#" class="active" id="nav-human-resources">Human Resources</a>
        <a href="#" id="nav-users">Users</a>
        <a href="#" id="nav-compliances">Compliances &amp; Verification</a>
      </div>
      <div class="navbar-right">
        <i class="bi bi-bell navbar-icon" id="navbar-notifications"></i>
        <i class="bi bi-chat-dots navbar-icon" id="navbar-messages"></i>
        <div class="user-profile" id="navbar-user-profile">
          <div class="user-avatar">MS</div>
          <div class="user-info">
            <div class="user-name">Max Smith</div>
            <div class="user-location">London, UK</div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Layout -->
    <NuxtPage />

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
