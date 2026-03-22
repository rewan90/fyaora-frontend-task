<template>
  <div class="main-layout">
    <div class="m-5">
      <SidebarFilters @apply="applyFilters" @clear="clearFilters" />
    </div>

    <main class="content-area">
      <!-- Page Title -->
      <h1 class="page-title">Waitlist</h1>

      <!-- Top Bar: Tabs + Search -->
      <div class="top-bar">
        <div class="tab-switcher">
          <button
            class="tab-btn active"
            id="tab-service-providers"
          >
            Service Providers
          </button>
          <button
            class="tab-btn"
            id="tab-customers"
          >
            Customers
          </button>
        </div>

        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search User"
            @input="onSearch"
            id="search-input"
          />
          <i class="bi bi-search search-icon"></i>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-custom"></div>
      </div>

      <!-- Data Table -->
      <div v-else class="table-container">
        <table class="data-table" id="waitlist-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  id="select-all-checkbox"
                  aria-label="Select all rows"
                />
              </th>
              <th
                v-for="col in columns"
                :key="col.key"
                :class="{ sorted: sortBy === col.key }"
                @click="toggleSort(col.key)"
              >
                {{ col.label }}
                <span class="sort-icon">
                  <i :class="getSortIcon(col.key)"></i>
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="providers.length === 0">
              <td :colspan="columns.length + 2" style="text-align: center; padding: 40px; color: var(--text-muted);">
                No service providers found matching your criteria.
              </td>
            </tr>
            <tr
              v-for="provider in providers"
              :key="provider.id"
              :class="{ 'table-active': selectedIds.has(provider.id) }"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="selectedIds.has(provider.id)"
                  @change="toggleSelect(provider.id)"
                  :aria-label="`Select ${provider.email}`"
                />
              </td>
              <td>{{ provider.email }}</td>
              <td>{{ provider.phoneNumber }}</td>
              <td>{{ provider.postcode }}</td>
              <td>{{ provider.vendorType }}</td>
              <td>{{ provider.serviceOffering }}</td>
              <td>{{ provider.signupDate }}</td>
              <td>
                <span
                  v-if="provider.status === 'Onboarded'"
                  class="status-badge status-onboarded"
                >
                  Onboarded
                </span>
                <span
                  v-else-if="provider.status === 'Rejected'"
                  class="status-badge status-rejected"
                >
                  Rejected
                </span>
                <span v-else class="status-pending">-</span>
              </td>
              <td>
                <button
                  class="action-icon"
                  @click="openDetails(provider)"
                  :aria-label="`Edit ${provider.email}`"
                  :id="`edit-btn-${provider.id}`"
                >
                  <i class="bi bi-pencil"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && meta.totalPages > 1" class="pagination-wrapper" id="pagination">
        <button
          class="page-btn"
          :disabled="meta.page <= 1"
          @click="goToPage(meta.page - 1)"
          aria-label="Previous page"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <button
          v-for="p in paginationPages"
          :key="p"
          :class="['page-btn', { active: p === meta.page }]"
          @click="goToPage(p)"
          :aria-label="`Go to page ${p}`"
        >
          {{ p }}
        </button>
        <button
          class="page-btn"
          :disabled="meta.page >= meta.totalPages"
          @click="goToPage(meta.page + 1)"
          aria-label="Next page"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </main>

    <!-- User Details Modal -->
    <UserDetailsModal :user="selectedUser" @action="handleAction" />
  </div>
</template>

<script setup lang="ts">
interface ServiceProvider {
  id: number
  email: string
  phoneNumber: string
  postcode: string
  vendorType: string
  serviceOffering: string
  signupDate: string
  status: string
  companyName: string
  contactEmail: string
  contactPhone: string
  country: string
  customerType: string
  services: string[]
  notes: string
}

interface ApiMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
}

// State
const providers = ref<ServiceProvider[]>([])
const meta = ref<ApiMeta>({ total: 0, page: 1, perPage: 10, totalPages: 1 })
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')
const selectedIds = ref<Set<number>>(new Set())
const selectedUser = ref<ServiceProvider | null>(null)
const activeFilters = ref<Record<string, string>>({})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Table columns
const columns = [
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'postcode', label: 'Postcode' },
  { key: 'vendorType', label: 'Vendor Type' },
  { key: 'serviceOffering', label: 'Service Offering' },
  { key: 'signupDate', label: 'Signup Date' },
  { key: 'status', label: 'Status' }
]

// Computed
const allSelected = computed(() => {
  if (providers.value.length === 0) return false
  return providers.value.every(p => selectedIds.value.has(p.id))
})

const paginationPages = computed(() => {
  const total = meta.value.totalPages
  const current = meta.value.page
  const pages: number[] = []
  const maxVisible = 5

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)
  start = Math.max(1, end - maxVisible + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const fetchProviders = async () => {
  loading.value = true

  const params: Record<string, string> = {
    page: String(meta.value.page),
    perPage: '10',
    ...activeFilters.value
  }

  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }

  if (sortBy.value) {
    params.sortBy = sortBy.value
    params.sortDir = sortDir.value
  }

  try {
    const response = await $fetch<{ data: ServiceProvider[]; meta: ApiMeta }>('/api/service-providers', {
      params
    })
    providers.value = response.data
    meta.value = response.meta
  } catch (error) {
    console.error('Failed to fetch service providers:', error)
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    meta.value.page = 1
    fetchProviders()
  }, 300)
}

const toggleSort = (key: string) => {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortDir.value = 'asc'
  }
  fetchProviders()
}

const getSortIcon = (key: string) => {
  if (sortBy.value !== key) return 'bi bi-arrow-down-up'
  return sortDir.value === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(providers.value.map(p => p.id))
  }
}

const toggleSelect = (id: number) => {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedIds.value = newSet
}

const goToPage = (page: number) => {
  if (page < 1 || page > meta.value.totalPages) return
  meta.value.page = page
  selectedIds.value = new Set()
  fetchProviders()
}

const openDetails = async (provider: ServiceProvider) => {
  selectedUser.value = provider
  await nextTick()
  if (import.meta.client) {
    const { Modal } = await import('bootstrap')
    const modalEl = document.getElementById('userDetailsModal')
    if (modalEl) {
      const modal = new Modal(modalEl)
      modal.show()
    }
  }
}

const handleAction = (payload: { userId: number; action: string }) => {
  const provider = providers.value.find(p => p.id === payload.userId)
  if (provider) {
    provider.status = payload.action
  }
}

const applyFilters = (filters: Record<string, string>) => {
  activeFilters.value = filters
  meta.value.page = 1
  fetchProviders()
}

const clearFilters = () => {
  activeFilters.value = {}
  meta.value.page = 1
  fetchProviders()
}

// Fetch on mount
onMounted(() => {
  fetchProviders()
})

// SEO
useHead({
  title: 'Waitlist - Service Providers | fyaora LABS Admin',
  meta: [
    { name: 'description', content: 'Manage service provider waitlist - view, filter, and onboard service providers' }
  ]
})
</script>
