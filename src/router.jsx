import { Routes, Route, Navigate } from "react-router-dom"

import Login from "./Login"
import Navbar from "./components/Navbar"

import SearchView from "./pages/SearchView"
import RecordsView from "./pages/RecordsView"
import RecordForm from "./pages/RecordForm"
import RecordDetail from "./pages/RecordDetail"
import CatalogsView from "./pages/CatalogsView"

import { supabase } from "./services/supabaseClient"

export default function AppRouter({ user, setUser }) {
  if (!user) {
    return <Login onLogin={setUser} />
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error cerrando sesión:", error)
    }

    setUser(null)
  }

  return (
    <>
      <Navbar onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<SearchView />} />

        <Route path="/registros" element={<RecordsView />} />
        <Route path="/registros/nuevo" element={<RecordForm />} />
        <Route path="/registros/:id" element={<RecordDetail />} />
        <Route path="/registros/:id/editar" element={<RecordForm />} />

        <Route path="/catalogos" element={<CatalogsView />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}