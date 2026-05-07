import { Link, NavLink } from "react-router-dom"
import Button from "./ui/Button"

export default function Navbar({ onLogout }) {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded text-sm font-medium transition ${
      isActive
        ? "bg-[#8a5f24] text-white"
        : "text-gray-900 hover:bg-[#e2c987]"
    }`

  return (
    <header
      className="w-full border-b border-[#a9823f]"
      style={{
        background:
          "radial-gradient(circle at center, #c9a35b 0%, #d8b978 45%, #ead7a3 100%)",
      }}
    >
      <div className="w-full px-6 h-[100px] grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="
                h-[100px] w-auto object-contain
                drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]
                brightness-105
                contrast-110
              "
            />
          </Link>
        </div>

        <nav className="flex items-center justify-center gap-2">
          <NavLink to="/" className={linkClass}>
            Buscar
          </NavLink>

          <NavLink to="/registros" className={linkClass}>
            Registros
          </NavLink>

          <NavLink to="/catalogos" className={linkClass}>
            Catálogos
          </NavLink>
        </nav>

        <div className="flex justify-end">
          <Button variant="logout" onClick={onLogout}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  )
}