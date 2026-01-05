<template>
  <div class="discount-list">
    <table>
      <thead>
        <tr>
          <th style="width:40px"><input type="checkbox" :checked="discounts.length && discounts.every(d => selected.includes(d.id))" @change="toggleAll($event)" /></th>
          <th>Nama</th>
          <th class="right">Diskon</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in discounts" :key="d.id">
          <td><input type="checkbox" :checked="selected.includes(d.id)" @change="$emit('select-toggle', d.id, $event.target.checked)" /></td>
          <td>{{ d.title || d.name }}</td>
          <td class="right">{{ format(d) }}</td>
          <td class="actions">
            <button @click="$emit('edit', d)">✏️</button>
            <button @click="$emit('request-delete', d.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: { discounts: { type: Array, required: true }, selected: { type: Array, default: () => [] } },
  methods: {
    format(d) {
      if (!d) return ''
      if (d.isPercent) return `${Number(d.amount || d.price).toFixed(0)}%`
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(d.amount || d.price)
    }
,
    toggleAll(e) {
      this.$emit('select-all', e.target.checked)
    }
  }
}
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; background: #fff }
th,td { border: 1px solid #eee; padding: 10px; text-align: left }
.right { text-align: right }
.actions { width: 86px }
button { margin-right: 6px; padding:6px 8px; border-radius:6px; border:1px solid #ddd; background:#f7f7f7 }
button:hover { background:#eef }
</style>
