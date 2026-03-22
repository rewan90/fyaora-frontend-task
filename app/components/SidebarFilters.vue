<template>
  <aside class="sidebar" id="sidebar-filters">
    <!-- Brand -->
    <div class="sidebar-brand">
      <img src="~/assets/images/logo.png" alt="gler logo" class="brand-logo-img" />
    </div>

    <!-- User Management Section -->
     
    <div class="sidebar-section" style="position: relative;">
      <div
        class="sidebar-section-title sidebar-main-heading"
        @click="toggleUserManagementMenu"
        style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;"
        id="user-management-toggle"
      >
        <span>User Management</span>
        <i
          :style="{ transform: isUserManagementMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease', fontSize: '14px' }"
        ></i>
      </div>
      <UserManagementMenu
        :isOpen="isUserManagementMenuOpen"
        @close="isUserManagementMenuOpen = false"
      />
    </div>

    <!-- Postcode -->
    <div class="filter-group">
      <label class="sidebar-label">Postcode</label>
      <input
        v-model="localFilters.postcode"
        type="text"
        class="sidebar-input"
        placeholder="ZIP"
        id="filter-postcode"
      />
    </div>

    <!-- Registration Status -->
    <div class="filter-group">
      <label class="sidebar-label">Registration Status</label>
      <label class="filter-checkbox">
        <input type="checkbox" v-model="localFilters.statusOnboarded" id="filter-status-onboarded" />
        Onboarded
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" v-model="localFilters.statusRejected" id="filter-status-rejected" />
        Rejected
      </label>
    </div>

    <!-- Date Registered -->
    <div class="filter-group">
      <label class="sidebar-label">Date Registered</label>
      <div class="date-range">
        <div
          class="date-input-wrapper"
          data-placeholder="Start"
          :class="{ 'has-value': localFilters.startDate }"
        >
          <label>Date</label>
          <input
            v-model="localFilters.startDate"
            type="date"
            class="sidebar-input"
            id="filter-start-date"
          />
          <div class="date-hint">MM/DD/YYYY</div>
        </div>
        <div
          class="date-input-wrapper"
          data-placeholder="End"
          :class="{ 'has-value': localFilters.endDate }"
        >
          <label>Date</label>
          <input
            v-model="localFilters.endDate"
            type="date"
            class="sidebar-input"
            id="filter-end-date"
          />
          <div class="date-hint">MM/DD/YYYY</div>
        </div>
      </div>
    </div>

    <!-- Vendor Type -->
    <div class="filter-group">
      <label class="sidebar-label">Vendor Type</label>
      <label class="filter-checkbox">
        <input type="checkbox" v-model="localFilters.vendorIndependent" id="filter-vendor-independent" />
        Independent
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" v-model="localFilters.vendorCompany" id="filter-vendor-company" />
        Company
      </label>
    </div>

    <!-- Service Offering -->
    <div class="filter-group">
      <label class="sidebar-label">Service Offering</label>
      <label class="filter-checkbox">
        <input type="checkbox" v-model="localFilters.serviceHousekeeping" id="filter-service-housekeeping" />
        Housekeeping
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" v-model="localFilters.serviceWindowCleaning" id="filter-service-window-cleaning" />
        Window Cleaning
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" v-model="localFilters.serviceCarValet" id="filter-service-car-valet" />
        Car Valet
      </label>
    </div>

    <!-- Buttons -->
    <button class="btn-filter" @click="applyFilters" id="btn-apply-filters">
      Filter
    </button>
    <button v-show="hasActiveFilters" class="btn-clear-filters" @click="clearFilters" id="btn-clear-filters">
      Clear Filters
    </button>
  </aside>

  <!-- Sidebar Overlay (mobile) -->
  <div class="sidebar-overlay" @click="closeSidebar"></div>
</template>

<script setup lang="ts">
interface FilterState {
  postcode: string
  statusOnboarded: boolean
  statusRejected: boolean
  startDate: string
  endDate: string
  vendorIndependent: boolean
  vendorCompany: boolean
  serviceHousekeeping: boolean
  serviceWindowCleaning: boolean
  serviceCarValet: boolean
}

const emit = defineEmits<{
  (e: 'apply', filters: Record<string, string>): void
  (e: 'clear'): void
}>()

const addToast = inject<(message: string, type?: string) => void>('addToast')

const isUserManagementMenuOpen = ref(false)

const toggleUserManagementMenu = () => {
  isUserManagementMenuOpen.value = !isUserManagementMenuOpen.value
}

const localFilters = reactive<FilterState>({
  postcode: '',
  statusOnboarded: false,
  statusRejected: false,
  startDate: '',
  endDate: '',
  vendorIndependent: false,
  vendorCompany: false,
  serviceHousekeeping: false,
  serviceWindowCleaning: false,
  serviceCarValet: false
})

const hasActiveFilters = computed(() => {
  return (
    localFilters.postcode.trim() !== '' ||
    localFilters.statusOnboarded ||
    localFilters.statusRejected ||
    localFilters.startDate !== '' ||
    localFilters.endDate !== '' ||
    localFilters.vendorIndependent ||
    localFilters.vendorCompany ||
    localFilters.serviceHousekeeping ||
    localFilters.serviceWindowCleaning ||
    localFilters.serviceCarValet
  )
})

const applyFilters = () => {
  const filters: Record<string, string> = {}

  if (localFilters.postcode.trim()) {
    filters.postcode = localFilters.postcode.trim()
  }

  const statusList: string[] = []
  if (localFilters.statusOnboarded) statusList.push('Onboarded')
  if (localFilters.statusRejected) statusList.push('Rejected')
  if (statusList.length) filters.status = statusList.join(',')

  if (localFilters.startDate) filters.startDate = localFilters.startDate
  if (localFilters.endDate) filters.endDate = localFilters.endDate

  const vendorList: string[] = []
  if (localFilters.vendorIndependent) vendorList.push('Independent')
  if (localFilters.vendorCompany) vendorList.push('Company')
  if (vendorList.length) filters.vendorType = vendorList.join(',')

  const serviceList: string[] = []
  if (localFilters.serviceHousekeeping) serviceList.push('Housekeeping')
  if (localFilters.serviceWindowCleaning) serviceList.push('Window Cleaning')
  if (localFilters.serviceCarValet) serviceList.push('Car Valet')
  if (serviceList.length) filters.serviceOffering = serviceList.join(',')

  emit('apply', filters)
  closeSidebar()
  addToast?.('Filters applied successfully!', 'success')
}

const clearFilters = () => {
  localFilters.postcode = ''
  localFilters.statusOnboarded = false
  localFilters.statusRejected = false
  localFilters.startDate = ''
  localFilters.endDate = ''
  localFilters.vendorIndependent = false
  localFilters.vendorCompany = false
  localFilters.serviceHousekeeping = false
  localFilters.serviceWindowCleaning = false
  localFilters.serviceCarValet = false
  emit('clear')
  closeSidebar()
  addToast?.('Filters cleared', 'info')
}

const closeSidebar = () => {
  document.querySelector('.sidebar')?.classList.remove('open')
  document.querySelector('.sidebar-overlay')?.classList.remove('open')
  document.querySelector('.sidebar-wrapper')?.classList.remove('open')
}
</script>
