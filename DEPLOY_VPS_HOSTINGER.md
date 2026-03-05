# Guia de Deploy - VPS Hostinger (Ubuntu)

Este guia cobre a instalação do Backend (NestJS) e Frontend (Next.js) na sua VPS.

## 1. Preparação da VPS

Acesse sua VPS via SSH e execute os comandos de atualização:

```bash
sudo apt update && sudo apt upgrade -y
```

### Instalar Node.js (v20+)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Instalar PM2 e Git
```bash
sudo npm install -g pm2
sudo apt install git -y
```

---

## 2. Deploy dos Serviços

```bash
# Navegue para onde deseja instalar
cd /var/www
sudo mkdir chatwoot-omni-v3 && cd chatwoot-omni-v3
sudo chown -R $USER:$USER .

# Clonar o código (Backend, Frontend e WhatsApp Service)
git clone https://github.com/seu-usuario/seu-repositorio.git .

# --- Configuração do Backend ---
cd backend
npm install
cp .env.example .env # Edite com suas credenciais
npx prisma generate
npm run build
cd ..

# --- Configuração do Frontend ---
cd frontend
npm install
cp .env.example .env.local # Edite com suas credenciais
npm run build
cd ..

# --- Configuração do WhatsApp Service ---
cd whatsapp-service
npm install
npm run build
cd ..

# --- Iniciar tudo com PM2 ---
pm2 start ecosystem.config.js
pm2 save
```

---

## 4. Configuração do Nginx (Reverse Proxy)

Para que as pessoas acessem seu site sem precisar digitar a porta (3000 ou 3001).

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/chatwoot
```

Copie o conteúdo do arquivo `nginx.conf` da raiz do projeto para este arquivo no servidor. Ajuste o `server_name` para seu domínio ou IP.

```bash
sudo ln -s /etc/nginx/sites-available/chatwoot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Salvar Processos do PM2
Para que o app ligue sozinho se o servidor reiniciar:
```bash
pm2 save
pm2 startup
```
*(Siga as instruções que o comando pm2 startup mostrar na tela)*
