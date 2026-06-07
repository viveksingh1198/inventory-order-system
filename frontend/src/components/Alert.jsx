export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null

  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  }

  return (
    <div className={`mb-4 p-4 rounded-lg border flex justify-between items-start ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="ml-4 text-sm underline">
          Dismiss
        </button>
      )}
    </div>
  )
}
