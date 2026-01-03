import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiUser,
  FiShoppingBag,
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";

/* ================= TABS ================= */
const tabs = [
  { to: "/", label: "Home", icon: FiHome },
  { to: "/shop", label: "Shop", icon: FiPackage },
  { to: "/cart", label: "Cart", icon: FiShoppingCart },
  { to: "/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/profile", label: "Profile", icon: FiUser },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { cartItems } = useCart();

  /* ================= CART COUNT ================= */
  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  /* ================= ACTIVE CHECK ================= */
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 md:hidden flex justify-center">
      <div
        className="
          w-[94%] h-16
          bg-white/95 backdrop-blur
          rounded-full shadow-xl
          flex items-center justify-between
          px-2
        "
      >
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);

          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex justify-center"
            >
              <div
                className={`
                  relative
                  flex items-center gap-2
                  px-4 py-2
                  rounded-full
                  transition-all duration-300
                  ${
                    active
                      ? "bg-indigo-600/10 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                {/* ICON */}
                <div className="relative">
                  <Icon size={22} />

                  {/* CART BADGE */}
                  {label === "Cart" && cartCount > 0 && (
                    <span
                      className="
                        absolute -top-2 -right-3
                        min-w-[18px] h-[18px]
                        bg-indigo-600 text-white
                        text-[10px] font-semibold
                        rounded-full
                        flex items-center justify-center
                      "
                    >
                      {cartCount}
                    </span>
                  )}
                </div>

                {/* LABEL (ONLY WHEN ACTIVE) */}
                {active && (
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {label}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
