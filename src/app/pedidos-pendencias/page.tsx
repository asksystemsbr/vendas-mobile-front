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
    <div className="container mx-auto p-8">
      <h1 className="text-xl font-bold mb-4">Pedidos Pendentes</h1>
      <div className="grid gap-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="border p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-bold">Pedido #{pedido.id} - {formatDateTimeForGrid(pedido.data)}</h2>
            <p>
              <strong>Total do Pedido:</strong> R$ {pedido.itens?.reduce((sum, item) => sum + (item?.valorVenda??0) * (item?.quantidadeEstoque??0), 0).toFixed(2)}
            </p>
            <div className="grid gap-4">
            {pedido.itens?.map((item) => (
              <div key={item.id} className="flex flex-col border p-2 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{item.nome}</p>
                    <p className="text-sm text-gray-500">Código: {item.codigoInterno}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => abrirModalProduto(item)}
                      className="bg-gray-500 text-white px-2 py-1 rounded"
                    >
                      Consultar
                    </button>
                    <button
                      onClick={() => handleRemoverProduto(pedido.id!, item.id!)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div>
                    <label className="text-sm font-bold">Mín:</label>
                    <br />
                    <span className="ml-2">{item.estoqueMin ?? 0}</span>
                  </div>
                  <div>
                    <label className="text-sm font-bold">Máx:</label>
                    <br />
                    <span className="ml-2">{item.estoqueMax ?? 0}</span>
                  </div>
                  <div>
                    <label className="text-sm font-bold">Pedido:</label>
                    <br />
                    <span className="ml-2">{item.quantidadeEstoque ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
            </div>
            <button
              onClick={() => handleAprovarPedido(pedido.id!)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Aprovar Pedido
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => router.push("../dashboard")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>
      {/* Modal de Produto */}
      {modalProduto && (
        <Modal
          isOpen={!!modalProduto}
          onRequestClose={fecharModalProduto}
          className="bg-white p-6 max-w-md mx-auto rounded-lg shadow-lg"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <h2 className="text-lg font-bold mb-4">Detalhes do Produto</h2>
          <p>
            <strong>Nome:</strong> {modalProduto.nome}
          </p>
          <p>
            <strong>Código:</strong> {modalProduto.codigoInterno ?? ""}
          </p>
          <p>
            <strong>Grupo:</strong> {modalProduto.grupoId ?? ""}
          </p>
          <p>
            <strong>Preço:</strong> R$ {modalProduto.valorVenda?.toFixed(2)}
          </p>
          <img
            src={modalProduto.foto}
            alt={modalProduto.nome}
            className="mt-4 max-w-full h-auto"
          />
          <button
            onClick={fecharModalProduto}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
          >
            Fechar
          </button>
        </Modal>
      )}
      {/* Snackbar */}
      {snackbar.show && (
        <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} onClose={hideSnackbar} />
      )}
    </div>
  );
}
