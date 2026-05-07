import { useEffect, useState } from "react"
import AppRouter from "./router"
import { supabase } from "./services/supabaseClient"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const bypass = import.meta.env.VITE_DEV_BYPASS_AUTH === "true"

  useEffect(() => {
    if (bypass) {
      setUser({ dev: true })
      setLoading(false)
      return
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error cargando sesión:", error)
      }

      setUser(data.session?.user || null)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [bypass])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-600">Cargando...</p>
      </div>
    )
  }

  return (
    <AppRouter
      user={user}
      setUser={setUser}
    />
  )
}