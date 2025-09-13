import { useState } from "react";
import { NavLink } from "react-router-dom";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "AddProduct", path: "/add" },
    { name: "Restock?", path: "/restock" }
  ];

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="text-[#0071dc] font-semibold text-xl">RetailMate AI</div>

          {/* Nav menu (center) */}
          <div className="hidden md:flex flex-1 justify-center">
            <ul className="flex space-x-8 text-blue-600 text-lg font-medium">
              {navItems.map((item) => (
                <li className="text-[#0071dc]" key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block py-2 border-b-2 transition-all duration-200 ${
                        isActive
                          ? "border-[#0071dc]"
                          : "border-transparent hover:border-[#0071dc]"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Say Hello Gemini text */}
          <div className="hidden md:block text-sm text-[#0071dc] font-medium ml-4">
            Say “Hello Gemini”
          </div>

          {/* Hamburger icon */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#0071dc] focus:outline-none"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-2">
            <ul className="flex flex-col space-y-2 text-[#4f46e5] text-base font-medium">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block py-1 border-b-2 transition-all duration-200 ${
                        isActive
                          ? "border-blue-600"
                          : "border-transparent hover:border-blue-600"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              <li className="text-purple-600 text-sm mt-2 pl-1">Say “Hello Gemini”</li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
