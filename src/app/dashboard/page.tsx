//src/components/PortalIndex.tsx
"use client";
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
 import { useAuth  } from '../auth'; // Importa o hook de autenticação
import {
  FaSignOutAlt,
  FaTags,
  FaClipboardList,
  FaFileInvoice,
  FaFileAlt,
  FaBarcode,
  FaDollarSign,
  FaListAlt,
  FaShoppingCart,
  FaHourglassHalf,
  FaUserPlus
} from "react-icons/fa";

// Interface para os itens do menu
interface MenuItem {
  permissions?: string[];
  label: string;
  icon: React.ReactNode;
  route: string;
}

// Componente de Menu
export default function PortalIndexComponente() {
   const router = useRouter();
   const authContext = useAuth ();

   useEffect(() => {
    if (!authContext || !authContext.user) {
      router.push("./login");
    }
  }, [authContext, router]); // Executa o redirecionamento após verificar `authContext`



  if (!authContext || !authContext.user) {
    return null; // Evita renderizar conteúdo antes do redirecionamento
  }

   const { user,logout } = authContext;

     // Função para verificar se o usuário possui permissão
  const userCan = (permissions: string[] = []) => {
    return permissions.every((perm) => user.permissions?.includes(perm));
  };

  const handleLogout = () => {
    logout(); // Chama a função de logout
    router.push("./lgoin"); // Redireciona para a página de login ou inicial
  };

  // Definição dos itens do menu
  const menuItems: MenuItem[] = [
    {
      label: "Lista de Preços", // Novo item
      icon: <FaTags size={24} />,
      route: "/lista-precos",
    },
    {
      label: "Pedidos",
      icon: <FaShoppingCart size={24} />,
      route: "/pedidos-finalizados",
    },
    {
      label: "Pedidos em Aberto",
      icon: <FaClipboardList size={24} />,
      route: "/pedidos-abertos",
    },
    {
      label: "Pedidos Pendentes", // Novo item adicionado
      icon: <FaHourglassHalf size={24} />,
      route: "/pedidos-pendencias",
    },    
    {
      label: "DANFE",
      icon: <FaFileInvoice size={24} />,
      route: "/danfe",
    },
    {
      label: "XML",
      icon: <FaFileAlt size={24} />,
      route: "/xml",
    },
    {
      label: "Boleto",
      icon: <FaBarcode size={24} />,
      route: "/boleto",
    },
    {
      permissions: ["Cotacao.Write"],
      label: "Cotação e Custo",
      icon: <FaDollarSign size={24} />,
      route: "/cotacao-custo",
    },
    {
      permissions: ["Precos.Write"],
      label: "Lista de Preços Geral",
      icon: <FaListAlt size={24} />,
      route: "/lista-precos-geral",
    },
    {
      permissions: ["Client.Write"],
      label: "Cadastro de Cliente", 
      icon: <FaUserPlus size={24} />,
      route: "/client",
    },    
  ];

  // Renderiza os itens de menu com base nas permissões
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {menuItems.map((item) =>
            !item.permissions || userCan(item.permissions) ? (
              <div
                key={item.label}
                onClick={() => router.push(item.route)}
                className="cursor-pointer transform transition-transform hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-200">
                  <div className="text-primary mb-2">{item.icon}</div>
                  <p className="text-center font-medium text-sm">{item.label}</p>
                </div>
              </div>
            ) : null
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
