<template>
  <div class="page">
    <div class="inner">
    <header class="header">
      <div class="title-block">
        <h2>Daftar Diskon</h2>
        <div v-if="store.state.list.length !== 0" class="muted">Total jumlah diskon: {{ store.state.list.length }}</div>
      </div>

      <div class="toast-area">
        <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">{{ t.message }}</div>
      </div>

            <div class="controls">
            <div class="controls-left">
            <input v-if="store.state.list.length !== 0" v-model="search" class="search" placeholder="Cari diskon" />

            <div class="api-wrap">
              <div class="api-toggle" @click="showApiInput = !showApiInput">
                <button class="select-btn">
                  <span class="store-icon">🏪</span>
                  Kopi Anak Bangsa
                  <span class="caret">▾</span>
                </button>
              </div>

              <div v-if="showApiInput" class="api-popup">
                <input v-model="apiUrl" class="api-url" placeholder="https://crudcrud.com/api/your-key/.../diskon" />
                <button class="btn-apply" @click="applyApiUrl">Terapkan</button>
              </div>
            </div>
          </div>
        <div class="controls-right">
          <button v-if="store.state.list.length !== 0" class="green-btn" @click="openModal">+ Tambah diskon</button>
          <button v-if="selectedIds && selectedIds.length" class="btn-bulk-delete" @click="promptBulkDelete">Hapus ({{ selectedIds.length }})</button>
        </div>
      </div>
    </header>

    <div v-if="store.state.list.length === 0" class="empty-area">
      <div class="empty-card empty-card-large">
        <div class="empty-illustration large">
          <img src="../assets/empty-illustration.png" alt="Belum Ada Diskon" style="width:320px; max-width:100%; height:auto" />
        </div>
        <h3 class="empty-title">Belum Ada Diskon</h3>
        <p class="muted empty-sub">Silahkan tambah diskon untuk menarik pelanggan dan meningkatkan penjualan.</p>
        <button class="green-btn big" @click="openModal"><span style="margin-right:8px">+</span> Tambah diskon</button>
      </div>
    </div>

    <div v-else class="layout">
      <div class="list">
        <DiscountList
          :discounts="filtered"
          :selected="selectedIds"
          @edit="startEdit"
          @request-delete="promptDelete"
          @select-toggle="onSelectToggle"
          @select-all="onSelectAll"
        />
      </div>
      <!-- <aside class="panel">
        <h3>{{ editing ? 'Edit Discount' : 'Create Discount' }}</h3>
        <DiscountForm :model="editing" @save="save" @cancel="cancel" />
      </aside> -->
    </div>

    <footer class="app-footer">2026 © PT Nusantara Berkah Digital</footer>
    
    <!-- Modal for add/edit -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <button class="close" @click="closeModal">✕</button>
        <h2>{{ editing ? 'Edit Diskon' : 'Tambah Diskon' }}</h2>
        <DiscountForm :model="editing" @save="onModalSave" @cancel="closeModal" />
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="delete-overlay" @click.self="cancelDelete">
      <div class="delete-modal">
        <h3>Hapus Diskon</h3>
        <p>Apakah Anda yakin ingin menghapus diskon <strong>{{ selectedToDelete ? selectedToDelete.title : '' }}</strong>?</p>
        <ul>
          <li>Diskon yang dihapus tidak bisa dikembalikan lagi.</li>
        </ul>
        <div class="delete-actions">
          <button class="btn-cancel" @click="cancelDelete">Batalkan</button>
          <button class="btn-delete" @click="confirmDelete">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Bulk delete confirmation modal -->
    <div v-if="showBulkDeleteModal" class="delete-overlay" @click.self="cancelBulkDelete">
      <div class="delete-modal">
        <h3>Hapus Diskon</h3>
        <p>Apakah Anda yakin ingin menghapus <strong>{{ selectedIds.length }}</strong> diskon yang dipilih?</p>
        <ul>
          <li>Diskon yang dihapus tidak bisa dikembalikan lagi.</li>
        </ul>
        <div class="delete-actions">
          <button class="btn-cancel" @click="cancelBulkDelete">Batalkan</button>
          <button class="btn-delete" @click="bulkDelete">Hapus</button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useDiscounts } from '../stores/discounts'
import DiscountList from '../components/DiscountList.vue'
import DiscountForm from '../components/DiscountForm.vue'

