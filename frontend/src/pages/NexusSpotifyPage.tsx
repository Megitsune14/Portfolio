import { NexusPageLayout } from '../components/nexus/NexusPageLayout';

export default function NexusSpotifyPage() {
  return (
    <NexusPageLayout title="Spotify">
      <div className="surface-panel p-8 text-center sm:p-12">
        <h2 className="font-jp text-2xl font-bold text-foreground">Bientôt disponible</h2>
        <p className="mx-auto mt-4 max-w-prose text-sm leading-relaxed text-muted">
          Espace de gestion Spotify — statistiques d’écoute, tokens et configuration du widget
          public. Ce module est en cours de développement.
        </p>
      </div>
    </NexusPageLayout>
  );
}
