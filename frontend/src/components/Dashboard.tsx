import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    LinearProgress,
    Avatar,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    ArrowUpward as ArrowUpwardIcon,
    ShoppingCart as ShoppingCartIcon,
    Receipt as ReceiptIcon,
    Category as CategoryIcon,
    AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, XAxis, YAxis, Bar, CartesianGrid } from 'recharts';
import {
    getVendasRecentes,
    getVendasPorCategoria,
    getProdutosMaisVendidos,
    connectWebSocket,
    getProdutos,
    getCategorias,
    getDolarRate
} from '../services/api';
import { Venda, ProdutoResponse, Categoria } from '../types';

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ', ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const COLORS_PIE = ['#2563eb', '#7c3aed', '#60a5fa', '#a78bfa', '#3b82f6', '#8b5cf6'];

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const [vendasRecentes, setVendasRecentes] = useState<Venda[]>([]);
    const [vendasPorCategoria, setVendasPorCategoria] = useState<any>(null);
    const [produtosMaisVendidos, setProdutosMaisVendidos] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [allProdutos, setAllProdutos] = useState<ProdutoResponse[]>([]);
    const [keyMetrics, setKeyMetrics] = useState({
        produtosAtivos: 0,
        totalVendas: 0,
        categorias: 0,
        cotacaoDolar: 0
    });

    const carregarDados = async () => {
        try {
            const [vendas, categoriasVenda, produtosVendidos, allProdutos, allCategorias, dolarRate] = await Promise.all([
                getVendasRecentes(),
                getVendasPorCategoria(),
                getProdutosMaisVendidos(),
                getProdutos({}),
                getCategorias(),
                getDolarRate()
            ]);
            setVendasRecentes(vendas);
            const vendasPorCategoriaChartData: Array<{ nome: string; quantidade: number }> = categoriasVenda.categorias || [];
            if (categoriasVenda.outros > 0) {
                vendasPorCategoriaChartData.push({ nome: 'Outros', quantidade: categoriasVenda.outros });
            }

            const totalVendasCategoria = vendasPorCategoriaChartData.reduce((sum, item) => sum + (item.quantidade || 0), 0);

            setVendasPorCategoria({ chartData: vendasPorCategoriaChartData, total: totalVendasCategoria });
            console.log('Vendas por Categoria Data:', JSON.stringify({ chartData: vendasPorCategoriaChartData, total: totalVendasCategoria }, null, 2));

            setProdutosMaisVendidos(produtosVendidos);
            console.log('Produtos Mais Vendidos Data:', JSON.stringify(produtosVendidos, null, 2));
            setCategorias(allCategorias);
            setAllProdutos(allProdutos);
            setKeyMetrics({
                produtosAtivos: allProdutos.filter((p: ProdutoResponse) => p.quantidade_estoque > 0).length,
                totalVendas: vendas.reduce((sum: number, venda: Venda) => sum + venda.quantidade, 0),
                categorias: allCategorias.length,
                cotacaoDolar: dolarRate.cotacao
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    useEffect(() => {
        carregarDados();

        const ws = connectWebSocket(() => {
            carregarDados();
        });

        return () => {
            ws.close();
        };
    }, []);

    const getProductDetails = (productId: number) => {
        return `Produto #${productId}`;
    };

    const getCategoryName = (categoryId: number) => {
        const category = categorias.find((cat: Categoria) => cat.id === categoryId);
        return category ? category.descricao : 'Desconhecida';
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                {/* Key Metrics Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                                color: 'white',
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mb: 1, width: 48, height: 48 }}>
                                    <ShoppingCartIcon sx={{ color: 'white' }} />
                                </Avatar>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                                    {keyMetrics.produtosAtivos}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Produtos Ativos
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                                color: 'white',
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mb: 1, width: 48, height: 48 }}>
                                    <ReceiptIcon sx={{ color: 'white' }} />
                                </Avatar>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                                    {keyMetrics.totalVendas}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Total de Vendas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
                                color: 'white',
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mb: 1, width: 48, height: 48 }}>
                                    <CategoryIcon sx={{ color: 'white' }} />
                                </Avatar>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                                    {keyMetrics.categorias}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Categorias
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
                                color: 'white',
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mb: 1, width: 48, height: 48 }}>
                                    <AttachMoneyIcon sx={{ color: 'white' }} />
                                </Avatar>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                                    US$ {keyMetrics.cotacaoDolar.toFixed(2)}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Cotação USD
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts and Tables */}
                <Grid item xs={12} md={6}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <ArrowUpwardIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Histórico de Vendas
                            </Typography>
                        </Box>
                        {vendasRecentes.map((venda: Venda) => (
                            <Box 
                                key={venda.id} 
                                sx={{ 
                                    mb: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateX(4px)',
                                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                    },
                                }}
                            >
                                <Typography variant="body1" component="div" sx={{ fontWeight: 500 }}>
                                    {allProdutos.find(p => p.id === venda.produto_id)?.descricao || `Produto #${venda.produto_id}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Por: Usuário #{venda.usuario_id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatDateTime(venda.data_venda.toString())}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'right', color: 'primary.main' }}>
                                    {venda.quantidade}x
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Vendas por Categoria
                            </Typography>
                        </Box>
                        <Box sx={{ height: 300, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={vendasPorCategoria?.chartData || []}
                                        dataKey="quantidade"
                                        nameKey="nome"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {(vendasPorCategoria?.chartData || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: 8,
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {vendasPorCategoria?.total && (
                                <Box 
                                    sx={{ 
                                        position: 'absolute', 
                                        top: '50%', 
                                        left: '50%', 
                                        transform: 'translate(-50%, -50%)', 
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '50%',
                                        width: 100,
                                        height: 100,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {vendasPorCategoria.total}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            display: 'flex', 
                            flexDirection: 'column',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Top 10 Produtos Mais Vendidos
                            </Typography>
                        </Box>
                        <Box sx={{ height: 300 }}>
                            {produtosMaisVendidos && produtosMaisVendidos.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={produtosMaisVendidos}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                                        <XAxis 
                                            dataKey="descricao" 
                                            stroke={theme.palette.text.primary}
                                            tick={{ fill: theme.palette.text.primary }}
                                        />
                                        <YAxis 
                                            stroke={theme.palette.text.primary}
                                            tick={{ fill: theme.palette.text.primary }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: 8,
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                        <Bar dataKey="quantidade_vendida" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography color="text.secondary">Carregando dados...</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;