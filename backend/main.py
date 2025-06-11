from fastapi import FastAPI, Depends, HTTPException, status, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import requests
import json
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from routes import router
from models import Usuario, UsuarioResponse, UsuarioDB
from database import engine, Base, get_db
from sqlalchemy.orm import Session
from utils import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

# Carregar variáveis de ambiente
load_dotenv()

# Criar as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Configuração do FastAPI
app = FastAPI(title="Sistema de Controle de Estoque")

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost", "http://localhost:80"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações de segurança
SECRET_KEY = os.getenv("SECRET_KEY", "sua_chave_secreta_aqui")  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Lista de conexões WebSocket ativas
active_connections: List[WebSocket] = []

# Função para verificar senha
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Função para criar token JWT
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Rota de login
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UsuarioDB).filter(UsuarioDB.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
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

# Rota para WebSocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast da mensagem para todos os clientes conectados
            for connection in active_connections:
                await connection.send_text(data)
    except:
        active_connections.remove(websocket)

# Incluir as rotas do router
app.include_router(router, prefix="/api")

# Rota para obter cotação do dólar
@app.get("/cotacao-dolar")
async def get_dolar_rate():
    try:
        response = requests.get("https://economia.awesomeapi.com.br/last/USD-BRL", timeout=5)
        response.raise_for_status()  
        data = response.json()
        return {"cotacao": float(data["USDBRL"]["bid"])}
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de cotação indisponível. Tente novamente mais tarde."
        )
    except (KeyError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar dados da cotação."
        )

# Rota de teste
@app.get("/")
async def root():
    return {"message": "API de Controle de Estoque"}

# Rota de registro
@app.post("/api/register", response_model=UsuarioResponse)
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