import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ChevronDownIcon,
  DollarLineIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  TableIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

type NavSubItem = {
  nameKey: string;
  path: string;
  roles: UserRole[];
};

type NavItem = {
  nameKey: string;
  icon: React.ReactNode;
  path?: string;
  roles: UserRole[];
  subItems?: NavSubItem[];
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
    roles: ["superAdmin", "officeAdmin", "employee"],
    subItems: [
      {
        nameKey: "nav.tourists",
        path: "/tourists",
        roles: ["superAdmin", "officeAdmin", "employee"],
      },
      {
        nameKey: "nav.touristHistory",
        path: "/tourists/history",
        roles: ["superAdmin", "officeAdmin", "employee"],
      },
    ],
  },
  {
    icon: <TableIcon />,
    nameKey: "nav.settings",
    roles: ["superAdmin", "officeAdmin"],
    subItems: [
      {
        nameKey: "nav.accommodations",
        path: "/settings/properties",
        roles: ["superAdmin", "officeAdmin"],
      },
      {
        nameKey: "nav.parks",
        path: "/settings/parks",
        roles: ["superAdmin", "officeAdmin"],
      },
      {
        nameKey: "nav.expenses",
        path: "/settings/expenses",
        roles: ["superAdmin", "officeAdmin"],
      },
      {
        nameKey: "nav.staff",
        path: "/settings/staff",
        roles: ["superAdmin", "officeAdmin"],
      },
    ],
  },
  {
    icon: <ListIcon />,
    nameKey: "nav.packages",
    roles: ["superAdmin", "officeAdmin", "accountant", "employee"],
    subItems: [
      {
        nameKey: "nav.packages",
        path: "/packages",
        roles: ["superAdmin", "officeAdmin", "employee"],
      },
      {
        nameKey: "nav.packageHistory",
        path: "/packages/history",
        roles: ["superAdmin", "officeAdmin", "employee"],
      },
      {
        nameKey: "nav.packageSpending",
        path: "/package-spending",
        roles: ["superAdmin", "accountant"],
      },
      {
        nameKey: "nav.accountantPackages",
        path: "/accountant-packages",
        roles: ["superAdmin", "accountant"],
      },
    ],
  },
  {
    icon: <GridIcon />,
    nameKey: "nav.monthlyAnalysis",
    path: "/reports/monthly",
    roles: ["superAdmin"],
  },
  {
    icon: <DollarLineIcon />,
    nameKey: "nav.accountant",
    roles: ["superAdmin", "officeAdmin", "accountant"],
    subItems: [
      {
        nameKey: "nav.handoffs",
        path: "/handoffs",
        roles: ["superAdmin", "officeAdmin"],
      },
      {
        nameKey: "nav.received",
        path: "/received",
        roles: ["superAdmin", "accountant"],
      },
      {
        nameKey: "nav.fundReturns",
        path: "/fund-returns",
        roles: ["superAdmin", "accountant"],
      },
    ],
  },
];

function filterNav(items: NavItem[], role: UserRole): NavItem[] {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => {
      if (!item.subItems) return item;
      const subItems = item.subItems.filter((sub) => sub.roles.includes(role));
      return { ...item, subItems };
    })
    .filter((item) => !item.subItems || item.subItems.length > 0);
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

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const isSubmenuActive = useCallback(
    (nav: NavItem) => nav.subItems?.some((sub) => isActive(sub.path)) ?? false,
    [isActive]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems?.some((sub) => isActive(sub.path))) {
        setOpenSubmenu(index);
        submenuMatched = true;
      }
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = String(openSubmenu);
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

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
            {navItems.map((nav, index) => (
              <li key={nav.nameKey}>
                {nav.subItems ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSubmenuToggle(index)}
                      className={`menu-item group ${
                        openSubmenu === index || isSubmenuActive(nav)
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      } cursor-pointer ${
                        !isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "lg:justify-start"
                      }`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          openSubmenu === index || isSubmenuActive(nav)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{t(nav.nameKey)}</span>
                      )}
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronDownIcon
                          className={`ms-auto w-5 h-5 transition-transform duration-200 ${
                            openSubmenu === index
                              ? "rotate-180 text-brand-500"
                              : ""
                          }`}
                        />
                      )}
                    </button>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <div
                        ref={(el) => {
                          subMenuRefs.current[String(index)] = el;
                        }}
                        className="overflow-hidden transition-all duration-300"
                        style={{
                          height:
                            openSubmenu === index
                              ? `${subMenuHeight[String(index)]}px`
                              : "0px",
                        }}
                      >
                        <ul className="mt-2 space-y-1 ms-9">
                          {nav.subItems.map((subItem) => (
                            <li key={subItem.nameKey}>
                              <Link
                                to={subItem.path}
                                className={`menu-dropdown-item ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-item-active"
                                    : "menu-dropdown-item-inactive"
                                }`}
                              >
                                {t(subItem.nameKey)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  nav.path && (
                    <Link
                      to={nav.path}
                      className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          isActive(nav.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{t(nav.nameKey)}</span>
                      )}
                    </Link>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
