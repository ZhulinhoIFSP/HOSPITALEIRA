import { StatusConsulta } from '@/types/consulta';
const estilos: Record<StatusConsulta, string> = { AGENDADA: 'bg-blue-100 text-blue-800', CONFIRMADA: 'bg-cyan-100 text-cyan-800', CHECK_IN: 'bg-amber-100 text-amber-800', REALIZADA: 'bg-emerald-100 text-emerald-800', CANCELADA: 'bg-rose-100 text-rose-800' };
export function ConsultaStatusBadge({ status }: { status: StatusConsulta }) { return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${estilos[status]}`}>{status}</span>; }
