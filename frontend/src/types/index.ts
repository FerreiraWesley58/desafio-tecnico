// Tipos para Categoria
export interface Categoria {
    id?: number;
    descricao: string;
}

// Tipos para Produto
export interface Produto {
    id?: number;
    descricao: string;
    valor: number;
    categoria_id: number;
    quantidade_estoque: number;
    quantidade_sugerida: number;
    imagem_url?: string;
}

// Tipos para resposta de produto
export interface ProdutoResponse extends Produto {
    status: 'vermelho' | 'amarelo' | 'verde';
    valor_dolar: number;
}

// Tipos para Venda
export interface Venda {
    id?: number;
    produto_id: number;
    quantidade: number;
    data_venda: string;
    usuario_id: number;
}

// Tipos para filtro de produtos
export interface FiltroProdutos {
    categorias?: number[];
    descricao?: string;
}

// Tipos para filtro de vendas
export interface FiltroVendas {
    data_inicio?: string;
    data_fim?: string;
}

// Tipos para usuário
export interface Usuario {
    username: string;
    password: string;
    full_name: string;
}

// Tipos para resposta de login
export interface LoginResponse {
    access_token: string;
    token_type: string;
} 