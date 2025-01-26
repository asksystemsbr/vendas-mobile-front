//src/app/client/clientEdit.tsx
"use client";
import React, { useState } from 'react';
import InputMask from 'react-input-mask-next';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Cliente } from '../../models/client';
import { SnackbarState } from '@/models/snackbarState';

interface ClientEditFormProps {
  client: Cliente;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const ClientEditForm = ({ client, onSave, onClose,setSnackbar  }: ClientEditFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<Cliente>({
    defaultValues: client,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: Cliente) => {
    try {
      setIsSubmitting(true); 
        await axios.put(`/api/Client/${client.id}`, data);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4 bg-white rounded-lg shadow-md" >
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Editar Cliente</h2>
        
        {/* Nome */}
        <div className="mb-4">
          <label className="block text-gray-700">Nome</label>
          <input
            {...register("nome", { required: "O nome é obrigatório" })}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
          {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
        </div>

        {/* Fantasia */}
        <div className="mb-4">
          <label className="block text-gray-700">Fantasia</label>
          <input
            {...register("fantasia")}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            {...register("email", { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
          {errors.email && <p className="text-red-500 text-sm">E-mail inválido.</p>}
        </div>

        {/* CPF/CNPJ */}
        <div className="mb-4">
          <label className="block text-gray-700">CNPJ</label>

          <InputMask
            mask="99.999.999/9999-99"
            {...register("cpfCnpj", { required: "O CNPJ é obrigatório" })}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />

          {errors.cpfCnpj && <p className="text-red-500 text-sm">{errors.cpfCnpj.message}</p>}
        </div>

        {/* CEP */}
        <div className="mb-4">
          <label className="block text-gray-700">CEP</label>
          <InputMask
              mask="99999-999"
              {...register("cep")}
              className="border rounded w-full py-2 px-3 mt-1 text-sm"
            />
        </div>

        {/* Logradouro */}
        <div className="mb-4">
          <label className="block text-gray-700">Logradouro</label>
          <input
            {...register("logradouro")}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
        </div>

        {/* Número */}
        <div className="mb-4">
          <label className="block text-gray-700">Número</label>
          <input
            {...register("numero")}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
        </div>

        {/* Complemento */}
        <div className="mb-4">
          <label className="block text-gray-700">Complemento</label>
          <input
            {...register("complemento")}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
        </div>

        {/* Bairro */}
        <div className="mb-4">
          <label className="block text-gray-700">Bairro</label>
          <input
            {...register("bairro")}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
        </div>

        {/* Cidade */}
        <div className="mb-4">
          <label className="block text-gray-700">Cidade</label>
          <input
            {...register("cidade")}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
        </div>

        {/* Celular */}
        <div className="mb-4">
          <label className="block text-gray-700">Celular</label>
          <InputMask
            mask="(99) 99999-9999"
            {...register("celular")}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
        </div>

        {/* Fone Fixo */}
        <div className="mb-4">
          <label className="block text-gray-700">Fone Fixo</label>
          <InputMask
            {...register("foneOne")}
            mask="(99) 9999-9999"     
            maskPlaceholder={null}
            alwaysShowMask={false}                   
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
        </div>

        {/* Usuário */}
        <div className="mb-4">
          <label className="block text-gray-700">Usuário</label>
          <input
            {...register("usuario", { required: "O usuário é obrigatório" })}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
          {errors.usuario && <p className="text-red-500 text-sm">{errors.usuario.message}</p>}
        </div>

        {/* Senha */}
        <div className="mb-4">
          <label className="block text-gray-700">Senha</label>
          <input
            type="password"
            {...register("senha", { required: "A senha é obrigatória" })}
            className="border rounded w-full py-2 px-3 mt-1 text-sm"
          />
          {errors.senha && <p className="text-red-500 text-sm">{errors.senha.message}</p>}
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-gray-400 text-white rounded-md text-sm hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-4 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
    </form>
  </div>
  );
};
