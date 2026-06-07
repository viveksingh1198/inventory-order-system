import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage, ordersApi } from '../api/client'
import Alert from '../components/Alert'
import LoadingSpinner from '../components/LoadingSpinner'

export default function OrderDetailPage() {
  const { id } = useParams()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  })

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div>
        <Alert message={getErrorMessage(error)} />
        <Link to="/orders" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/orders" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to Orders
      </Link>

      <h1 className="text-2xl font-bold mb-6">Order #{order.id}</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Customer</p>
            <p className="font-medium">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium capitalize">{order.status}</p>
          </div>
          <div>
            <p className="text-slate-500">Total Amount</p>
            <p className="font-medium text-lg">${Number(order.total_amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-500">Created</p>
            <p className="font-medium">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.product_name}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="p-3">${Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
