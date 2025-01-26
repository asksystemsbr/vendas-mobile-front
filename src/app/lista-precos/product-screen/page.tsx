"use client";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Produto } from "@/models/produto";
import { useAuth } from "@/app/auth";
import { Snackbar } from "@/app/snackbar";
import { SnackbarState } from "@/models/snackbarState";

export default function ProductScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [categoriaNome, setCategoriaNome] = useState<string>(""); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);

  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100);

  const authContext = useAuth ();
  

  useEffect(() => {
    if (!authContext || !authContext.user) {
      router.push("./login");
    }
  }, [authContext, router]); // Executa o redirecionamento após verificar `authContext`

  if (!authContext || !authContext.user) {
    return null; // Evita renderizar conteúdo antes do redirecionamento
  }

   const { user } = authContext;


  // Obter o ID da categoria e buscar o nome
  useEffect(() => {
    const categoriaIdParam = searchParams.get("categoriaId");
    setCategoriaId(categoriaIdParam ? Number(categoriaIdParam) : null);

    const fetchCategoriaNome = async () => {
      try {
        if (categoriaIdParam) {
          const response = await axios.get(`/api/Produto/getGrupo/${categoriaIdParam}`);
          setCategoriaNome(response.data.descricao || "Desconhecida");
        }
      } catch (error) {
        console.error("Erro ao buscar o nome da categoria:", error);
        setCategoriaNome("Desconhecida");
      }
    };

    if (categoriaIdParam) {
      fetchCategoriaNome();
    }
  }, [searchParams]);

  // Carregar produtos da categoria selecionada
  useEffect(() => {
    
    const fetchProdutos = async () => {
      try {
        if (categoriaId) {
          //const response = await axios.get(`/api/Produto/getByGrupo/${categoriaIdParam}`);
          const response = await axios.get("/api/ListaPreco/getProdutosByClienteCategoria", {
            params: { usuarioId: user.id,categoriaId:categoriaId },
          });          

          const produtosComEstoque = response.data.map((produto: Produto) => ({
            ...produto,
            quantidadeEstoque: Math.max(0, (produto.estoqueMax ?? 0) - (produto.estoqueMin ?? 0)),
            // estoqueMin: 0,
            // estoqueMax: 0,            
          }));
          setProdutos(produtosComEstoque);
        }
        else
        {
          //const response = await axios.get(`/api/Produto/getByGrupo/${categoriaIdParam}`);
          const response = await axios.get("/api/ListaPreco/getProdutosByUser", {
            params: { usuarioId: user.id },
          });          

          const produtosComEstoque = response.data.map((produto: Produto) => ({
            ...produto,
            quantidadeEstoque: Math.max(0, (produto.estoqueMax ?? 0) - (produto.estoqueMin ?? 0)),
            // estoqueMin: 0,
            // estoqueMax: 0,            
          }));
          setProdutos(produtosComEstoque);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    };

    if (categoriaId !== undefined) {
      fetchProdutos();
    }
  }, [categoriaId, user.id]);

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
        const newSnackbarState = new SnackbarState(prev.message, prev.type, false); // Cria uma nova instância de SnackbarState
        return newSnackbarState;
      });
    };

  const handleVisualizarPedido = (produtoId: number) => {
    router.push(`/visualizar-pedido?categoriaId=${categoriaId}&produtoId=${produtoId}`);
  };

  const handleEditarQuantidade = (produtoId: number, quantidade: number) => {
    setProdutos((prev) =>
      prev.map((produto) =>
        produto.id === produtoId ? { ...produto, quantidadeEstoque: quantidade } : produto
      )
    );
  };

  const handleGerarPedido = async () => {
    try {
      const pedido = {
        clienteId: user.id, // ID do cliente (usuário logado)
        items: produtos
          .filter((produto) => produto.quantidadeEstoque??0 > 0) // Apenas produtos com quantidade > 0
          .map((produto) => ({
            produtoId: produto.id,
            QuantidadeEstoque: produto.quantidadeEstoque,
            EstoqueMin: produto.estoqueMin??0,
            estoqueMax: produto.estoqueMax??0,
            valorVenda: produto.valorVenda??0,
            id: produto.id??0,
          })),
      };

      await axios.post("/api/Pedido/SalvarPedido", pedido);
      setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
      router.push("../pedidos-pendencias"); // Redireciona após sucesso
    } catch (error) {
      console.error("Erro ao gerar o pedido:", error);
      setSnackbar(new SnackbarState('Erro ao salvar registro!', 'error', true));
    }
  };

    // Abrir modal com detalhes do produto
    const abrirModalProduto = (produto: Produto) => {
      setModalProduto(produto);
    };
  
    const fecharModalProduto = () => {
      setModalProduto(null);
    };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-xl font-bold mb-4">Produtos da Categoria {categoriaNome}</h1>
      <div className="grid gap-4">
        {produtos.map((produto) => (
          <div key={produto.id} className="flex flex-col border p-2 rounded space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{produto.nome}</p>
                <p className="text-sm text-gray-500">Código: {produto.codigoInterno}</p>
              </div>
              <button
                onClick={() => abrirModalProduto(produto)}
                className="bg-gray-500 text-white px-2 py-1 rounded"
              >
                Consultar
              </button>
            </div>
            <div className="flex items-center space-x-8">
              <div>
                <label className="text-sm font-bold">Mín:</label>
                <br />
                <span className="ml-2">{produto.estoqueMin ?? 0}</span>
              </div>
              <div>
                <label className="text-sm font-bold">Máx:</label>
                <br />
                <span className="ml-2">{produto.estoqueMax ?? 0}</span>
              </div>
              <div className="mt-2">
                <label className="text-sm font-bold">Pedido:</label>
                <input
                  type="text"
                  value={produto.quantidadeEstoque}
                  onChange={(e) =>
                    handleEditarQuantidade(produto.id, Number(e.target.value) || 0)
                  }
                  className="border rounded w-full py-1 px-2"
                />
              </div>              
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
        <button
          onClick={handleGerarPedido}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Criar Pedido em Pendência
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
          <p><strong>Nome:</strong> {modalProduto.nome}</p>
          <p><strong>Código:</strong> {modalProduto.codigoInterno??''}</p>
          <p><strong>Grupo:</strong> {modalProduto.grupoId??''}</p>
          <p><strong>Preço:</strong> R$ {modalProduto.valorVenda?.toFixed(2)}</p>
          <img src={modalProduto.foto} alt={modalProduto.nome} className="mt-4 max-w-full h-auto" />
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
