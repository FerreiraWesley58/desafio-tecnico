import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Toolbar,
    Typography,
    Button,
    Tabs,
    Tab
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine the current tab value based on the current path
    const currentTab = React.useMemo(() => {
        if (location.pathname === '/produtos') return 0;
        if (location.pathname === '/categorias') return 1;
        if (location.pathname === '/produtos/novo') return 2;
        if (location.pathname === '/dashboard') return 3;
        return false; // No tab selected
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        switch (newValue) {
            case 0:
                navigate('/produtos');
                break;
            case 1:
                navigate('/categorias');
                break;
            case 2:
                navigate('/produtos/novo');
                break;
            case 3:
                navigate('/dashboard');
                break;
            default:
                break;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar 
                position="static" 
                color="default" 
                elevation={0}
                sx={{ 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                }}
            >
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                mr: 3,
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: 'primary.main',
                                color: 'white',
                            }}
                        >
                            <ShoppingCartOutlinedIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                flexGrow: 1,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            E-commerce Control
                        </Typography>
                    </Box>
                    <Tabs 
                        value={currentTab} 
                        onChange={handleTabChange} 
                        aria-label="navigation tabs"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 500,
                                minWidth: 100,
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'primary.main',
                            },
                        }}
                    >
                        <Tab label="Produtos" />
                        <Tab label="Categorias" />
                        <Tab label="Novo Produto" />
                        <Tab label="Dashboard" />
                    </Tabs>
                    <Button 
                        color="error" 
                        variant="contained" 
                        onClick={handleLogout} 
                        sx={{ 
                            ml: 2,
                            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                            },
                        }}
                    >
                        Sair
                    </Button>
                </Toolbar>
            </AppBar>
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    backgroundColor: 'background.default',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout; 