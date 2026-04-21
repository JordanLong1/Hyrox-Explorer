import { NavLink, Outlet } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive
      ? 'text-blue-600 bg-blue-50'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 h-14">
            <span className="font-semibold text-gray-900 mr-6">
              Hyrox Explorer
            </span>
            <NavLink to="/" end className={navLinkClass}>
              Pacing Guide
            </NavLink>
            <NavLink to="/trends" className={navLinkClass}>
              Trends
            </NavLink>
            <NavLink to="/compare" className={navLinkClass}>
              Compare
            </NavLink>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
