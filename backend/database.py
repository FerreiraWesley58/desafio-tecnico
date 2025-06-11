from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Obter a URL do banco de dados das variáveis de ambiente
DATABASE_URL = os.getenv("DATABASE_URL", "mysql://Wesley:123456@db:3306/ecommerce_control")

# Criar o engine do SQLAlchemy
engine = create_engine(DATABASE_URL)

# Criar uma sessão local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Criar uma classe base para os modelos
Base = declarative_base()

# Função para obter uma sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 