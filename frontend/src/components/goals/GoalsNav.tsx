import { Link, useLocation } from 'react-router-dom';
import { useNexusAuth } from '../../hooks/useNexusAuth';
import { btnGhost, btnPrimary } from '../../lib/goals/ui';

const links = [
  { to: '/nexus/goals/dashboard', label: 'Dashboard' },
  { to: '/nexus/goals/measures', label: 'Pesées' },
  { to: '/nexus/goals', label: 'Objectifs' },
  { to: '/nexus/goals/profile', label: 'Profil' },
];

export function GoalsNav() {
  const location = useLocation();
  const { logout } = useNexusAuth();

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-jp text-3xl font-bold text-foreground sm:mr-4 sm:text-4xl">Goals</h1>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`focus-ring rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-(--primary) text-(--primary-foreground)'
                    : 'border border-theme text-muted hover:bg-(--secondary)'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/nexus" className={btnGhost}>
          Nexus
        </Link>
        <Link to="/" className={btnGhost}>
          Retour au site
        </Link>
        <button type="button" onClick={logout} className={btnPrimary}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
