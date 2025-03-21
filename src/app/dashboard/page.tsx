"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth";
import { FaSignOutAlt } from "react-icons/fa";

interface MenuItem {
  permissions?: string[];
  label: string;
  route: string;
}

export default function PortalIndexComponente() {
  const router = useRouter();
  const authContext = useAuth();

  useEffect(() => {
    if (!authContext || !authContext.user) {
      router.push("/login");
    }
  }, [authContext, router]);

  if (!authContext || !authContext.user) {
    return null;
  }

  const { user, logout } = authContext;

  const userCan = (permissions: string[] = []) => {
    return permissions.every((perm) => user.permissions?.includes(perm));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems: MenuItem[] = [
    { label: "Consultar produto", route: "/lista-precos/product-screen?listarProdutos=false&search=" },
    { label: "Lista de Preços", route: "/lista-precos/product-screen?listarProdutos=true&search=" },
    { label: "Pedidos Aguardando Aprovação", route: "/pedidos-aprovacao" },
    { label: "Pedidos Finalizados", route: "/pedidos-finalizados" },
    { label: "Pedidos em Aberto", route: "/pedidos-abertos" },
    { label: "Pedidos Pendentes", route: "/pedidos-pendencias" },
    { label: "DANFE", route: "/danfe" },
    { label: "XML", route: "/xml" },
    { label: "Boleto", route: "/boleto" },
    { permissions: ["Precos.Write"], label: "Lista de Preços Geral", route: "/lista-precos-geral" },
    { permissions: ["Precos.Write"], label: "Tabela de Preços", route: "/tabela-precos" },
    { permissions: ["Client.Write"], label: "Cadastro de Cliente", route: "/client" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#cae090] text-white">
      {/* Cabeçalho */}
      {/* <header className="text-center py-4 shadow-md">
        <h1 className="text-xl font-bold">Portal de Vendas</h1>
      </header> */}

      {/* Conteúdo Principal */}
      <main className="flex-grow p-4 min-h-[calc(100vh-300px)] max-h-[calc(100vh-200px)] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Selecione uma opção</h2>
        <div className="flex flex-col gap-2">
          {menuItems.map(
            (item) =>
              (!item.permissions || userCan(item.permissions)) && (
                <div
                  key={item.label}
                  onClick={() => router.push(item.route)}
                  className="cursor-pointer flex items-center gap-4 p-2 rounded-lg hover:bg-green-500 transition-transform transform hover:scale-105"
                >
                  {/* Ícone à esquerda */}
                  <img src="/option.png" alt="Ícone" className="w-8 h-8" />

                  {/* Texto ao lado */}
                  <p className="font-bold text-base">{item.label}</p>
                </div>
              )
          )}
        </div>
      </main>

      {/* Rodapé com botão de logout */}
      <footer className="bg-[#cae090] text-white text-center py-3 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center mx-auto space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md shadow-md transition-transform transform hover:scale-105"
        >
          <FaSignOutAlt size={16} />
          <span className="text-sm font-bold">Sair</span>
        </button>

        <p className="text-xs mt-2 font-bold">CRC VENDAS MOBILE - DEVELOPED BY ASKSYSTEMS</p>
      </footer>
    </div>
  );
}