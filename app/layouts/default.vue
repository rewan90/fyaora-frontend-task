<template>
  <div>
    <!-- Top Navbar -->
    <header class="top-navbar">
      <button class="top-nav-toggle" @click="toggleTopNav" aria-label="Toggle navigation">
        <i class="bi" :class="isTopNavOpen ? 'bi-x-lg' : 'bi-list'"></i>
      </button>
      <nav class="nav-links" :class="{ 'open': isTopNavOpen }">
        <a href="#">Service Dashboard</a>
        <a href="#">Finance Forecast</a>
        <a href="#" class="active">Human Resources</a>
        <a href="#">Users</a>
        <a href="#">Compliances &amp; Verification</a>
      </nav>
      <div class="navbar-right">
        <span class="navbar-icon"><i class="bi bi-bell"></i></span>
        <span class="navbar-icon"><i class="bi bi-chat-square-text"></i></span>
        <div class="user-profile">
          <div class="user-avatar">MS</div>
          <div class="user-info">
            <div class="user-name">Max Smith</div>
            <div class="user-location">London, UK</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="main-layout">
      <slot />
    </div>

    <!-- Toast Container -->
    <div class="toast-container">
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

    <!-- Sidebar Toggle (mobile) -->
    <button class="sidebar-toggle" @click="toggleSidebar" aria-label="Toggle sidebar filters">
      <i class="bi bi-funnel"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
const toasts = useState<Array<{ id: number; message: string; type: string; fading: boolean }>>('toasts', () => [])

const isTopNavOpen = ref(false)
const toggleTopNav = () => {
  isTopNavOpen.value = !isTopNavOpen.value
}

const toggleSidebar = () => {
  const sidebar = document.querySelector('.sidebar')
  const overlay = document.querySelector('.sidebar-overlay')
  sidebar?.classList.toggle('open')
  overlay?.classList.toggle('open')
}

// Provide toast function globally
const addToast = (message: string, type: string = 'success') => {
  const id = Date.now()
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
</script>
