import { useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { GridIcon, HorizontaLDots, ListIcon, TableIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

type NavItem = {
  nameKey: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
};

const allNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    nameKey: "nav.dashboard",
    path: "/",
    roles: ["superAdmin", "officeAdmin", "accountant", "employee"],
  },
  {
    icon: <ListIcon />,
    nameKey: "nav.tourists",
    path: "/tourists",
    roles: ["superAdmin", "officeAdmin"],
  },
  {
    icon: <TableIcon />,
    nameKey: "nav.accommodations",
    path: "/settings/properties",
    roles: ["superAdmin", "officeAdmin"],
  },
  {
    icon: <TableIcon />,
    nameKey: "nav.parks",
    path: "/settings/parks",
    roles: ["superAdmin", "officeAdmin"],
  },
  {
    icon: <ListIcon />,
    nameKey: "nav.packages",
    path: "/packages",
    roles: ["superAdmin", "officeAdmin"],
  },
  {
    icon: <TableIcon />,
    nameKey: "nav.handoffs",
    path: "/handoffs",
    roles: ["superAdmin", "officeAdmin"],
  },
  {
    icon: <ListIcon />,
    nameKey: "nav.received",
    path: "/received",
    roles: ["superAdmin", "accountant"],
  },
  {
    icon: <TableIcon />,
    nameKey: "nav.packageSpending",
    path: "/package-spending",
    roles: ["superAdmin", "accountant"],
  },
  {
    icon: <ListIcon />,
    nameKey: "nav.fundReturns",
    path: "/fund-returns",
    roles: ["superAdmin", "accountant"],
  },
];

function filterNav(items: NavItem[], role: UserRole): NavItem[] {
  return items.filter((item) => item.roles.includes(role));
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = useMemo(
    () => (user?.role ? filterNav(allNavItems, user.role) : []),
    [user?.role]
  );

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 start-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-e border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "max-lg:-translate-x-full max-lg:rtl:translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/" className="block">
          <img
            src="/logo/thika_logo.png"
            alt={t("common.agencyAlt")}
            className={`w-auto object-contain ${(isExpanded || isHovered || isMobileOpen) ? "h-12" : "h-8"}`}
          />
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
            {(isExpanded || isHovered || isMobileOpen) ? t("common.menu") : <HorizontaLDots className="size-6" />}
          </h2>
          <ul className="flex flex-col gap-4">
            {navItems.map((nav) => (
              <li key={nav.path}>
                <Link to={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                  <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{t(nav.nameKey)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
