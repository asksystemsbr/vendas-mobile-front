"use client";
import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import axios from "axios";
import { GrupoProduto } from "@/models/grupoProduto";
import { Cliente } from "@/models/client";
import { Produto } from "@/models/produto";
import { SnackbarState } from "@/models/snackbarState";
import { Snackbar } from "../snackbar";



export default function ListaPrecosGeral() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<GrupoProduto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [listaFinal, setListaFinal] = useState<Produto[]>([]);
  
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100);

  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);

  const [searchCategoria, setSearchCategoria] = useState("");
  const [searchProduto, setSearchProduto] = useState("");

  // Carregar clientes e categorias
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [clientesRes, categoriasRes] = await Promise.all([
          axios.get("/api/Client"),
          axios.get("/api/Produto/getGrupos"),
        ]);

        setClientes(clientesRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais", error);
      }
    };

    loadInitialData();
  }, []);

  // Carregar listaFinal e produtosFiltrados ao selecionar cliente ou grupo
  useEffect(() => {
    const fetchData = async () => {
      try {
        // if (clienteSelecionado && categoriaSelecionada) {
        //   // Chamar o endpoint para preencher listaFinal
        //   const listaFinalRes = await axios.get("/api/ListaPreco/getProdutosByClienteCategoria", {
        //     params: { categoria: categoriaSelecionada, clienteId: clienteSelecionado },
        //   });
        //   setListaFinal(listaFinalRes.data);
        // }
        // else if (clienteSelecionado && !categoriaSelecionada)
        if (clienteSelecionado)
        {
            // Chamar o endpoint para preencher listaFinal
            const listaFinalRes = await axios.get("/api/ListaPreco/getProdutosByCliente", {
              params: { clienteId: clienteSelecionado },
            });
            setListaFinal(listaFinalRes.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
      try{
        if (categoriaSelecionada) {
          // Chamar o endpoint para preencher produtosFiltrados
          const produtosFiltradosRes = await axios.get(`/api/Produto/getByGrupo/${categoriaSelecionada}`);

          const produtosComEstoque = produtosFiltradosRes.data.map((produto: Produto) => ({
            ...produto,
            estoqueMin: 0,
            estoqueMax: 0,
            quantidadeEstoque: 0,
          }));
          setProdutosFiltrados(produtosComEstoque);
        }
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    };

    fetchData();
  }, [clienteSelecionado, categoriaSelecionada]);

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

  // Filtrar produtos por nome ou código
  const handleSearchProduto = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value.toLowerCase();
    setSearchProduto(search);

    const filtered = produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(search) || produto.codigoInterno?.toLowerCase().includes(search)
    );
    setProdutosFiltrados(filtered);
  }, [produtos]);


    // Atualizar o estoque mínimo, estoque máximo e quantidade de um produto
    const atualizarProduto = (id: number, campo: string, valor: number) => {
      setProdutosFiltrados((prevProdutos) =>
        prevProdutos.map((produto) =>
          produto.id === id ? { ...produto, [campo]: valor } : produto
        )
      );
    };

  // Adicionar produto ou categoria à lista final
  const adicionarProduto = (produto: Produto) => {
    setListaFinal((prev) => {
      if (prev.some((item) => item.id === produto.id)) {
        // Produto já existe, não adiciona novamente
        return prev;
      }
      return [...prev, produto];
    });
  };

  const adicionarCategoria = () => {
    setListaFinal((prev) => {
      const novosProdutos = produtosFiltrados.filter(
        (produto) => !prev.some((item) => item.id === produto.id)
      );
      return [...prev, ...novosProdutos];
    });
  };

  // Remover produtos da lista final
  const removerProduto = (produtoId: number) => {
    setListaFinal((prev) => prev.filter((produto) => produto.id !== produtoId));
  };

  const removerTodosProdutos = () => {
    setListaFinal([]);
  };

  // Abrir modal com detalhes do produto
  const abrirModalProduto = (produto: Produto) => {
    setModalProduto(produto);
  };

  const fecharModalProduto = () => {
    setModalProduto(null);
  };

  // Salvar a lista final
  const salvarLista = async () => {
    try {
      await axios.post("/api/ListaPreco/SalvarLista", { 
        clienteId: clienteSelecionado
        , Items: listaFinal,
      });
      setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
    } catch (error) {
      console.error("Erro ao salvar lista", error);
      setSnackbar(new SnackbarState('Erro ao salvar registro!', 'error', true));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-xl font-bold mb-4">Lista de Preços Geral</h1>

      {/* Combo de Clientes */}
      <div className="mb-4">
        <label>Clientes</label>
        <select
          value={clienteSelecionado ?? ""}
          onChange={(e) => setClienteSelecionado(Number(e.target.value))}
          className="border rounded w-full py-2 px-3"
        >
          <option value="">Selecione um cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Combo de Categorias */}
      <div className="mb-4">
        <label>Categorias</label>
        {/* <input
          type="text"
          placeholder="Filtrar categorias"
          value={searchCategoria}
          onChange={(e) => setSearchCategoria(e.target.value)}
          className="border rounded w-full py-2 px-3 mb-2"
        /> */}
        <select
          value={categoriaSelecionada ?? ""}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          className="border rounded w-full py-2 px-3"
        >
          <option value="">Selecione uma categoria</option>
          {categorias
            .filter((categoria) => categoria.descricao?.toLowerCase().includes(searchCategoria.toLowerCase()))
            .map((categoria) => (
              <option key={categoria.id??0} value={categoria.id??0}>
                {categoria.descricao??''}
              </option>
            ))}
        </select>
      </div>

      {/* Lista de Produtos */}
      <div className="mb-4">
        <label>Produtos</label>
        <div className="grid gap-4">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="flex flex-col border p-2 rounded space-y-2"
            >
              {/* Linha principal com Nome, Código e Botões */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{produto.nome}</p>
                  <p className="text-sm text-gray-500">
                    Código: {produto.codigoInterno ?? ""}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => adicionarProduto(produto)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => abrirModalProduto(produto)}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Consultar
                  </button>
                </div>
              </div>

              {/* Linha com Estoque Mínimo, Máximo e Quantidade */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <label className="text-sm">Mín:</label>
                  <input
                    type="text"
                    value={produto.estoqueMin ?? ""}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      atualizarProduto(produto.id, "estoqueMin", valor === "" ? 0 : Number(valor));
                    }}
                    className="border rounded w-full py-1 px-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm">Máx:</label>
                  <input
                    type="text"
                    value={produto.estoqueMax ?? ""}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      atualizarProduto(produto.id, "estoqueMax", valor === "" ? 0 : Number(valor));
                    }}
                    className="border rounded w-full py-1 px-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={adicionarCategoria}
          className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
        >
          Adicionar Todos
        </button>
      </div>

      {/* Lista Final */}
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">Lista Final</h2>
        {listaFinal.map((produto) => (
          <div key={produto.id} className="flex flex-col border p-2 rounded space-y-2">
             {/* Informações do produto */}
             <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{produto.nome}</p>
                  <p className="text-sm text-gray-500">Código: {produto.codigoInterno ?? ""}</p>
                </div>
                <button
                  onClick={() => removerProduto(produto.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Remover
                </button>
              </div>

              {/* Valores de Estoque e Pedido */}
              <div className="flex items-center space-x-8">
                <div>
                  <label className="text-sm font-bold">Mín:</label>
                  <span className="ml-2">{produto.estoqueMin}</span>
                </div>
                <div>
                  <label className="text-sm font-bold">Máx:</label>
                  <span className="ml-2">{produto.estoqueMax}</span>
                </div>
                {/* <div>
                  <label className="text-sm font-bold">Pedido:</label>
                  <span className="ml-2">{produto.quantidadeEstoque}</span>
                </div> */}
            </div>              
          </div>
        ))}
        <button
          onClick={removerTodosProdutos}
          className="bg-red-600 text-white px-4 py-2 mt-4 rounded"
        >
          Remover Todos
        </button>
      </div>

      {/* Botões de Salvar e Cancelar */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={salvarLista}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Salvar
        </button>
        <button
          onClick={() => history.back()}
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
