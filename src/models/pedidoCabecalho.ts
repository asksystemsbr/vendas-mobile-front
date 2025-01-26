import { Produto } from "./produto";

export interface PedidoCabecalho {
    id?: number; // Mapeia ID do backend
    data?: Date | string ;
    total?:  number | null; 
    statis?: string; 
    clienteId?: number | null;  
    itens?: Produto[]; 
  }  