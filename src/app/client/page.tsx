"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ClientCreateForm } from './clientCreate';
import { ClientEditForm } from './clientEdit';
import { Snackbar } from '../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { Cliente } from '../../models/client';
import { SnackbarState } from '../../models/snackbarState';
import ConfirmationModal from '../../components/confirmationModal';

Modal.setAppElement('#__next');

export default function ItemsList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredItens, setfilteredItens] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, seteditingItem] = useState<Cliente | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ItemToDelete, setItemToDelete] = useState<number | null>(null);
  const [progress, setProgress] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});
  
  const totalPages = Math.ceil(filteredItens.length / recordsPerPage);

  const hideSnackbar = () => {
    setSnackbar((prev) => {
      const newSnackbarState = new SnackbarState(prev.message, prev.type, false); // Cria uma nova instância de SnackbarState
      return newSnackbarState;
    });
  };
  
  const loadClients = useCallback(async () => {
    try {
      const response = await axios.get('/api/Client'); // Certifique-se de que o endpoint está correto
      setClientes(response.data);
      setfilteredItens(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error("Erro ao carregar clientes:", error); // Log para facilitar o debug
      setSnackbar(new SnackbarState('Erro ao carregar Clientes!', 'error', true));
    }
  }, [setSnackbar]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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

  // Função de busca
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = clientes.filter((client) =>
      client.nome?.toLowerCase().includes(searchTerm)
    );

    setfilteredItens(filtered);
  }, [clientes]);

  const handleSave = useCallback(() => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
    loadClients();
  }, [loadClients]);

  const handleDelete = useCallback(async () => {
    if (ItemToDelete !== null) {
      try {
        await axios.delete(`/api/Client/${ItemToDelete}`);
        setSnackbar(new SnackbarState('Cliente excluído com sucesso!', 'success', true));
        setDeleteConfirmOpen(false);
        loadClients();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao excluir cliente!', 'error', true));
      }
    }
  }, [ItemToDelete, loadClients]);

  const handleEdit = useCallback((client: Cliente) => {
    seteditingItem(client);
    setIsEditing(true);
    setModalIsOpen(true);
    setDropdownVisible({});
  }, []);

  const handleNewItem = useCallback(() => {
    setIsEditing(false);
    seteditingItem(null);
    setModalIsOpen(true);
  }, []);

  const toggleDropdown = useCallback((id: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleDeleteConfirmation = useCallback((id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
    setDropdownVisible({});
  }, []);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentItems = filteredItens.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = useCallback((pageNumber: number) => setCurrentPage(pageNumber), []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const isClickInside = (event.target as HTMLElement).closest('.dropdown-actions');
    if (!isClickInside) {
      setDropdownVisible({});
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Menu /> */}
      <div className="container mx-auto p-8">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Clientes</h1>
          <button
            onClick={handleNewItem}
            className="bg-blue-500 text-white py-1 px-4 rounded-lg text-sm hover:bg-blue-600"
          >
            Novo Cliente
          </button>
          <button
            onClick={() => history.back()}
            className="bg-gray-500 text-white py-1 px-4 rounded-lg text-sm hover:bg-blue-600"
          >
            Voltar
          </button>          
        </div>

        {/* Campo de busca */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-4 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.42-1.42l4.28 4.29a1 1 0 11-1.42 1.42l-4.28-4.29zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {/* Lista de Clientes */}
        <div className="grid gap-4">
          {currentItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <p className="font-semibold">{item.nome}</p>
              </div>
              <div className="dropdown-actions relative">
                <button
                  onClick={() => toggleDropdown(item.id!)}
                  className="text-blue-600 text-sm font-medium"
                >
                  Ações
                </button>
                {dropdownVisible[item.id!] && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border">
                    <ul className="text-sm">
                      <li
                        onClick={() => handleEdit(item)}
                        className="py-1 px-4 hover:bg-gray-100 cursor-pointer"
                      >
                        Editar
                      </li>
                      {/* <li
                        onClick={() => handleDeleteConfirmation(item.id!)}
                        className="py-1 px-4 text-red-600 hover:bg-gray-100 cursor-pointer"
                      >
                        Excluir
                      </li> */}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botões de Paginação */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-1 px-2 rounded-md flex items-center justify-center shadow-sm transition-all duration-200 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <span className="text-gray-600 text-xs">Página {currentPage} de {totalPages}</span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredItens.length / recordsPerPage)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-1 px-2 rounded-md flex items-center justify-center shadow-sm transition-all duration-200 text-xs"
          >
            Próxima
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Modal de criação e edição */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-lg w-full"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          {isEditing ? (
            <ClientEditForm
              client={editingItem!}
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          ) : (
            <ClientCreateForm
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          )}
        </Modal>

        {/* Modal de confirmação de exclusão */}
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
          confirmText="Excluir"
          cancelText="Cancelar"
        />

        {/* Snackbar */}
        {snackbar.show && (
          <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} onClose={hideSnackbar} />
        )}
      </div>
    </div>
  );
}