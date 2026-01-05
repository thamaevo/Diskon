import { reactive, ref } from 'vue'
import { DEFAULT_API } from '../settings'

let savedApi = null
try {
  if (typeof window !== 'undefined' && window.localStorage) savedApi = window.localStorage.getItem('apiUrl')
} catch (e) {
  savedApi = null
}

const envApi = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : null

const apiBase = ref(envApi || savedApi || DEFAULT_API)

const state = reactive({ list: [] })

function mapRemote(item) {
  return {
    id: item._id || item.id,
    title: item.name || item.title,
    amount: item.price || item.amount,
    isPercent: item.isPercent === true || item.type === 'percent' || false
  }
}

export function useDiscounts() {
  async function load() {
    try {
      const res = await fetch(apiBase.value)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      state.list.splice(0, state.list.length, ...data.map(mapRemote))
    } catch (e) {
      console.error('load discounts error', e)
    }
  }

  async function add(payload) {
    try {
      const res = await fetch(apiBase.value, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.title || payload.name,
          price: payload.amount || payload.price,
          isPercent: payload.isPercent === true
        })
      })
      if (!res.ok) throw new Error('Add failed')
      const created = await res.json()
      state.list.push(mapRemote(created))
      return mapRemote(created)
    } catch (e) {
      console.error('add discount error', e)
      return null
    }
  }

  async function update(id, payload) {
    try {
      const url = `${apiBase.value}/${id}`
      const res = await fetch(url, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.title || payload.name,
          price: payload.amount || payload.price,
          isPercent: payload.isPercent === true
        })
      })
      if (!res.ok) throw new Error('Update failed')
      const idx = state.list.findIndex((p) => p.id === id)
      if (idx !== -1) state.list[idx] = { id, title: payload.title || payload.name, amount: payload.amount || payload.price, isPercent: payload.isPercent === true }
      return state.list[idx]
    } catch (e) {
      console.error('update discount error', e)
      return null
    }
  }

  async function remove(id) {
    try {
      const url = `${apiBase.value}/${id}`
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      const idx = state.list.findIndex((p) => p.id === id)
      if (idx !== -1) state.list.splice(idx, 1)
      return true
    } catch (e) {
      console.error('remove discount error', e)
      return false
    }
  }

  // allow updating API base at runtime and reload
  async function setApiBase(url) {
    apiBase.value = url || DEFAULT_API
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('apiUrl', apiBase.value)
    } catch (e) { /* ignore storage errors */ }
    try { await load() } catch (e) { /* ignore load errors here */ }
  }

  // initial load
  load()

  return { state, apiBase, setApiBase, load, add, update, remove }
}
