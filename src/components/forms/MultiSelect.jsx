export default function MultiSelect({
  label,
  options = [],
  selected = [],
  onChange,
}) {
  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div>
      {label && (
        <p className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </p>
      )}

      <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto bg-white">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center gap-2 py-1 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => toggleOption(option.id)}
              className="rounded border-gray-300 text-yellow-700 focus:ring-yellow-700"
            />
            {option.nombre}
          </label>
        ))}

        {options.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay opciones disponibles.
          </p>
        )}
      </div>
    </div>
  )
}