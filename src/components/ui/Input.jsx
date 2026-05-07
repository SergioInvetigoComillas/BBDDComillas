export default function Input({
  className = "",
  ...props
}) {
  return (
    <input
      className={`
        w-full px-4 py-2
        border border-gray-300 rounded
        text-sm text-gray-800
        focus:outline-none focus:ring-2 focus:ring-yellow-700
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  )
}