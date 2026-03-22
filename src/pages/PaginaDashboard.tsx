import { TableroPrincipal } from '../features/dashboard/TableroPrincipal';

interface PaginaDashboardProps {
  onCerrarSesion: () => void;
}

export function PaginaDashboard({ onCerrarSesion }: PaginaDashboardProps) {
  return <TableroPrincipal onCerrarSesion={onCerrarSesion} />;
}
