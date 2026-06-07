import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail[0]?.msg || 'Validation error'
  return error?.message || 'An unexpected error occurred'
}

export const productsApi = {
  list: () => client.get('/products').then((r) => r.data),
  get: (id) => client.get(`/products/${id}`).then((r) => r.data),
  create: (data) => client.post('/products', data).then((r) => r.data),
  update: (id, data) => client.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id) => client.delete(`/products/${id}`),
}

export const customersApi = {
  list: () => client.get('/customers').then((r) => r.data),
  get: (id) => client.get(`/customers/${id}`).then((r) => r.data),
  create: (data) => client.post('/customers', data).then((r) => r.data),
  delete: (id) => client.delete(`/customers/${id}`),
}

export const ordersApi = {
  list: () => client.get('/orders').then((r) => r.data),
  get: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => client.post('/orders', data).then((r) => r.data),
  delete: (id) => client.delete(`/orders/${id}`),
}

export const dashboardApi = {
  summary: () => client.get('/dashboard/summary').then((r) => r.data),
}

export default client
