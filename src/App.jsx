import { useEffect, useState } from "react"
import AppRouter from "./router"
import { supabase } from "./services/supabaseClient"

const MAX_SESSION_TIME = 6 * 60 * 60 * 1000 // 6 horas

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const bypass = import.meta.env.VITE_DEV_BYPASS_AUTH === "true"

  const isSessionExpired = () => {
    const loginStartedAt = localStorage.getItem("login_started_at")

    if (!loginStartedAt) {
      return false
    }

    const elapsed = Date.now() - Number(loginStartedAt)

    return elapsed > MAX_SESSION_TIME
  }

  const forceLogout = async () => {
    localStorage.removeItem("login_started_at")

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error cerrando sesión:", error)
    }

    setUser(null)
  }

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

      const sessionUser = data.session?.user || null

      if (sessionUser && isSessionExpired()) {
        await forceLogout()
        setLoading(false)
        return
      }

      setUser(sessionUser)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const loginStartedAt = localStorage.getItem("login_started_at")

        if (!loginStartedAt) {
          localStorage.setItem("login_started_at", Date.now().toString())
        }

        if (isSessionExpired()) {
          forceLogout()
          return
        }
      }

      setUser(session?.user || null)
    })

    const interval = setInterval(() => {
      if (user && isSessionExpired()) {
        forceLogout()
      }
    }, 60 * 1000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [bypass, user])

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
