import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    Link
} from '@mui/material';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(username, password);
            localStorage.setItem('token', response.access_token);
            navigate('/dashboard');
        } catch (error) {
            setError('Usuário ou senha inválidos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
                    animation: 'pulse 15s infinite linear',
                },
                '@keyframes pulse': {
                    '0%': {
                        transform: 'translate(-50%, -50%) scale(1)',
                    },
                    '50%': {
                        transform: 'translate(-50%, -50%) scale(1.2)',
                    },
                    '100%': {
                        transform: 'translate(-50%, -50%) scale(1)',
                    },
                },
            }}
        >
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            borderRadius: 3,
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Box 
                            sx={{ 
                                mb: 3,
                                p: 2,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ShoppingCartOutlinedIcon color="primary" sx={{ fontSize: 48 }} />
                        </Box>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            E-commerce Control
                        </Typography>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                mb: 4,
                                color: 'text.secondary',
                                textAlign: 'center',
                            }}
                        >
                            Faça login para acessar o sistema
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Usuário"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Senha"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            />

                            {error && (
                                <Typography
                                    color="error"
                                    sx={{
                                        mt: 2,
                                        p: 1,
                                        borderRadius: 1,
                                        backgroundColor: 'error.light',
                                        color: 'error.contrastText',
                                        textAlign: 'center',
                                    }}
                                >
                                    {error}
                                </Typography>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1e40af 0%, #5b21b6 100%)',
                                    },
                                }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                            </Button>
                            <Box sx={{ textAlign: 'center' }}>
                                <Link href="/register" variant="body2">
                                    Não tem uma conta? Cadastre-se
                                </Link>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default Login; 