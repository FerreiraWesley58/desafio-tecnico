# Sistema de Controle de Estoque - E-commerce

Olá! Este é um sistema de controle de estoque que desenvolvi para e-commerce de um desafio técnico que me foi proposto, usando React no frontend e FastAPI no backend. Vou te explicar como ele funciona e como você pode começar a usá-lo.

## Como o Projeto Está Organizado

Organizei dessa forma para que qualquer desenvolvedor de qualquer nível consiga entender.

```
desafio-tecnico/
└── teste-desafio/
    └── desafio-tecnico/
        ├── backend/
        │   ├── app/
        │   │   ├── models/      # Aqui ficam os modelos do banco
        │   │   ├── schemas/     # Schemas para validação
        │   │   ├── routes/      # Todas as rotas da API
        │   │   └── services/    # Lógica de negócios
        │   ├── main.py
        │   ├── Dockerfile
        │   └── requirements.txt
        ├── frontend/
        │   ├── src/
        │   │   ├── components/  # Componentes reutilizáveis
        │   │   ├── pages/       # Páginas da aplicação
        │   │   ├── services/    # Serviços e APIs
        │   │   └── contexts/    # Contextos do React
        │   ├── package.json
        │   ├── Dockerfile
        │   └── tsconfig.json
        ├── docker-compose.yml
        ├── README.md
        └── .gitignore
```

## Vamos Começar

### 1. Primeiro, vamos configurar o ambiente

#### Backend (FastAPI)

Primeiro, vamos criar um ambiente virtual Python (isso ajuda a manter as dependências organizadas):

```bash
python -m venv venv
source venv/bin/activate  # Se você usa Linux/Mac
venv\Scripts\activate     # Se você usa Windows
```

Agora, vamos instalar as bibliotecas que iremos precisar:

```bash
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart websockets mysqlclient
```

#### Frontend (React)

Para o frontend, vamos criar um projeto React com TypeScript:

```bash
npx create-react-app frontend --template typescript
cd frontend
```

E instalar algumas bibliotecas úteis:

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-router-dom
npm install axios
npm install recharts
npm install jwt-decode
```

### 2. O que o Sistema Faz?

Desenvolvi este sistema pensando em facilitar o dia a dia de quem trabalha com e-commerce. Ele tem várias funcionalidades:

1. **Autenticação Segura**  
   * Login e logout  
   * Proteção das rotas  
   * Gerenciamento de sessão
2. **Gestão de Produtos**  
   * Cadastro com imagens  
   * Listagem com filtros  
   * Status visual (usando cores)  
   * Conversão automática de moedas  
   * Controle de estoque em tempo real
3. **Dashboard Intuitivo**  
   * Histórico de vendas  
   * Gráficos de categorias  
   * Ranking dos produtos mais vendidos  
   * Atualização em tempo real
4. **Sistema de Vendas**  
   * Seleção de quantidade  
   * Atualização automática do estoque  
   * Histórico completo de transações

### 3. Como Rodar o Projeto?

Você tem duas opções para rodar o projeto: localmente ou usando Docker.

#### Opção 1: Rodando Localmente

É bem simples! Siga estes passos em ordem:

1. **Backend (FastAPI)**

```bash
# 1. Entre na pasta do backend
cd desafio-tecnico/teste-desafio/desafio-tecnico/backend

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Inicie o servidor
uvicorn main:app --reload
```

O servidor backend estará rodando em http://localhost:8000

2. **Frontend (React)**

```bash
# 1. Abra um novo terminal
# 2. Entre na pasta do frontend
cd desafio-tecnico/teste-desafio/desafio-tecnico/frontend

# 3. Instale as dependências
npm install

# 4. Inicie o servidor
npm start
```

O frontend estará rodando em http://localhost:3000

#### Opção 2: Rodando com Docker

Se você preferir usar Docker, siga estes passos:

1. **Pré-requisitos**
   * Docker instalado
   * Docker Compose instalado

2. **Configuração dos Containers**

O projeto usa três containers principais:

```yaml
# Backend (FastAPI)
backend:
  image: wesleyferreira58/backend-app:latest
  ports:
    - "8000:8000"
  environment:
    - DATABASE_URL=mysql://wesley:123456@db:3306/controle_estoque
  depends_on:
    - db

# Frontend (React)
frontend:
  image: wesleyferreira58/frontend-app:latest
  ports:
    - "3000:3000"
  environment:
    - REACT_APP_API_URL=http://localhost:8000
  depends_on:
    - backend

# Banco de Dados (MySQL)
db:
  image: mysql:8.0
  ports:
    - "3306:3306"
  environment:
    - MYSQL_ROOT_PASSWORD=root
    - MYSQL_DATABASE=controle_estoque
    - MYSQL_USER=wesley
    - MYSQL_PASSWORD=123456
  volumes:
    - mysql_data:/var/lib/mysql
```

3. **Rodando o Projeto**

```bash
# 1. Na pasta raiz do projeto
cd desafio-tecnico/teste-desafio/desafio-tecnico

# 2. Construir e iniciar os containers
docker-compose up --build
```

4. **Acessando a Aplicação**

Após iniciar os containers, você pode acessar:
* Frontend: http://localhost:3000
* Backend: http://localhost:8000
* Documentação da API: http://localhost:8000/docs
* Banco de dados MySQL: localhost:3306

5. **Gerenciando os Containers**

```bash
# Verificar containers em execução
docker ps

# Ver logs dos containers
docker-compose logs

# Parar todos os containers
docker-compose down

# Parar e remover volumes (isso apagará os dados do banco)
docker-compose down -v

# Reconstruir e reiniciar containers
docker-compose up --build
```

6. **Persistência de Dados**

* Os dados do MySQL são persistidos através do volume `mysql_data`
* O volume é mantido mesmo após parar ou remover os containers
* Para fazer backup dos dados:
  ```bash
  docker exec -it [nome_do_container_mysql] mysqldump -u wesley -p123456 controle_estoque > backup.sql
  ```

7. **Credenciais do Banco de Dados**

* Host: localhost
* Porta: 3306
* Banco: controle_estoque
* Usuário: wesley
* Senha: 123456

8. **Credenciais da Aplicação**

* Usuário: wesley
* Senha: 123456

### 4. Tecnologias que Usei

* **Frontend:**  
  * React (porque é muito bom para interfaces e é o que mais estou utilizando no momento que criei esse projeto)  
  * TypeScript (para código mais seguro)  
  * Material-UI (para uma interface visualmente melhor)  
  * Recharts (para gráficos bonitos visualmente)  
  * Axios (para chamadas à API)  
  * WebSocket (para atualizações em tempo real)

* **Backend:**  
  * FastAPI (rápido e moderno)  
  * SQLAlchemy (para banco de dados)  
  * MySQL (banco de dados principal)  
  * JWT (para autenticação)  
  * WebSocket (para comunicação em tempo real)  
  * Pydantic (para validação de dados)

* **Infraestrutura:**
  * Docker (para containerização)
  * Docker Compose (para orquestração dos containers)
  * MySQL (banco de dados persistente)

### 5. O que Aprendi

Desenvolver este projeto foi uma experiência incrível! Aprendi muito sobre:
* Integração entre frontend e backend
* Containerização com Docker
* Persistência de dados com MySQL
* Como criar uma experiência de usuário fluida

Se você tiver alguma sugestão ou encontrar algum bug, me avise! Estou sempre aberto a melhorias e feedback.

Espero que este sistema seja útil para você, o diretório está público, você pode utilizar para aplicações reais ou trabalhos universitários! 