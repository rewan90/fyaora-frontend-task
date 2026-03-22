<template>
  <div
    class="modal fade"
    id="userDetailsModal"
    tabindex="-1"
    aria-labelledby="userDetailsModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modal-custom">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title-row">
            <i class="bi bi-person-circle modal-title-icon"></i>
            <span class="modal-title-text" id="modal-company-name">User Details</span>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Body -->
        <div class="modal-body" v-if="user">
          <!-- Company Info Row -->
          <div class="modal-company-row">
            <div class="modal-company-info">
              <h5 class="modal-company-name">{{ user.companyName }}</h5>
              <div class="modal-company-email">
                <i class="bi bi-envelope"></i> {{ user.email }}
              </div>
            </div>
            <div class="modal-badges">
              <span class="badge-custom">{{ user.customerType }}</span>
              <span class="badge-custom badge-invited">
                {{ user.status === 'Onboarded' ? 'onboarded' : user.status === 'Rejected' ? 'rejected' : 'invited' }}
              </span>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="modal-section">
            <h6 class="modal-section-title">Contact Information</h6>
            <div class="modal-info-grid">
              <div class="modal-info-item">
                <i class="bi bi-envelope"></i>
                <span>{{ user.contactEmail }}</span>
              </div>
              <div class="modal-info-item">
                <i class="bi bi-telephone"></i>
                <span>{{ user.contactPhone }}</span>
              </div>
              <div class="modal-info-item">
                <i class="bi bi-geo-alt"></i>
                <span>{{ user.country }}</span>
              </div>
              <div class="modal-info-item">
                <i class="bi bi-calendar3"></i>
                <span>Signed up {{ user.signupDate }}</span>
              </div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="modal-section">
            <h6 class="modal-section-title">Customer Details</h6>
            <div class="modal-info-item">
              <i class="bi bi-person"></i>
              <span>{{ user.customerType }}</span>
            </div>
          </div>

          <!-- User Details / Services -->
          <div>
            <h6 class="modal-section-title mt-3">User Details</h6>
            <div class="modal-services">
              <span
                v-for="service in user.services"
                :key="service"
                class="modal-service-tag"
              >
                {{ service.toLowerCase() }}
              </span>
            </div>
          </div>

          <!-- Internal Notes -->
          <div class="internal-notes modal-section">
            <div class="notes-header">
              <div class="title">
                <i class="bi bi-chat-left-text"></i>
                Internal Notes
              </div>
              <span class="notes-edit" @click="editingNotes = !editingNotes">
                <i class="bi bi-pencil"></i> Edit
              </span>
            </div>
            <textarea
              v-model="notesText"
              class="notes-textarea"
              :placeholder="editingNotes ? 'Add your notes here...' : 'No Note Added yet'"
              :readonly="!editingNotes"
              id="internal-notes-textarea"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="modal-actions">
            <button class="btn-onboard" @click="onboard" id="btn-onboard">
              Onboard
            </button>
            <button class="btn-reject" @click="reject" id="btn-reject">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
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

const props = defineProps<{
  user: ServiceProvider | null
}>()

const emit = defineEmits<{
  (e: 'action', payload: { userId: number; action: string }): void
}>()

const addToast = inject<(message: string, type?: string) => void>('addToast')
const modalRef = ref<HTMLElement | null>(null)
const editingNotes = ref(false)
const notesText = ref('')

watch(() => props.user, (newUser) => {
  if (newUser) {
    notesText.value = newUser.notes || ''
    editingNotes.value = false
  }
})

const closeModal = async () => {
  if (modalRef.value && import.meta.client) {
    const { Modal } = await import('bootstrap')
    const bsModal = Modal.getInstance(modalRef.value)
    bsModal?.hide()
  }
}

const onboard = () => {
  if (props.user) {
    emit('action', { userId: props.user.id, action: 'Onboarded' })
    addToast?.(`${props.user.companyName} has been onboarded!`, 'success')
    closeModal()
  }
}

const reject = () => {
  if (props.user) {
    emit('action', { userId: props.user.id, action: 'Rejected' })
    addToast?.(`${props.user.companyName} has been rejected`, 'info')
    closeModal()
  }
}
</script>
