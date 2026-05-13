import { useState } from "react"
import { supabase } from "./services/supabaseClient"

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      console.error(error)
      setError("Credenciales incorrectas")
      return
    }
    localStorage.setItem("login_started_at", Date.now().toString())
    onLogin(data.user)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-8 bg-white border border-gray-200 rounded-lg shadow">
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-40 w-auto object-contain"
          />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded disabled:bg-gray-100"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white rounded bg-yellow-700 hover:bg-yellow-800 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
