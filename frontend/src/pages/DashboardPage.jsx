import { useQuery } from '@tanstack/react-query'
import { dashboardApi, getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import LoadingSpinner from '../components/LoadingSpinner'

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold mt-2 text-slate-900">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.summary,
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {error && <Alert message={getErrorMessage(error)} />}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Products" value={data.total_products} />
            <StatCard label="Total Customers" value={data.total_customers} />
            <StatCard label="Total Orders" value={data.total_orders} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Low Stock Products</h2>
              <p className="text-sm text-slate-500">Products below threshold</p>
            </div>
            {data.low_stock_products.length === 0 ? (
              <p className="p-6 text-slate-500">All products are sufficiently stocked.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.low_stock_products.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">{p.name}</td>
                        <td className="p-3">{p.sku}</td>
                        <td className="p-3 text-red-600 font-medium">{p.quantity_in_stock}</td>
                        <td className="p-3">${Number(p.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
