import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { login } from "@/app/admin/actions";
import { getAdminSession } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Acesso administrativo | Esmeralda" };

const messages: Record<string, string> = {
  credenciais: "Usuário ou senha incorretos. Use admin ou o e-mail completo.",
  configuracao: "As credenciais administrativas ainda não foram configuradas no .env.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const error = messages[(await searchParams).erro ?? ""];
  return (
    <main className="admin-login page-container">
      <div className="login-panel">
        <p className="eyebrow"><span>AUTH</span> Área restrita</p>
        <h1>Painel administrativo</h1>
        <p>Entre para criar, revisar e publicar os relatórios da Esmeralda.</p>
        {error ? <div className="admin-alert error" role="alert">{error}</div> : null}
        <form action={login}>
          <div className="field-group"><label htmlFor="identifier">Usuário ou e-mail</label><input id="identifier" name="identifier" type="text" placeholder="admin" autoComplete="username" required /></div>
          <div className="field-group"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          <button className="admin-submit" type="submit">Entrar <span>→</span></button>
        </form>
      </div>
    </main>
  );
}
