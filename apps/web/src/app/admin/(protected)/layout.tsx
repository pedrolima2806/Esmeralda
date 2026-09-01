import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/session";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div><p className="admin-kicker">CONTROL / 01</p><h2>Conteúdo</h2></div>
        <nav aria-label="Navegação administrativa">
          <Link href="/admin">Relatórios</Link>
          <Link href="/admin/relatorios/novo">Novo relatório</Link>
          <Link href="/" target="_blank">Ver site ↗</Link>
        </nav>
        <div className="admin-account"><span>{session.email}</span><form action={logout}><button type="submit">Sair</button></form></div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
