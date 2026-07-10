import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles: UserRole[];
  subItems?: { name: string; path: string; roles: UserRole[] }[];
};

const allNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/", roles: ["superAdmin", "officeAdmin", "accountant", "employee"] },
  {
    icon: <PieChartIcon />,
    name: "Reports",
    roles: ["superAdmin"],
    subItems: [
      { name: "Office Admin Summary", path: "/reports/office-admin", roles: ["superAdmin"] },
      { name: "Accountant Summary", path: "/reports/accountant", roles: ["superAdmin"] },
    ],
  },
  { icon: <UserCircleIcon />, name: "Users", path: "/users", roles: ["superAdmin"] },
  {
    icon: <BoxCubeIcon />,
    name: "Master Data",
    roles: ["superAdmin"],
    subItems: [
      { name: "Parks", path: "/settings/parks", roles: ["superAdmin"] },
    ],
  },
  { icon: <TableIcon />, name: "Accommodations", path: "/settings/properties", roles: ["superAdmin", "officeAdmin"] },
  { icon: <TableIcon />, name: "Activities", path: "/settings/activities", roles: ["superAdmin", "officeAdmin"] },
  { icon: <ListIcon />, name: "Tourists", path: "/tourists", roles: ["superAdmin", "officeAdmin"] },
  { icon: <TableIcon />, name: "Packages", path: "/packages", roles: ["superAdmin", "officeAdmin"] },
  { icon: <TableIcon />, name: "Send to Accountant", path: "/handoffs", roles: ["superAdmin", "officeAdmin"] },
  {
    icon: <UserCircleIcon />,
    name: "Employees",
    roles: ["superAdmin", "officeAdmin"],
    subItems: [
      { name: "Manage Employees", path: "/employees", roles: ["superAdmin", "officeAdmin"] },
      { name: "Salary Overview", path: "/employees/salaries", roles: ["superAdmin", "officeAdmin"] },
    ],
  },
  { icon: <ListIcon />, name: "Received", path: "/received", roles: ["superAdmin", "accountant"] },
  { icon: <TableIcon />, name: "Package Spending", path: "/package-spending", roles: ["superAdmin", "accountant"] },
  { icon: <PieChartIcon />, name: "Expenses", path: "/expenses", roles: ["superAdmin", "accountant"] },
  { icon: <UserCircleIcon />, name: "Salary Payments", path: "/salary-payments", roles: ["superAdmin", "accountant"] },
  { icon: <ListIcon />, name: "My Assignments", path: "/assignments", roles: ["employee"] },
  { icon: <TableIcon />, name: "History", path: "/history", roles: ["employee"] },
];

function filterNav(items: NavItem[], role: UserRole): NavItem[] {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      subItems: item.subItems?.filter((sub) => sub.roles.includes(role)),
    }))
    .filter((item) => item.path || (item.subItems && item.subItems.length > 0));
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const navItems = user ? filterNav(allNavItems, user.role) : [];

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let matched: number | null = null;
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((sub) => {
        if (isActive(sub.path)) matched = index;
      });
    });
    setOpenSubmenu(matched);
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

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/" className="text-xl font-bold text-brand-600 dark:text-brand-400">
          {(isExpanded || isHovered || isMobileOpen) ? "Thiqa Agency" : "T"}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
            {(isExpanded || isHovered || isMobileOpen) ? "Menu" : <HorizontaLDots className="size-6" />}
          </h2>
          <ul className="flex flex-col gap-4">
            {navItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === index ? null : index)}
                      className={`menu-item group w-full ${openSubmenu === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                    >
                      <span className={`menu-item-icon-size ${openSubmenu === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu === index ? "rotate-180 text-brand-500" : ""}`} />
                      )}
                    </button>
                    {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                      <div
                        ref={(el) => { subMenuRefs.current[String(index)] = el; }}
                        className="overflow-hidden transition-all duration-300"
                        style={{ height: openSubmenu === index ? `${subMenuHeight[String(index)]}px` : "0px" }}
                      >
                        <ul className="mt-2 space-y-1 ml-9">
                          {nav.subItems.map((sub) => (
                            <li key={sub.name}>
                              <Link to={sub.path} className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  nav.path && (
                    <Link to={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                      <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
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
