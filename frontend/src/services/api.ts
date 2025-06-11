import axios from 'axios';
import { Categoria, Produto, ProdutoResponse, Venda, FiltroProdutos, FiltroVendas, LoginResponse } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8000'
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Serviços de autenticação
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post<LoginResponse>('/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
};

export const registerUser = async (userData: { username: string; password: string; full_name: string }) => {
    const response = await api.post('/api/register', userData);
    return response.data;
};

// Serviços de categorias
export const getCategorias = async (): Promise<Categoria[]> => {
    const response = await api.get<Categoria[]>('/api/categorias');
    return response.data;
};

export const createCategoria = async (categoria: Categoria): Promise<Categoria> => {
    const response = await api.post<Categoria>('/api/categorias', categoria);
    return response.data;
};

// Serviços de produtos
export const getProdutos = async (filtro?: FiltroProdutos): Promise<ProdutoResponse[]> => {
    const response = await api.get<ProdutoResponse[]>('/api/produtos', { params: filtro });
    return response.data;
};

export const createProduto = async (produto: Produto): Promise<ProdutoResponse> => {
    const response = await api.post<ProdutoResponse>('/api/produtos', produto);
    return response.data;
};

// Serviços de vendas
export const createVenda = async (venda: Venda): Promise<Venda> => {
    const response = await api.post<Venda>('/api/vendas', venda);
    return response.data;
};

// Serviços do dashboard
export const getVendasRecentes = async (): Promise<Venda[]> => {
    const response = await api.get<Venda[]>('/api/dashboard/vendas-recentes');
    return response.data;
};

export const getVendasPorCategoria = async () => {
    const response = await api.get('/api/dashboard/vendas-categoria');
    return response.data;
};

export const getProdutosMaisVendidos = async () => {
    const response = await api.get('/api/dashboard/produtos-mais-vendidos');
    return response.data;
};

// Serviço para obter cotação do dólar
export const getDolarRate = async () => {
    const response = await api.get('/cotacao-dolar');
    return response.data;
};

// Serviço WebSocket
export const connectWebSocket = (onMessage: (data: any) => void) => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };
    
    return ws;
}; 