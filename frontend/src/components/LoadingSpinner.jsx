export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