export default {
  components: { DiscountList, DiscountForm },
  setup() {
    const store = useDiscounts()
    const editing = ref(null)
    const showModal = ref(false)
    const toasts = ref([])
    const search = ref('')
    const apiUrl = ref(localStorage.getItem('apiUrl') || '')
    const showApiInput = ref(false)

    function showToast(message, type = 'success') {
      const id = Date.now() + Math.random()
      toasts.value.push({ id, message, type })
      setTimeout(() => {
        const idx = toasts.value.findIndex(t => t.id === id)
        if (idx !== -1) toasts.value.splice(idx, 1)
      }, 3000)
    }

    function applyApiUrl() {
      try {
        localStorage.setItem('apiUrl', apiUrl.value || '')
        // If store exposes a setter for api base, try to set it (best-effort)
        if (store && typeof store.setApiBase === 'function') {
          store.setApiBase(apiUrl.value)
        } else if (store && 'apiBase' in store) {
          try { store.apiBase = apiUrl.value } catch (e) { /* ignore */ }
        }
        showToast('API URL diterapkan', 'success')
        showApiInput.value = false
      } catch (err) {
        showToast('Gagal menyimpan API URL', 'error')
      }
    }

    const filtered = computed(() => {
      if (!search.value) return store.state.list
      const q = search.value.toLowerCase()
      return store.state.list.filter(d => (d.title || '').toLowerCase().includes(q))
    })

    // selection for bulk actions
    const selectedIds = ref([])

    function onSelectToggle(id, checked) {
      if (checked) {
        if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
      } else {
        const idx = selectedIds.value.indexOf(id)
        if (idx !== -1) selectedIds.value.splice(idx, 1)
      }
    }

    function onSelectAll(checked) {
      if (checked) selectedIds.value = filtered.value.map(d => d.id)
      else selectedIds.value = []
    }

    // open bulk delete confirmation modal
    const showBulkDeleteModal = ref(false)

    function promptBulkDelete() {
      if (!selectedIds.value.length) return
      showBulkDeleteModal.value = true
    }

    async function bulkDelete() {
      if (!selectedIds.value.length) return
      const results = await Promise.all(selectedIds.value.map(id => store.remove(id)))
      const deleted = results.filter(Boolean).length
      const failed = results.length - deleted
      if (deleted) showToast(`${deleted} diskon berhasil dihapus.`)
      if (failed) showToast(`${failed} diskon gagal dihapus.`, 'error')
      selectedIds.value = []
      showBulkDeleteModal.value = false
    }

    function cancelBulkDelete() {
      showBulkDeleteModal.value = false
    }

    const showDeleteModal = ref(false)
    const selectedToDelete = ref(null)

    function promptDelete(id) {
      const item = store.state.list.find(p => p.id === id) || null
      selectedToDelete.value = item
      showDeleteModal.value = true
    }

    async function confirmDelete() {
      if (!selectedToDelete.value) return
      await remove(selectedToDelete.value.id, selectedToDelete.value)
      showDeleteModal.value = false
      selectedToDelete.value = null
    }

    function cancelDelete() {
      showDeleteModal.value = false
      selectedToDelete.value = null
    }

    function startEdit(p) { editing.value = { ...p }; showModal.value = true }

    async function save(payload) {
      if (editing.value && editing.value.id) {
        const res = await store.update(editing.value.id, payload)
        if (res) showToast(`${res.title || payload.title} berhasil diupdate.`)
        else showToast('Gagal mengupdate diskon.', 'error')
        editing.value = null
      } else {
        const res = await store.add(payload)
        if (res) showToast(`${res.title || payload.title} berhasil ditambahkan.`)
        else showToast('Gagal menambahkan diskon.', 'error')
      }
    }

    function cancel() { editing.value = null }

    async function remove(id, payload) {
      const ok = await store.remove(id)
      if (ok) showToast(`${payload && payload.title ? payload.title : 'Diskon'} berhasil dihapus.`)
      else showToast(`Gagal menghapus ${payload && payload.title ? payload.title : 'diskon'}.`, 'error')
      return ok
    }

    function openModal() { editing.value = null; showModal.value = true }
    function closeModal() { showModal.value = false; editing.value = null }

    async function onModalSave(payload) {
      if (editing.value && editing.value.id) {
        const res = await store.update(editing.value.id, payload)
        if (res) showToast(`${res.title || payload.title} berhasil diupdate.`)
        else showToast('Gagal mengupdate diskon.', 'error')
      } else {
        const res = await store.add(payload)
        if (res) showToast(`${res.title || payload.title} berhasil ditambahkan.`)
        else showToast('Gagal menambahkan diskon.', 'error')
      }
      closeModal()
    }

    return { store, editing, startEdit, save, cancel, remove, openModal, closeModal, showModal, onModalSave, toasts, showToast, filtered, search, apiUrl, applyApiUrl, showApiInput, showDeleteModal, selectedToDelete, promptDelete, confirmDelete, cancelDelete, selectedIds, onSelectToggle, onSelectAll, bulkDelete, promptBulkDelete, showBulkDeleteModal, cancelBulkDelete }
  }
}
</script>

