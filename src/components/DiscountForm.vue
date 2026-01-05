<template>
  <form @submit.prevent="onSave" class="discount-form">
    <div>
      <label>Nama Diskon</label>
      <input v-model="local.title" placeholder="Misal: Diskon opening, diskon akhir tahun" />
      <div v-if="errors.title" class="error">{{ errors.title }}</div>
    </div>

    <div class="row">
      <div class="col">
        <label>Diskon</label>
        <div class="input-with-unit">
          <div v-if="!local.isPercent" class="unit left">Rp</div>
          <input
            :class="{ 'has-left': !local.isPercent, 'has-right': local.isPercent }"
            v-model="local.amountRaw"
            @input="onAmountInput"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="0"
          />
          <div v-if="local.isPercent" class="unit right">%</div>
        </div>
        <div v-if="errors.amount" class="error">{{ errors.amount }}</div>
      </div>
      <div class="col switch-col">
        <div class="switch">
          <button type="button" :class="{ active: local.isPercent }" @click="setMode(true)">%</button>
          <button type="button" :class="{ active: !local.isPercent }" @click="setMode(false)">Rp</button>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="save" type="submit">Simpan</button>
      <!-- <button type="button" @click="$emit('cancel')">Batal</button> -->
    </div>
  </form>
</template>

<script>
export default {
  props: { model: { type: Object, default: null } },
  data() {
    return { local: { title: '', amount: 0, amountRaw: '', isPercent: true }, errors: {} }
  },
  created() {
    this.syncRawFromAmount()
  },
  watch: {
    model: {
      immediate: true,
      handler(v) {
        if (v) {
          this.local.title = v.title || v.name || ''
          this.local.amount = v.amount || v.price || 0
          this.local.isPercent = v.isPercent === true
        } else {
          this.local.title = ''
          this.local.amount = 0
          this.local.isPercent = true
        }
        this.syncRawFromAmount()
      }
    },
    'local.isPercent'(val) {
      this.syncRawFromAmount()
    }
  },
  methods: {
    onAmountInput(e) {
      const val = e.target.value || ''
      if (this.local.isPercent) {
        // keep only digits
        const digits = val.replace(/[^0-9]/g, '')
        let num = Number(digits || 0)
        if (num > 100) num = 100
        this.local.amount = num
        this.local.amountRaw = num === 0 ? '' : String(num)
      } else {
        // Rupiah mode: allow up to 12 digits, format as currency
        const digits = val.replace(/[^0-9]/g, '').slice(0, 12)
        const num = Number(digits || 0)
        this.local.amount = num
        this.local.amountRaw = digits.length === 0 ? '' : this.formatCurrency(num)
      }
    },

    setMode(isPercent) {
      // when switching format, reset value to 0 as requested
      if (this.local.isPercent === isPercent) return
      this.local.isPercent = isPercent
      this.local.amount = 0
      this.local.amountRaw = ''
      // ensure formatting reflects reset state
      this.syncRawFromAmount()
    },

    syncRawFromAmount() {
      if (this.local.isPercent) {
        this.local.amountRaw = this.local.amount ? String(this.local.amount) : ''
      } else {
        this.local.amountRaw = this.local.amount ? this.formatCurrency(this.local.amount) : ''
      }
    },

    formatCurrency(n) {
      try {
        return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n)
      } catch (e) {
        return String(n)
      }
    },

    validate() {
      this.errors = {}
      if (!this.local.title || this.local.title.trim().length === 0) this.errors.title = 'Nama diskon tidak boleh kosong'
      if (this.local.amount === null || this.local.amount === '' || Number(this.local.amount) <= 0) this.errors.amount = 'Diskon tidak boleh kosong atau 0'
      if (this.local.isPercent && Number(this.local.amount) > 100) this.errors.amount = 'Persentase tidak boleh lebih dari 100'
      return Object.keys(this.errors).length === 0
    },
    onSave() {
      if (!this.validate()) return
      this.$emit('save', { title: this.local.title.trim(), amount: Number(this.local.amount), isPercent: !!this.local.isPercent })
    }
  }
}
</script>

<style scoped>
.discount-form > div { margin-bottom: 10px }
label { display:block; font-weight:600; margin-bottom:6px }
input { width:100%; padding:10px; border:1px solid #e0e6ea; border-radius:8px; background:#fff; max-width:100%; font-size:14px; box-sizing:border-box }
.input-with-unit { position:relative }
.input-with-unit .unit { position:absolute; top:50%; transform:translateY(-50%); background:transparent; color:#4b5563; font-weight:600; pointer-events:none }
.input-with-unit .unit.right { right:12px }
.input-with-unit .unit.left { left:12px }
.input-with-unit input { padding-right:12px; padding-left:12px }
.input-with-unit input.has-right { padding-right:56px }
.input-with-unit input.has-left { padding-left:56px }
.row { display:flex; gap:8px; align-items:flex-end }
.col { flex:1 }
.switch-col { width:120px }
.switch { display:flex; border-radius:8px; overflow:hidden; border:1px solid #e6ece8 }
.switch button { flex:1; padding:10px 6px; border:0; background:#f7f7f7 }
.switch button.active { background:#e9f7ee; color:#2f9b3e; font-weight:700 }
.actions { display:flex; gap:8px; margin-top:12px }
.save { background:#2fb63b; color:#fff; padding:10px 18px; border-radius:24px; border:0 }
button { padding:8px 12px; border-radius:6px }
.error { color:#b00020; font-size:12px; margin-top:4px }
</style>
