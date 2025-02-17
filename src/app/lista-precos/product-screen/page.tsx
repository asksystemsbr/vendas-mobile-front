"use client";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Produto } from "@/models/produto";
import { useAuth } from "@/app/auth";
import { Snackbar } from "@/app/snackbar";
import { SnackbarState } from "@/models/snackbarState";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ProductScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [categoriaNome, setCategoriaNome] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);
  const [produtoFocado, setProdutoFocado] = useState<Produto | null>(null); // Produto atualmente focado no campo "Pedido"

  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100);

  const authContext = useAuth ();

  const [searchTerm, setSearchTerm] = useState("");

  // Parâmetro para decidir se carrega produtos automaticamente ou só na busca
  const listarProdutos = searchParams.get("listarProdutos") === "true";


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
  // useEffect(() => {
  //   const categoriaIdParam = searchParams.get("categoriaId");
  //   setCategoriaId(categoriaIdParam ? Number(categoriaIdParam) : null);

  //   const fetchCategoriaNome = async () => {
  //     try {
  //       if (categoriaIdParam) {
  //         const response = await axios.get(`/api/Produto/getGrupo/${categoriaIdParam}`);
  //         setCategoriaNome(response.data.descricao || "Desconhecida");
  //       }
  //     } catch (error) {
  //       console.error("Erro ao buscar o nome da categoria:", error);
  //       setCategoriaNome("Desconhecida");
  //     }
  //   };

  //   if (categoriaIdParam) {
  //     fetchCategoriaNome();
  //   }
  // }, [searchParams]);

  // Carregar produtos da categoria selecionada
  useEffect(() => {

    const fetchProdutos = async () => {
      try {
        // if (categoriaId) {
        //   //const response = await axios.get(`/api/Produto/getByGrupo/${categoriaIdParam}`);
        //   const response = await axios.get("/api/ListaPreco/getProdutosByClienteCategoria", {
        //     params: { usuarioId: user.id,categoriaId:categoriaId },
        //   });

        //   const produtosComEstoque = response.data.map((produto: Produto) => ({
        //     ...produto,
        //     quantidadeEstoque: Math.max(0, (produto.estoqueMax ?? 0) - (produto.estoqueMin ?? 0)),
        //     // estoqueMin: 0,
        //     // estoqueMax: 0,
        //   }));
        //   setProdutos(produtosComEstoque);
        // }
        // else
        // {
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
        // }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    };

    // if (categoriaId !== undefined ) {
    //   fetchProdutos();
    // }

    if (listarProdutos) {
      fetchProdutos();
    }
  // }, [categoriaId, user.id,listarProdutos]);
    }, [ user.id,listarProdutos]);


    // Atualiza os produtos ao digitar na busca, se `listarProdutos === false`
    useEffect(() => {
      const fetchProdutosPorBusca = async () => {
        if (!listarProdutos && searchTerm.length > 0) {
          try {
            const response = await axios.get("/api/ListaPreco/getProdutosByUser", {
              params: { usuarioId: user.id, search: searchTerm },
            });

            const produtosComEstoque = response.data.map((produto: Produto) => ({
              ...produto,
              quantidadeEstoque: Math.max(0, (produto.estoqueMax ?? 0) - (produto.estoqueMin ?? 0)),
            }));

            setProdutos(produtosComEstoque);
          } catch (error) {
            console.error("Erro ao carregar produtos pela busca:", error);
          }
        }
      };

      fetchProdutosPorBusca();
    }, [searchTerm, listarProdutos, user.id]);

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


    const filteredProdutos = produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hideSnackbar = () => {
      setSnackbar((prev) => {
        const newSnackbarState = new SnackbarState(prev.message, prev.type, false); // Cria uma nova instância de SnackbarState
        return newSnackbarState;
      });
    };

  // const handleVisualizarPedido = (produtoId: number) => {
  //   router.push(`/visualizar-pedido?categoriaId=${categoriaId}&produtoId=${produtoId}`);
  // };

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
      router.push("../pedidos-abertos"); // Redireciona após sucesso
    }  catch (error) {
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

    const handleGerarPDF = async () => {
      const doc = new jsPDF("p", "mm", "a4");
      let yOffset = 10;
    
      doc.setFontSize(18);
      doc.text("Lista de Produtos", 10, yOffset);
      yOffset += 10;
    
      for (const produto of produtos) {
        doc.setFontSize(12);
        doc.text(`Nome: ${produto.nome}`, 10, yOffset);
        doc.text(`Preço: R$ ${produto.valorVenda?.toFixed(2)}`, 10, yOffset + 5);
        doc.text(`Código: ${produto.codigoInterno ?? "N/A"}`, 10, yOffset + 10);
        doc.text(`Mín: ${produto.estoqueMin ?? 0} | Máx: ${produto.estoqueMax ?? 0}`, 10, yOffset + 15);
        yOffset += 25;
    
        let imgBase64 = "";
    
        if (produto.foto) {
          try {
            // Verifica se a imagem está acessível
            const response = await fetch(produto.foto, { method: "GET" });
            if (!response.ok) throw new Error("Imagem não encontrada");
    
            // Converte a imagem para base64
            const imageResponse = await fetch(produto.foto);
            const blob = await imageResponse.blob();
            const reader = new FileReader();
    
            imgBase64 = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            console.warn(`Erro ao carregar imagem do produto ${produto.nome} (ID: ${produto.id}):`, error);
    
            // Usa uma imagem padrão caso a original falhe
            imgBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC...";
          }
    
          if (imgBase64) {
            doc.addImage(imgBase64, "JPEG", 10, yOffset, 50, 50);
            yOffset += 55;
          }
        }
    
        yOffset += 5;
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 10;
        }
      }
    
      doc.save("Lista_Produtos.pdf");
    };
    
    
  return (
    <div className="container mx-auto p-8 flex flex-col min-h-screen">
    {/* Cabeçalho fixo */}
    <div className="fixed top-0 left-0 w-full bg-white shadow-md z-10 p-4 flex flex-col gap-2">
      <h1 className="text-xl font-bold">Produtos {categoriaNome}</h1>
      {/* Campo de pesquisa */}
      <input
        type="text"
        placeholder="Buscar produto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full"
      />
      {/* Botões abaixo da pesquisa */}
      <div className="flex justify-between mt-2">
        <button
            onClick={() => {
              if (!produtoFocado) {
                alert("Selecione um produto antes de visualizar as fotos!");
                return;
              }
              abrirModalProduto(produtoFocado);
            }}
          className="bg-gray-500 text-white px-3 py-2 rounded"
          >
            Fotos
        </button>
        <button
           onClick={() => {
            setProdutos([]); // Limpa os produtos antes de mudar a rota
            router.replace(`/lista-precos/product-screen?listarProdutos=false&search=${searchTerm}`);
           }}
           className="bg-gray-500 text-white px-3 py-2 rounded"
           >
            Consultar Peças
        </button>
        <button   onClick={() => router.push("../pedidos-pendencias")}
            className="bg-gray-500 text-white px-3 py-2 rounded"
          >
            Pendências
        </button>
      </div>
    </div>

     {/* Espaço para o cabeçalho fixo */}
     <div className="mt-40 overflow-auto flex-grow pb-32">
        <div className="grid gap-3">
          {filteredProdutos.map((produto) => (
            <div key={produto.id} className="flex flex-col border p-2 rounded space-y-1">
              {/* Nome e Preço na mesma linha */}
              <div className="flex justify-between items-center">
                <p className="font-bold">{produto.nome}</p>
                <p className="font-bold text-green-600 whitespace-nowrap">R$ {produto.valorVenda?.toFixed(2)}</p>
              </div>

              {/* Código interno e Código de fábrica */}
              <div className="text-sm text-gray-500">
                <p>Código Fabrica: {produto.codigoInterno}</p>
                <p>Código Cliente: {produto.totalizadorParcial}</p>
              </div>

              {/* Estoques e Pedido */}
              <div className="flex items-center space-x-4 text-sm mt-1">
                <div>
                  <label className="font-bold">Mín:</label>
                  <br />
                  <span>{produto.estoqueMin ?? 0}</span>
                </div>
                <div>
                  <label className="font-bold">Máx:</label>
                  <br />
                  <span>{produto.estoqueMax ?? 0}</span>
                </div>
                <div>
                  <label className="font-bold">Fábrica:</label>
                  <br />
                  <span>{produto.quantidadeEstoqueAnterior ?? 0}</span>
                </div>
                <div>
                  <label className="font-bold">Pedido:</label>
                  <input
                    type="text"
                    value={produto.quantidadeEstoque}
                    onFocus={() => setProdutoFocado(produto)}
                    onChange={(e) => handleEditarQuantidade(produto.id, Number(e.target.value))}
                    className={`border rounded w-full py-1 px-2 ${
                      (produto.quantidadeEstoque??0) < (produto.quantidadeEstoqueAnterior??0) ? "border-red-500" : "border-green-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
          {/* Adiciona um espaço extra no final da listagem */}
        <div className="h-5"></div>
      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 flex justify-between">
        <button onClick={() => router.back()} className="bg-gray-500 text-white px-4 py-2 rounded">Voltar</button>
        <button onClick={handleGerarPedido} className="bg-blue-500 text-white px-4 py-2 rounded">Gerar Pedido</button>
        <button onClick={() => router.push("../pedidos-finalizados")} className="bg-green-500 text-white px-4 py-2 rounded">Pedidos Finalizados</button>
        <button onClick={handleGerarPDF} className="bg-red-500 text-white px-4 py-2 rounded"> Gerar PDF </button>        
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
          <p><strong>Código Fabrica:</strong> {modalProduto.codigoInterno??''}</p>
          <p><strong>Código Cliente:</strong> {modalProduto.totalizadorParcial??''}</p>
          <p><strong>Preço:</strong> R$ {modalProduto.valorVenda?.toFixed(2)}</p>
           
           {/* Exibir a imagem carregada */}
            {modalProduto.foto ? (
              <img src={modalProduto.foto} alt={modalProduto.nome} className="mt-4 max-w-full h-auto" />
            ) : (
              <p className="text-gray-500 mt-4">Nenhuma imagem disponível</p>
            )}

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