<style scoped>
.page { padding: 24px; background: #f6fbf7; min-height: 100vh; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial }
.inner { width:100%; max-width:996px; margin:0 auto }
.layout { margin-top:18px; display: flex; gap: 24px; align-items: flex-start }
.list { flex: 1 }
.panel { width: 340px; background: #fafafa; padding: 12px; border-radius:6px; border:1px solid #eee }
.panel h3 { margin-top:0 }

/* modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:40 }
.modal { width:640px; background:#fff; border-radius:12px; padding:24px; position:relative; box-shadow:0 18px 40px rgba(14, 30, 37, 0.12) }
.modal .close { position:absolute; right:12px; top:12px; border:0; background:transparent; font-size:20px }
.modal h2 { margin-top:0; margin-bottom:12px }

.green-btn { background:linear-gradient(180deg,#35c34a,#2fb63b); color:#fff; padding:12px 20px; border-radius:10px; border:0; font-weight:700; box-shadow:0 8px 20px rgba(47,182,59,0.18) }
.green-btn:hover { transform:translateY(-1px) }

/* header, controls and toast */
.header { padding: 18px; border-radius:12px; background: #ffffff; box-shadow: 0 6px 20px rgba(14,30,37,0.06); display:flex; flex-direction:column; gap:12px; align-items:flex-start; position: relative }
.title-block h2 { margin:0; font-size:20px; letter-spacing:0.2px }
.title-block .muted { color:#6b7280; font-size:13px }
.controls { display:flex; align-items:center; gap:12px; width:100%; justify-content:space-between }
.controls-left { display:flex; gap:12px; align-items:center; flex:1; min-width:0 }
.controls-right { display:flex; gap:8px; align-items:center }
.search { padding:10px 14px; border-radius:12px; border:1px solid #eef3ee; width:280px; box-shadow:0 6px 18px rgba(16, 24, 32, 0.04) }
.toast-area { position: absolute; left: 50%; transform: translateX(-50%); top: -18px; z-index: 120; display:flex; justify-content:center; pointer-events: none }
.toast { background:#1f7a2f; color:#fff; padding:12px 18px; border-radius:10px; box-shadow:0 12px 30px rgba(18,64,28,0.12); margin-top:8px; pointer-events: auto; transition:all .28s cubic-bezier(.2,.9,.3,1); transform-origin:center top }
.toast.error { background:#d9534f }
.toast-enter-active, .toast-leave-active { transition: opacity .25s }
.toast-enter-from { opacity:0; transform:translateY(-6px) }
.toast-enter-to { opacity:1; transform:translateY(0) }

/* api input */
.api-wrap { position:relative }
.api-popup { position:absolute; top:calc(100% + 8px); left:0; width:680px; max-width:calc(100% - 40px); min-width:550px; background:#fff; padding:12px; border-radius:10px; box-shadow:0 18px 40px rgba(14,30,37,0.08); display:flex; flex-direction:column; gap:8px; align-items:stretch; z-index:60 }
.api-popup::before { content: ''; position:absolute; top:-6px; left:20px; width:12px; height:12px; background:#fff; transform:rotate(45deg); box-shadow:0 6px 10px rgba(14,30,37,0.06) }
.api-url { padding:10px 12px; border-radius:12px; border:1px solid #eef3ee; flex:1; min-width:0; max-width:100%; box-shadow:0 6px 18px rgba(16, 24, 32, 0.04); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace; font-size:13px; overflow-x:auto; white-space:nowrap }
.api-popup .btn-apply { background:linear-gradient(180deg,#35c34a,#2fb63b); color:#fff; border:0; padding:8px 14px; border-radius:10px; font-weight:700; box-shadow:0 8px 20px rgba(47,182,59,0.18); align-self:flex-end; margin-top:6px }
.select-area { display:flex; gap:8px; align-items:center }
.select-btn { background:#fff; border:1px solid #eef3ee; padding:8px 12px; border-radius:10px; box-shadow:0 6px 18px rgba(16, 24, 32, 0.04) }
.select-btn:hover { transform:translateY(-1px) }
.api-toggle { background:transparent; border:1px dashed #e6ece8; padding:8px 10px; border-radius:12px; color:#374151 }

/* delete modal */
.delete-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:50 }
.delete-modal { width:520px; background:#fff; border-radius:14px; padding:22px; position:relative; box-shadow:0 18px 40px rgba(14,30,37,0.08); border:1px solid #f1f5f9 }
.delete-modal h3 { margin:0 0 8px 0 }
.delete-modal p { margin:6px 0 12px 0 }
.delete-modal ul { margin:0 0 18px 20px }
.delete-actions { display:flex; gap:12px; justify-content:flex-end }
.btn-cancel { background:transparent; border:1px solid #f1c1c1; color:#d9534f; padding:8px 14px; border-radius:22px }
.btn-delete { background:#d9534f; color:#fff; border:0; padding:8px 14px; border-radius:22px }
.btn-bulk-delete { background:#d9534f; color:#fff; border:0; padding:10px 14px; border-radius:20px; margin-left:8px }

/* empty state */
.empty-area { margin-top:18px }
.empty-card-large { background:linear-gradient(180deg,#ffffff,#fbfff9); border-radius:14px; border:0; padding:48px; text-align:center; min-height:360px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 12px 30px rgba(14,30,37,0.06) }
.empty-illustration.large svg { width:260px; height:auto }
.empty-title { font-size:20px; font-weight:700; margin-top:18px; margin-bottom:8px }
.empty-sub { color:#6b7280; max-width:640px; margin-bottom:18px }
.green-btn.big { padding:12px 28px; border-radius:999px; font-weight:700; box-shadow:0 10px 30px rgba(47,182,59,0.12) }
</style>
