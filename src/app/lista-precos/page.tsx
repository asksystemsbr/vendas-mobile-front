"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { GrupoProduto } from "@/models/grupoProduto";


export default function CategoryScreen() {
  const [categorias, setCategorias] = useState<GrupoProduto[]>([]);
  const router = useRouter();

  // Buscar categorias ao carregar a tela
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get("/api/Produto/getGrupos");
        setCategorias(response.data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };

    fetchCategorias();
  }, []);

  const handleVisualizarPedido = (categoriaId: number) => {
    router.push(`/lista-precos/product-screen`);
  };

  const handleClickCategoria = (categoriaId: number) => {
    router.push(`/lista-precos/product-screen?categoriaId=${categoriaId}`);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-xl font-bold mb-4">Categorias</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="cursor-pointer transform transition-transform hover:scale-105 bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-200"
            onClick={() => handleClickCategoria(categoria.id??0)}
          >
            <p className="text-center font-medium text-sm">{categoria.descricao}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-4">
        <button
            onClick={() => handleVisualizarPedido(0)} // Envia 0 ou um valor padrão se nenhuma categoria foi selecionada
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        >
            Visualizar Pedido
        </button>
        <button
            onClick={() => history.back()}
            className="bg-gray-500 text-white px-4 py-2 mt-4 rounded"
            >
            Voltar
            </button>   
        </div>   
    </div>
  );
}
