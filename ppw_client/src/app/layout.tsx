import './globals.css'; import { ConsultaProvider } from '@/components/consultas/consulta-provider'; import { Sidebar } from '@/components/layout/sidebar';
export const metadata = { title: 'Agenda Clínica', description: 'MVP acadêmico de agendamento de consultas' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body><ConsultaProvider><div className="min-h-screen md:flex"><Sidebar /><main className="w-full p-5 md:p-8">{children}</main></div></ConsultaProvider></body></html>; }
