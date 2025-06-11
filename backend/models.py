from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from typing import Optional, List
from datetime import datetime

# Modelos SQLAlchemy
class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password = Column(String(100))
    full_name = Column(String(100))

# Modelos Pydantic
class Usuario(BaseModel):
    username: str
    password: str
    full_name: str

# Modelo para resposta de usuário (sem senha)
class UsuarioResponse(BaseModel):
    username: str
    full_name: str

    class Config:
        orm_mode = True

# Modelo para Categoria
class Categoria(BaseModel):
    id: Optional[int] = None
    descricao: str

    class Config:
        orm_mode = True

# Modelo para Produto
class Produto(BaseModel):
    id: Optional[int] = None
    descricao: str
    valor: float
    quantidade_estoque: int
    quantidade_sugerida: int
    categoria_id: int

    class Config:
        orm_mode = True

# Modelo para Venda
class Venda(BaseModel):
    id: Optional[int] = None
    produto_id: int
    quantidade: int
    data_venda: Optional[datetime] = None

    class Config:
        orm_mode = True

# Modelo para resposta de produto com status
class ProdutoResponse(Produto):
    status: str  # "vermelho", "amarelo" ou "verde"
    valor_dolar: float

# Modelo para filtro de produtos
class FiltroProdutos(BaseModel):
    categorias: Optional[List[int]] = None
    descricao: Optional[str] = None

# Modelo para filtro de vendas
class FiltroVendas(BaseModel):
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None 