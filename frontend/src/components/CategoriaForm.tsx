import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createCategoria, getCategorias } from '../services/api';
import { Categoria } from '../types';

const CategoriaForm: React.FC = () => {
    const [descricao, setDescricao] = useState('');
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const fetchCategorias = async () => {
        try {
            const data = await getCategorias();
            setCategorias(data);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCategoria({ descricao });
            setDescricao('');
            fetchCategorias();
        } catch (error) {
            console.error('Erro ao cadastrar categoria:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Gerenciar Categorias
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Descrição da categoria"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descrição da categoria"
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        sx={{ flexShrink: 0 }}
                    >
                        Adicionar
                    </Button>
                </Box>
            </Paper>

            <Grid container spacing={2}>
                {categorias.map((categoria) => (
                    <Grid item key={categoria.id} xs={12} sm={6} md={4}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" component="div">
                                {categoria.descricao}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ID: {categoria.id}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default CategoriaForm; 