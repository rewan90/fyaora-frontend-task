<template>
  <transition name="um-menu-fade">
    <div
      v-if="isOpen"
      class="um-overlay-panel"
      id="user-management-menu"
      ref="panelRef"
    >
      <!-- Overlay Header -->
      <div class="um-overlay-header">
        <h2 class="um-overlay-title">User Management</h2>
        <button class="um-close-btn" @click="$emit('close')" aria-label="Close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Service Providers Section -->
      <div class="um-section">
        <div class="um-section-label">Service Providers</div>
        <nav class="um-nav">
          <a
            v-for="item in navItems"
            :key="item.id"
            href="#"
            :class="['um-nav-item', { active: item.active }]"
            @click.prevent="handleNavClick(item)"
          >
            <i :class="item.icon" class="um-nav-icon"></i>
            <span class="um-nav-text">{{ item.label }}</span>
            <i v-if="item.active" class="bi bi-check2 um-nav-check"></i>
          </a>
        </nav>
      </div>

      <!-- Customers Section -->
      <div class="um-section">
        <div class="um-section-label">Customers</div>
        <nav class="um-nav">
          <a
            v-for="item in customerItems"
            :key="item.id"
            href="#"
            :class="['um-nav-item', { active: item.active }]"
            @click.prevent="handleCustomerClick(item)"
          >
            <i :class="item.icon" class="um-nav-icon"></i>
            <span class="um-nav-text">{{ item.label }}</span>
            <i v-if="item.active" class="bi bi-check2 um-nav-check"></i>
          </a>
        </nav>
      </div>

      <!-- Quotes Status Section -->
      <div class="um-section">
        <div class="um-section-label">Quotes Status</div>
        <nav class="um-nav">
          <a
            v-for="item in quotesItems"
            :key="item.id"
            href="#"
            :class="['um-nav-item', { active: item.active }]"
            @click.prevent="handleQuotesClick(item)"
          >
            <i :class="item.icon" class="um-nav-icon"></i>
            <span class="um-nav-text">{{ item.label }}</span>
            <i v-if="item.active" class="bi bi-check2 um-nav-check"></i>
          </a>
        </nav>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface MenuItem {
  id: string
  label: string
  icon: string
  active: boolean
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const panelRef = ref<HTMLElement | null>(null)

const navItems = ref<MenuItem[]>([
  { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-grid-1x2', active: false },
  { id: 'user-management', label: 'User Management', icon: 'bi bi-people', active: true },
  { id: 'analytics', label: 'Analytics', icon: 'bi bi-bar-chart-line', active: false },
  { id: 'settings', label: 'Settings', icon: 'bi bi-gear', active: false },
  { id: 'canceled', label: 'Canceled', icon: 'bi bi-x-circle', active: false }
])

const customerItems = ref<MenuItem[]>([
  { id: 'accepted-quotes', label: 'Accepted Quotes', icon: 'bi bi-check2', active: false },
  { id: 'pending-quotes', label: 'Pending Quotes', icon: 'bi bi-clock', active: false },
  { id: 'declined-quotes', label: 'Declined Quotes', icon: 'bi bi-x-circle', active: false }
])

const quotesItems = ref<MenuItem[]>([
  { id: 'issues', label: 'Issues', icon: 'bi bi-gear', active: false }
])

const setAllInactive = () => {
  navItems.value.forEach(i => (i.active = false))
  customerItems.value.forEach(i => (i.active = false))
  quotesItems.value.forEach(i => (i.active = false))
}

const handleNavClick = (item: MenuItem) => {
  setAllInactive()
  item.active = true
}

const handleCustomerClick = (item: MenuItem) => {
  setAllInactive()
  item.active = true
}

const handleQuotesClick = (item: MenuItem) => {
  setAllInactive()
  item.active = true
}

// Close on click outside
const onClickOutside = (e: MouseEvent) => {
  if (
    panelRef.value &&
    !panelRef.value.contains(e.target as Node) &&
    !(e.target as HTMLElement).closest('#user-management-toggle')
  ) {
    emit('close')
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      nextTick(() => {
        document.addEventListener('click', onClickOutside)
      })
    } else {
      document.removeEventListener('click', onClickOutside)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.um-overlay-panel {
  position: absolute;
  top: -10px;
  left: -15px;
  width: 270px;
  background: var(--sidebar-bg, #F4F7F9);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  padding: 18px 14px 20px;
  border: 1px solid var(--border-color, #DFE3E8);
}

.um-overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.um-overlay-title {
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  margin: 0;
}

.um-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #9CA3AF);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.um-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary, #111827);
}

/* Sections */
.um-section {
  margin-bottom: 20px;
}

.um-section:last-child {
  margin-bottom: 0;
}

.um-section-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #6B7280);
  background: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  display: block;
}

/* Navigation */
.um-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.um-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #6B7280);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.um-nav-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-primary, #111827);
}

.um-nav-item.active {
  color: var(--text-primary, #111827);
  font-weight: 600;
}

.um-nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  color: var(--text-muted, #9CA3AF);
  transition: color 0.15s ease;
}

.um-nav-item.active .um-nav-icon {
  color: var(--text-primary, #111827);
}

.um-nav-item:hover .um-nav-icon {
  color: var(--text-secondary, #6B7280);
}

.um-nav-text {
  flex: 1;
}

.um-nav-check {
  font-size: 16px;
  color: var(--text-primary, #111827);
}

/* Transition */
.um-menu-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.um-menu-fade-leave-active {
  transition: all 0.2s ease-in;
}

.um-menu-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.um-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
