export default function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-yellow-700 text-white hover:bg-yellow-800 focus:ring-yellow-700",

    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400",

    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",

    logout:
      "bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 focus:ring-red-500",

    warm:
      "bg-[#e2c987] text-[#5f431c] hover:bg-[#ead7a3] focus:ring-[#a9823f]",

    gray:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",

    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        px-4 py-2 rounded
        text-sm font-medium
        transition
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}