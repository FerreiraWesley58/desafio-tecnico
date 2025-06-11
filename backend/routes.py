from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timedelta
import requests
from sqlalchemy.orm import Session
from models import Categoria, Produto, ProdutoResponse, Venda, FiltroProdutos, FiltroVendas, Usuario, UsuarioResponse, UsuarioDB
from passlib.context import CryptContext
from database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from utils import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dados em memória (temporário até migrar tudo para o banco)
categorias_db = []
produtos_db = []
vendas_db = []

# Função para obter cotação do dólar
async def get_dolar_rate():
    response = requests.get("https://economia.awesomeapi.com.br/last/USD-BRL")
    data = response.json()
    return float(data["USDBRL"]["bid"])

# Rotas para Categorias
@router.post("/categorias", response_model=Categoria)
async def criar_categoria(categoria: Categoria):
    categoria.id = len(categorias_db) + 1
    categorias_db.append(categoria)
    return categoria

@router.get("/categorias", response_model=List[Categoria])
async def listar_categorias():
    return categorias_db

# Rotas para Produtos
@router.post("/produtos", response_model=ProdutoResponse)
async def criar_produto(produto: Produto):
    # Verificar se a categoria existe
    if not any(c.id == produto.categoria_id for c in categorias_db):
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    produto.id = len(produtos_db) + 1
    produtos_db.append(produto)
    
    # Calcular status e valor em dólar
    cotacao_dolar = await get_dolar_rate()
    valor_dolar = produto.valor / cotacao_dolar
    
    if produto.quantidade_estoque < produto.quantidade_sugerida:
        status = "vermelho"
    elif produto.quantidade_estoque - produto.quantidade_sugerida <= 5:
        status = "amarelo"
    else:
        status = "verde"
    
    return ProdutoResponse(**produto.dict(), status=status, valor_dolar=valor_dolar)

@router.get("/produtos", response_model=List[ProdutoResponse])
async def listar_produtos(filtro: FiltroProdutos = None):
    produtos_filtrados = produtos_db
    
    if filtro:
        if filtro.categorias:
            produtos_filtrados = [p for p in produtos_filtrados if p.categoria_id in filtro.categorias]
        if filtro.descricao:
            produtos_filtrados = [p for p in produtos_filtrados if filtro.descricao.lower() in p.descricao.lower()]
    
    cotacao_dolar = await get_dolar_rate()
    produtos_response = []
    
    for produto in produtos_filtrados:
        if produto.quantidade_estoque > 0:  # Não mostrar produtos sem estoque
            valor_dolar = produto.valor / cotacao_dolar
            if produto.quantidade_estoque < produto.quantidade_sugerida:
                status = "vermelho"
            elif produto.quantidade_estoque - produto.quantidade_sugerida <= 5:
                status = "amarelo"
            else:
                status = "verde"
            
            produtos_response.append(ProdutoResponse(**produto.dict(), status=status, valor_dolar=valor_dolar))
    
    return produtos_response

# Rotas para Vendas
@router.post("/vendas", response_model=Venda)
async def registrar_venda(venda: Venda):
    # Verificar se o produto existe e tem estoque suficiente
    produto = next((p for p in produtos_db if p.id == venda.produto_id), None)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if produto.quantidade_estoque < venda.quantidade:
        raise HTTPException(status_code=400, detail="Quantidade insuficiente em estoque")
    
    # Atualizar estoque
    produto.quantidade_estoque -= venda.quantidade
    
    # Registrar venda
    venda.id = len(vendas_db) + 1
    venda.data_venda = datetime.now()
    vendas_db.append(venda)
    
    return venda

@router.get("/dashboard/vendas-recentes")
async def get_vendas_recentes():
    # Retornar as 4 últimas vendas
    vendas_ordenadas = sorted(vendas_db, key=lambda x: x.data_venda, reverse=True)
    return vendas_ordenadas[:4]

@router.get("/dashboard/vendas-categoria")
async def get_vendas_por_categoria():
    # Calcular total de vendas por categoria
    vendas_por_categoria = {}
    for venda in vendas_db:
        produto = next((p for p in produtos_db if p.id == venda.produto_id), None)
        if produto:
            categoria = next((c for c in categorias_db if c.id == produto.categoria_id), None)
            if categoria:
                vendas_por_categoria[categoria.descricao] = vendas_por_categoria.get(categoria.descricao, 0) + venda.quantidade
    
    # Ordenar e pegar as 3 categorias mais vendidas
    categorias_ordenadas = sorted(vendas_por_categoria.items(), key=lambda x: x[1], reverse=True)
    top_3 = categorias_ordenadas[:3]
    
    # Calcular total de "outros"
    outros_total = sum(qtd for _, qtd in categorias_ordenadas[3:])
    
    return {
        "categorias": [{"nome": cat, "quantidade": qtd} for cat, qtd in top_3],
        "outros": outros_total
    }

@router.get("/dashboard/produtos-mais-vendidos")
async def get_produtos_mais_vendidos():
    # Calcular total de vendas por produto
    vendas_por_produto = {}
    for venda in vendas_db:
        vendas_por_produto[venda.produto_id] = vendas_por_produto.get(venda.produto_id, 0) + venda.quantidade
    
    # Ordenar e pegar os 10 produtos mais vendidos
    produtos_ordenados = sorted(vendas_por_produto.items(), key=lambda x: x[1], reverse=True)
    top_10 = produtos_ordenados[:10]
    
    # Adicionar informações do produto
    resultado = []
    for produto_id, quantidade in top_10:
        produto = next((p for p in produtos_db if p.id == produto_id), None)
        if produto:
            resultado.append({
                "id": produto.id,
                "descricao": produto.descricao,
                "quantidade_vendida": quantidade,
                "valor": produto.valor
            })
    
    return resultado

# Rota de registro
@router.post("/register", response_model=UsuarioResponse)
async def register_user(user: Usuario, db: Session = Depends(get_db)):
    # Verificar se o usuário já existe
    db_user = db.query(UsuarioDB).filter(UsuarioDB.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já existe"
        )
    
    # Criar novo usuário com senha hasheada
    hashed_password = pwd_context.hash(user.password)
    db_user = UsuarioDB(
        username=user.username,
        password=hashed_password,
        full_name=user.full_name
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UsuarioResponse(
        username=db_user.username,
        full_name=db_user.full_name
    )

# Rota de login
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UsuarioDB).filter(UsuarioDB.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"} 