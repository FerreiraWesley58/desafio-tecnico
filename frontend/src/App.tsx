import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProdutoList from './components/ProdutoList';
import ProdutoForm from './components/ProdutoForm';
import CategoriaForm from './components/CategoriaForm';
import Layout from './components/Layout';

// Criar tema personalizado
const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb',
            light: '#60a5fa',
            dark: '#1e40af',
        },
        secondary: {
            main: '#7c3aed',
            light: '#a78bfa',
            dark: '#5b21b6',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

// Componente para verificar autenticação
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/produtos"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ProdutoList />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/produtos/novo"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ProdutoForm />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/categorias"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <CategoriaForm />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App; 