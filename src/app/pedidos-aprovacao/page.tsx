"use client";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Produto } from "@/models/produto";
import { useAuth } from "@/app/auth";
import { Snackbar } from "@/app/snackbar";
import { SnackbarState } from "@/models/snackbarState";
import { PedidoCabecalho } from "@/models/pedidoCabecalho";
import { formatDateTimeForGrid } from "../utils/formatDateForInput";
import { IoClose } from "react-icons/io5"; 

export default function ApproveOrderScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoCabecalho[]>([]);
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100);
  const router = useRouter();

  const authContext = useAuth();

  useEffect(() => {
    if (!authContext || !authContext.user) {
      router.push("./login");
    }
  }, [authContext, router]);

  if (!authContext || !authContext.user) {
    return null; // Evita renderizar conteúdo antes do redirecionamento
  }

  const { user } = authContext;

  // Carregar pedidos pendentes
  useEffect(() => {
    const fetchPedidosPendentes = async () => {
      try {
        const response = await axios.get("/api/Pedido/GetPedidosByStatus", {
          params: { usuarioId: user.id, status: "pendente" },
        });
        setPedidos(response.data);
      } catch (error) {
        console.error("Erro ao carregar pedidos pendentes:", error);
      }
    };

    fetchPedidosPendentes();
  }, [user.id]);

  // Função para controle do Snackbar
  useEffect(() => {
    if (snackbar.show) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0));
      }, 50);

      const timer = setTimeout(() => {
        snackbar.hideSnackbar();
        setSnackbar(new SnackbarState());
        setProgress(100); // Reset progresso
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [snackbar]);

  const hideSnackbar = () => {
    setSnackbar((prev) => {
      const newSnackbarState = new SnackbarState(prev.message, prev.type, false);
      return newSnackbarState;
    });
  };

  const handleRemoverProduto = (pedidoId: number, produtoId: number) => {
    const confirmar = window.confirm("Tem certeza que deseja remover este item?");
    if (!confirmar) return;
    setPedidos((prevPedidos) =>
      prevPedidos.map((pedido) => {
        if (pedido.id === pedidoId) {
          // Remove o produto específico do pedido
          const itensAtualizados = pedido.itens?.filter((item) => item.id !== produtoId);
          return { ...pedido, itens: itensAtualizados };
        }
        return pedido;
      })
    );
  
    // Exibe a mensagem de sucesso no Snackbar
    setSnackbar(new SnackbarState("Item removido com sucesso!", "success", true));
  };

  const handleAprovarPedido = async (pedidoId: number) => {
    try {
      // Encontra o pedido específico na lista
      const pedido = pedidos.find((p) => p.id === pedidoId);
  
      if (!pedido || !pedido.itens?.length) {
        setSnackbar(new SnackbarState("Pedido vazio ou não encontrado!", "error", true));
        return;
      }
  
      const pedidoAprovado = {
        id: pedidoId,
        clienteId: user.id,
        items: pedido.itens.map((item) => ({
          produtoId: item.id,
          QuantidadeEstoque: item.quantidadeEstoque,
          EstoqueMin: item.estoqueMin??0,
          estoqueMax: item.estoqueMax??0,
          valorVenda: item.valorVenda??0,
          id: item.id??0,
        })),
      };
  
      await axios.post("/api/Pedido/AprovarPedido", pedidoAprovado);
  
      // Remove o pedido aprovado da lista local
      setPedidos((prevPedidos) => prevPedidos.filter((p) => p.id !== pedidoId));
  
      setSnackbar(new SnackbarState("Pedido aprovado com sucesso!", "success", true));
      router.push("../pedidos-abertos"); // Redireciona após sucesso
    } catch (error) {
      console.error("Erro ao aprovar o pedido:", error);
      setSnackbar(new SnackbarState("Erro ao aprovar o pedido!", "error", true));
    }
  };
  

  const abrirModalProduto = (produto: Produto) => {
    setModalProduto(produto);
  };

  const fecharModalProduto = () => {
    setModalProduto(null);
  };

  return (
    <div className="container mx-auto p-8 flex flex-col min-h-screen">
      {/* Cabeçalho fixo */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-10 p-4">
        <h1 className="text-lg font-bold">📌 Pedidos Pendentes</h1>
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="flex justify-between items-center">
            <h2 className="font-bold">Pedido #{pedido.id}</h2>
            <p className="text-sm">{formatDateTimeForGrid(pedido.data)}</p>
            <p className="font-bold text-green-600">
              Total: R$ {pedido.itens?.reduce((sum, item) => sum + (item?.valorVenda ?? 0) * (item?.quantidadeEstoque ?? 0), 0).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Espaço para o cabeçalho fixo */}
      <div className="mt-24 overflow-auto flex-grow pb-32">
        <div className="grid gap-3">
          {pedidos.map((pedido) =>
            pedido.itens?.map((item) => (
              <div key={item.id} className="flex flex-col border p-2 rounded space-y-1 relative">
                {/* Nome do produto */}
                <p className="font-bold">{item.nome}</p>

                {/* Códigos */}
                <div className="text-sm text-gray-500">
                  <p>Código Fábrica: {item.codigoInterno}</p>
                  <p>Código Cliente: {item.totalizadorParcial}</p>
                </div>

                {/* Quantidade, Unitário e Total */}
                <div className="flex items-center justify-between text-sm mt-1">
                  <div>
                    <label className="font-bold">Pedido:</label>
                    <br />
                    <span>{item.quantidadeEstoque ?? 0}</span>
                  </div>
                  <div>
                    <label className="font-bold">Unitário:</label>
                    <br />
                    <span className="text-green-600 font-bold">R$ {(item.valorVenda ?? 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <label className="font-bold">Total:</label>
                    <br />
                    <span className="font-bold text-blue-600">
                      R$ {((item.quantidadeEstoque ?? 0) * (item.valorVenda ?? 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botão Remover (ícone de X) */}
                <button
                  onClick={() => handleRemoverProduto(pedido.id!, item.id!)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <IoClose size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 flex justify-between">
        <button onClick={() => router.push("../dashboard")} className="bg-gray-500 text-white px-4 py-2 rounded">
          Voltar
        </button>
        {pedidos.map((pedido) => (
          <button
            key={pedido.id}
            onClick={() => handleAprovarPedido(pedido.id!)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Confirmar Pedido
          </button>
        ))}
      </div>

      {snackbar.show && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          progress={progress}
          onClose={() => setSnackbar(new SnackbarState())}
        />
      )}
    </div>
  );
}