import { Link } from 'react-router-dom';
import { useNexusAuth } from '../../hooks/useNexusAuth';
import { btnGhost, btnPrimary } from '../../lib/goals/ui';

type Props = {
  title: string;
};

export function NexusServiceHeader({ title }: Props) {
  const { logout } = useNexusAuth();

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-jp text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
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
