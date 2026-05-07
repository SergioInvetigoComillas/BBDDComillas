import { useState } from "react"
import Button from "../ui/Button"
import Input from "../ui/Input"

export default function SearchBar({ onSearch }) {
  const [text, setText] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(text)
  }

  const handleChange = (e) => {
    const value = e.target.value
    setText(value)

    if (value === "") {
      onSearch("")
    }
  }

  const handleClear = () => {
    setText("")
    onSearch("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="search"
        placeholder="Buscar por archivo, artífice, legajo, lugar..."
        value={text}
        onChange={handleChange}
      />

      <Button type="submit">
        Buscar
      </Button>

      {text && (
        <Button type="button" variant="secondary" onClick={handleClear}>
          Limpiar
        </Button>
      )}
    </form>
  )
}