import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { customersApi, getErrorMessage, ordersApi, productsApi } from '../api/client'
import Alert from '../components/Alert'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [formError, setFormError] = useState('')
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.list,
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.list,
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setAlert({ type: 'success', message: 'Order created successfully' })
      setModalOpen(false)
      setCustomerId('')
      setItems([{ product_id: '', quantity: 1 }])
      setFormError('')
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: ordersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setAlert({ type: 'success', message: 'Order cancelled and stock restored' })
      setDeleteTarget(null)
    },
    onError: (err) => {
      setAlert({ type: 'error', message: getErrorMessage(err) })
      setDeleteTarget(null)
    },
  })

  function addItemRow() {
    setItems([...items, { product_id: '', quantity: 1 }])
  }

  function removeItemRow(index) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  function updateItem(index, field, value) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!customerId) {
      setFormError('Please select a customer')
      return
    }

    const orderItems = []
    const seenProducts = new Set()
    for (const item of items) {
      if (!item.product_id) {
        setFormError('Please select a product for each line item')
        return
      }
      const pid = parseInt(item.product_id, 10)
      const qty = parseInt(item.quantity, 10)
      if (seenProducts.has(pid)) {
        setFormError('Duplicate products are not allowed in one order')
        return
      }
      seenProducts.add(pid)
      if (isNaN(qty) || qty <= 0) {
        setFormError('Quantity must be greater than 0')
        return
      }
      orderItems.push({ product_id: pid, quantity: qty })
    }

    createMutation.mutate({
      customer_id: parseInt(customerId, 10),
      items: orderItems,
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          type="button"
          onClick={() => {
            setModalOpen(true)
            setFormError('')
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Order
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      {error && <Alert message={getErrorMessage(error)} />}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {orders.length === 0 ? (
          <p className="p-6 text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="p-3">#{o.id}</td>
                    <td className="p-3">{o.customer_name}</td>
                    <td className="p-3">{o.item_count}</td>
                    <td className="p-3 font-medium">${Number(o.total_amount).toFixed(2)}</td>
                    <td className="p-3">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="p-3 space-x-2">
                      <Link to={`/orders/${o.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(o)}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title="Create Order" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <Alert message={formError} />}
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Order Items</label>
                <button type="button" onClick={addItemRow} className="text-sm text-blue-600 hover:underline">
                  + Add item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (stock: {p.quantity_in_stock}) - ${Number(p.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-20 border rounded-lg px-3 py-2"
                      required
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="text-red-600 px-2"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Cancel Order"
          message={`Cancel order #${deleteTarget.id}? Stock will be restored.`}
          confirmLabel="Cancel Order"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
