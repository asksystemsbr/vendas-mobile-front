"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PedidoCabecalho } from "@/models/pedidoCabecalho";
import { FilesOrder } from "@/models/filesOrders";
import { useAuth } from "../auth";


export default function OrdersWithFilesScreen() {
  const [pedidos, setPedidos] = useState<PedidoCabecalho[]>([]);
  const [arquivos, setArquivos] = useState<{ [pedidoId: number]: FilesOrder[] }>({});
  const [selectedFiles, setSelectedFiles] = useState<{ [pedidoId: number]: File | null }>({});
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
  

  const fetchPedidos = async () => {
    try {
      const response = await axios.get("/api/Pedido/GetPedidosByStatus", {
        params: { usuarioId: user.id, status: "finalizado" },
      });
      setPedidos(response.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    }
  };

  const fetchArquivos = async () => {
    const arquivosTemp: { [pedidoId: number]: FilesOrder[] } = {};

    for (const pedido of pedidos) {
      try {
        // 🔹 Buscar arquivos do tipo "boleto"
        const responseBoleto = await axios.get("/api/Pedido/GetFilesByPedido", {
          params: { pedidoId: pedido.id, type: "boleto", extension: "pdf" },
        });

        // 🔹 Buscar arquivos do tipo "comprovante"
        const responseComprovante = await axios.get("/api/Pedido/GetFilesByPedido", {
          params: { pedidoId: pedido.id, type: "comprovante", extension: "pdf" },
        });

        const pedidoId = pedido.id ?? 0; // Fallback para 0
        arquivosTemp[pedidoId] = [...responseBoleto.data, ...responseComprovante.data];
      } catch (error) {
        console.error(`Erro ao carregar arquivos do pedido ${pedido.id}:`, error);
      }
    }

    setArquivos(arquivosTemp);
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    if (pedidos.length > 0) {
      fetchArquivos();
    }
  }, [pedidos]);

  const downloadFile = async (filePath: string) => {
    try {
      const response = await axios.get("/api/Pedido/DownloadFile", {
        params: { filePath },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filePath.split("/").pop() || "arquivo");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
    }
  };

  const handleFileChange = (pedidoId: number, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [pedidoId]: file }));
  };

  const handleFileUpload = async (pedidoId: number) => {
    const file = selectedFiles[pedidoId];

    if (!file) {
      alert("Selecione um arquivo antes de fazer o upload.");
      return;
    }

    const formData = new FormData();
    formData.append("ID", pedidoId.toString());
    formData.append("Descricao", "COMPROVANTE");
    formData.append("file", file);

    try {
      const response = await axios.post("/api/Pedido/UploadFile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Upload realizado com sucesso!");

      // Atualiza os arquivos após o upload
      await fetchArquivos();

      setSelectedFiles((prev) => ({ ...prev, [pedidoId]: null }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload do arquivo.");
    }
  };


  return (
    <div className="container mx-auto p-8 flex flex-col min-h-screen">
      <h1 className="text-lg font-bold mb-6">Pedidos Aprovados com Boletos</h1>

      <div className="grid gap-3">
        {pedidos.map((pedido) => {
          const arquivosPedido = pedido.id ? arquivos[pedido.id] ?? [] : [];

          return (
            <div key={pedido.id ?? `pedido-sem-id`} className="border-b pb-4 mb-4">
              {/* <div className="flex justify-between items-center">
                <h2 className="font-bold">Pedido #{pedido.id ?? "Desconhecido"}</h2>
                <p className="text-sm">
                  {pedido.data ? new Date(pedido.data).toLocaleString() : "Data indisponível"}
                </p>
              </div> */}

              <div className="mt-2">
                {arquivosPedido.length > 0 ? (
                  arquivosPedido.map((file: FilesOrder) => (
                    <div
                      key={file.id}
                      className="flex flex-col items-start border p-2 rounded mt-2 bg-gray-100 cursor-pointer hover:bg-gray-200"
                      onClick={() => downloadFile(file.path)}
                    >
                      <span className="text-blue-500 break-all whitespace-normal w-full">
                        {file.path ? file.path.split("/").pop() : "Arquivo sem nome"}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {file.data ? new Date(file.data).toLocaleString() : "Sem data"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum arquivo encontrado.</p>
                )}
              </div>

              {/* Input de arquivo e botão de upload */}
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf,.xml,.jpg,.jpeg,.heic"
                  onChange={(e) => handleFileChange(pedido.id!, e.target.files?.[0] || null)}
                  className="border p-2 rounded w-full"
                />
                <button
                  onClick={() => handleFileUpload(pedido.id!)}
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full"
                >
                  Upload Comprovante
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => router.push("/")} className="bg-gray-500 text-white px-4 py-2 rounded mt-6">
        Voltar
      </button>
    </div>
  );
}