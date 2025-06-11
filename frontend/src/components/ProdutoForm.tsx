import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Grid,
    Card,
    CardMedia,
    Alert,
    IconButton,
} from '@mui/material';
import { createProduto, getCategorias } from '../services/api';
import { Categoria } from '../types';
import CloseIcon from '@mui/icons-material/Close';

const ProdutoForm: React.FC = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [formData, setFormData] = useState({
        descricao: '',
        valor: '',
        categoria_id: '',
        quantidade_estoque: '',
        quantidade_sugerida: '10',
        imagem_url: '',
    });
    const [imageError, setImageError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        const carregarCategorias = async () => {
            try {
                const data = await getCategorias();
                setCategorias(data);
            } catch (error) {
                console.error('Erro ao carregar categorias:', error);
            }
        };
        carregarCategorias();
    }, []);

    const validateImageUrl = (url: string) => {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleImageUrlChange = (url: string) => {
        setFormData(prev => ({ ...prev, imagem_url: url }));
        setImageError(null);
        
        if (!url) {
            setImagePreview(null);
            return;
        }

        if (!validateImageUrl(url)) {
            setImageError('URL inválida');
            setImagePreview(null);
            return;
        }

        // Test if the image can be loaded
        const img = new Image();
        img.onload = () => {
            setImagePreview(url);
            setImageError(null);
        };
        img.onerror = () => {
            setImageError('Não foi possível carregar a imagem');
            setImagePreview(null);
        };
        img.src = url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (imageError) return;

        try {
            await createProduto({
                ...formData,
                valor: parseFloat(formData.valor),
                categoria_id: parseInt(formData.categoria_id),
                quantidade_estoque: parseInt(formData.quantidade_estoque),
                quantidade_sugerida: parseInt(formData.quantidade_sugerida),
            });
            // Limpar formulário após sucesso
            setFormData({
                descricao: '',
                valor: '',
                categoria_id: '',
                quantidade_estoque: '',
                quantidade_sugerida: '10',
                imagem_url: '',
            });
            setImagePreview(null);
        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const { name, value } = e.target;
        if (name === 'imagem_url') {
            handleImageUrlChange(value);
        } else {
            setFormData((prev) => ({
                ...prev,
                [name as string]: value,
            }));
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Cadastrar Produto
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição do Produto"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                margin="normal"
                                required
                                placeholder="Descrição do Produto"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="URL da Imagem"
                                name="imagem_url"
                                value={formData.imagem_url}
                                onChange={handleChange}
                                margin="normal"
                                placeholder="https://exemplo.com/imagem.jpg"
                                error={!!imageError}
                                helperText={imageError}
                                InputProps={{
                                    endAdornment: formData.imagem_url && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleImageUrlChange('')}
                                            edge="end"
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Grid>

                        {imagePreview && (
                            <Grid item xs={12}>
                                <Card sx={{ maxWidth: 200, mx: 'auto', mb: 2 }}>
                                    <CardMedia
                                        component="img"
                                        image={imagePreview}
                                        alt="Preview"
                                        sx={{ height: 200, objectFit: 'contain' }}
                                    />
                                </Card>
                            </Grid>
                        )}

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Preço (R$)"
                                name="valor"
                                type="number"
                                value={formData.valor}
                                onChange={handleChange}
                                margin="normal"
                                required
                                inputProps={{ step: '0.01', min: '0' }}
                                placeholder="Preço (R$)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    name="categoria_id"
                                    value={formData.categoria_id}
                                    onChange={handleChange}
                                    label="Categoria"
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        Selecione uma categoria
                                    </MenuItem>
                                    {categorias.map((categoria) => (
                                        <MenuItem key={categoria.id} value={categoria.id}>
                                            {categoria.descricao}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Quantidade em Estoque"
                                name="quantidade_estoque"
                                type="number"
                                value={formData.quantidade_estoque}
                                onChange={handleChange}
                                margin="normal"
                                required
                                inputProps={{ min: '0' }}
                                placeholder="Quantidade em Estoque"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Estoque Sugerido"
                                name="quantidade_sugerida"
                                type="number"
                                value={formData.quantidade_sugerida}
                                onChange={handleChange}
                                margin="normal"
                                required
                                inputProps={{ min: '1' }}
                                placeholder="Estoque Sugerido"
                            />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={!!imageError}
                    >
                        Cadastrar Produto
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ProdutoForm; 