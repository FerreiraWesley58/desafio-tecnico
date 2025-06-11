import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    InputAdornment,
    Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getProdutos, getCategorias, createVenda } from '../services/api';
import { ProdutoResponse, Categoria } from '../types';

const ProdutoList: React.FC = () => {
    const [produtos, setProdutos] = useState<ProdutoResponse[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [filtroDescricao, setFiltroDescricao] = useState('');
    const [filtroCategorias, setFiltroCategorias] = useState<number[]>([]);
    const [quantidadeCompra, setQuantidadeCompra] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoResponse | null>(null);
    const [dialogAberto, setDialogAberto] = useState(false);

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [produtosData, categoriasData] = await Promise.all([
                getProdutos({
                    descricao: filtroDescricao,
                    categorias: filtroCategorias.length > 0 ? filtroCategorias : undefined,
                }),
                getCategorias(),
            ]);
            setProdutos(produtosData);
            setCategorias(categoriasData);
        } catch (error) {
            setError('Erro ao carregar dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [filtroDescricao, filtroCategorias]);

    const handleCompra = async (produto: ProdutoResponse) => {
        setProdutoSelecionado(produto);
        setDialogAberto(true);
    };

    const confirmarCompra = async () => {
        if (!produtoSelecionado) return;

        setLoading(true);
        try {
            const quantidade = quantidadeCompra[produtoSelecionado.id!] || 1;
            await createVenda({
                produto_id: produtoSelecionado.id!,
                quantidade,
                data_venda: new Date().toISOString(),
                usuario_id: 1,
            });
            setSuccess('Compra realizada com sucesso!');
            carregarDados();
            setQuantidadeCompra((prev) => ({ ...prev, [produtoSelecionado.id!]: 1 }));
        } catch (error) {
            setError('Erro ao realizar compra. Tente novamente.');
        } finally {
            setLoading(false);
            setDialogAberto(false);
            setProdutoSelecionado(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'vermelho':
                return '#f44336';
            case 'amarelo':
                return '#ffeb3b';
            case 'verde':
                return '#4caf50';
            default:
                return '#757575';
        }
    };

    const handleQuantidadeChange = (produtoId: number, value: string) => {
        const novaQuantidade = Math.max(1, parseInt(value) || 1);
        setQuantidadeCompra((prev) => {
            const novoEstado = { ...prev };
            novoEstado[produtoId] = novaQuantidade;
            return novoEstado;
        });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Feedback de erro e sucesso */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error">
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccess(null)} severity="success">
                    {success}
                </Alert>
            </Snackbar>

            {/* Dialog de confirmação */}
            <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)}>
                <DialogTitle>Confirmar Compra</DialogTitle>
                <DialogContent>
                    {produtoSelecionado && (
                        <Typography>
                            Deseja comprar {quantidadeCompra[produtoSelecionado.id!] || 1} unidade(s) de {produtoSelecionado.descricao}?
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
                    <Button onClick={confirmarCompra} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Filtros */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Buscar produtos..."
                            value={filtroDescricao}
                            onChange={(e) => setFiltroDescricao(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Categorias</InputLabel>
                            <Select
                                multiple
                                value={filtroCategorias}
                                onChange={(e) => setFiltroCategorias(e.target.value as number[])}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip
                                                key={value}
                                                label={categorias.find((c) => c.id === value)?.descricao}
                                            />
                                        ))}
                                    </Box>
                                )}
                                startAdornment={(
                                    <InputAdornment position="start">
                                        <FilterListIcon />
                                    </InputAdornment>
                                )}
                                displayEmpty
                            >
                                {categorias.map((categoria) => (
                                    <MenuItem key={categoria.id} value={categoria.id}>
                                        {categoria.descricao}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Segure Ctrl para selecionar múltiplas categorias
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Lista de Produtos */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {produtos.map((produto) => (
                        <Grid item key={produto.id} xs={12} sm={6} md={4} lg={3}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        image={produto.imagem_url || 'https://via.placeholder.com/150'}
                                        alt={produto.descricao}
                                        sx={{ aspectRatio: '1 / 1', objectFit: 'contain', maxHeight: 200 }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            backgroundColor: getStatusColor(produto.status),
                                            zIndex: 1,
                                        }}
                                    />
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                                        {produto.descricao}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Categoria: {categorias.find(cat => cat.id === produto.categoria_id)?.descricao}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Estoque: {produto.quantidade_estoque} unidades
                                    </Typography>
                                    <Typography variant="h6" component="p" sx={{ mt: 1 }}>
                                        R$ {produto.valor.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        US$ {produto.valor_dolar.toFixed(2)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                        <TextField
                                            type="number"
                                            label="Qtd"
                                            value={quantidadeCompra[produto.id!] || 1}
                                            onChange={(e) => handleQuantidadeChange(produto.id!, e.target.value)}
                                            inputProps={{
                                                min: 1,
                                            }}
                                            sx={{ width: 70, mr: 1 }}
                                            size="small"
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleCompra(produto)}
                                            disabled={produto.quantidade_estoque === 0 || loading}
                                            sx={{ flexGrow: 1 }}
                                        >
                                            Comprar
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default ProdutoList; 