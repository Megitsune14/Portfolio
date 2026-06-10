import { Link } from 'react-router-dom';
import { useNexusAuth } from '../hooks/useNexusAuth';
import { btnGhost, btnPrimary } from '../lib/goals/ui';

type ServiceStatus = 'available' | 'in-progress';

type NexusService = {
  id: string;
  title: string;
  description: string;
  to: string;
  status: ServiceStatus;
};

const services: NexusService[] = [
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Statistiques de visites du portfolio — pages vues, IPs uniques et provenance.',
    to: '/nexus/analytics',
    status: 'available',
  },
  {
    id: 'goals',
    title: 'Goals',
    description: 'Suivi d’objectifs personnels, pesées et progression.',
    to: '/nexus/goals/dashboard',
    status: 'available',
  },
  {
    id: 'spotify',
    title: 'Spotify',
    description: 'Gestion Spotify et statistiques d’écoute — bientôt disponible.',
    to: '/nexus/spotify',
    status: 'in-progress',
  },
];

export default function NexusHub() {
  const { logout } = useNexusAuth();

  return (
    <div className="app-shell relative flex min-h-screen flex-col px-4 py-10 sm:px-6">
      <div className="absolute right-4 top-10 flex flex-wrap justify-end gap-3 sm:right-6">
        <Link to="/" className={btnGhost}>
          Retour au site
        </Link>
        <button type="button" onClick={logout} className={btnPrimary}>
          Déconnexion
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-jp text-3xl font-bold text-foreground sm:text-4xl">Nexus</h1>
        <p className="mt-3 mb-10 text-muted">Bienvenue sur le dashboard</p>

        <div className="flex w-full max-w-lg flex-col gap-5">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: NexusService }) {
  const isInProgress = service.status === 'in-progress';

  return (
    <Link
      to={service.to}
      className={`surface-panel group flex flex-col p-6 text-left transition-transform hover:-translate-y-0.5 ${
        isInProgress ? 'opacity-90' : ''
      }`}
    >
      <div className="mb-4">
        <h2 className="font-jp text-xl font-bold text-foreground">{service.title}</h2>
      </div>

      <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">{service.description}</p>

      <span className="text-sm font-semibold text-(--primary) transition-colors group-hover:opacity-80">
        {isInProgress ? 'Voir l’aperçu →' : 'Ouvrir →'}
      </span>
    </Link>
  );
}
