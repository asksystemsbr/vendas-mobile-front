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
    <div className="flex flex-col min-h-screen">
      {/* Cabeçalho */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white text-center py-6 shadow-lg flex justify-between items-center px-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide">PORTAL DO CLIENTE</h1>
          <p className="text-lg mt-2 font-medium">Bem-vindo CRC Vendas Mobile</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md shadow-md transition-transform transform hover:scale-105"
        >
          <FaSignOutAlt size={16} />
          <span className="text-sm">Sair</span>
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow p-4">
        <h2 className="text-lg font-bold mb-4">Selecione uma opção</h2>
        <div className="flex flex-col gap-2">
          {menuItems.map(
            (item) =>
              (!item.permissions || userCan(item.permissions)) && (
                <div
                  key={item.label}
                  onClick={() => router.push(item.route)}
                  className="cursor-pointer flex items-center gap-4 p-2 rounded-lg hover:bg-gray-200 transition-transform transform hover:scale-105"
                >
                  {/* Imagem à esquerda */}
                  <img src="/option.png" alt="Ícone" className="w-8 h-8" />

                  {/* Texto ao lado */}
                  <p className="font-medium text-base">{item.label}</p>
                </div>
              )
          )}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-800 text-white text-center py-1 text-xs mt-auto">
        CRC VENDAS MOBILE - DEVELOPED BY ASKSYSTEMS
      </footer>
    </div>
  );
}
