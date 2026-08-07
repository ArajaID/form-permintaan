#!/bin/bash
set -e

# Warna untuk output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}   AUTO DEPLOYMENT SCRIPT (Ubuntu 22.04 LTS + Cloudflare Tunnel)    ${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. Update sistem & install build tools & MariaDB
echo -e "\n${YELLOW}[1/6] Updating system & installing build tools & MariaDB...${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential python3 mariadb-server mariadb-client

# Ensure MariaDB is running
sudo systemctl enable mariadb || true
sudo systemctl start mariadb || true

# 2. Install Node.js 20 LTS & PM2
echo -e "\n${YELLOW}[2/6] Checking & Installing Node.js 20 LTS & PM2...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | sed 's/v//') -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
sudo npm install -g pm2

# 3. Install cloudflared
echo -e "\n${YELLOW}[3/6] Checking & Installing Cloudflare Tunnel (cloudflared)...${NC}"
if ! command -v cloudflared &> /dev/null; then
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    rm -f cloudflared.deb
fi

# 4. Setup MariaDB Database & file .env
echo -e "\n${YELLOW}[4/6] Setting up MariaDB & environment variables (.env)...${NC}"
if [ ! -f .env ]; then
    read -p "Masukkan URL Domain Cloudflare Anda (contoh: https://form.domainanda.com): " RAW_URL
    # Remove trailing slash
    RAW_URL=$(echo "$RAW_URL" | sed 's/*$//' | sed 's/\/*$//')
    # Prepend https:// if protocol missing
    if [[ ! "$RAW_URL" =~ ^http:// && ! "$RAW_URL" =~ ^https:// ]]; then
        APP_URL="https://${RAW_URL}"
    else
        APP_URL="${RAW_URL}"
    fi

    read -p "Masukkan MariaDB Connection URL (Default: mysql://root:@127.0.0.1:3306/form_permintaan): " DB_URL_INPUT
    if [ -z "$DB_URL_INPUT" ]; then
        DB_URL_INPUT="mysql://root:@127.0.0.1:3306/form_permintaan"
        # Create default database if local root
        sudo mysql -e "CREATE DATABASE IF NOT EXISTS form_permintaan;" || true
    fi

    SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "secret_$(date +%s)_key")

    cat <<EOF > .env
DATABASE_URL=${DB_URL_INPUT}
BETTER_AUTH_SECRET=${SECRET_KEY}
BETTER_AUTH_URL=${APP_URL}
NODE_ENV=production
EOF
    echo -e "${GREEN}File .env berhasil dibuat!${NC}"
else
    echo -e "${GREEN}File .env sudah ada, melewati pembuatan .env.${NC}"
fi

# 5. Install NPM Packages & Build
echo -e "\n${YELLOW}[5/6] Installing dependencies, pushing database schema & building app...${NC}"
npm ci
npx drizzle-kit push
npx tsx src/db/seed.ts || true
npm run build

# 6. PM2 Process Start
echo -e "\n${YELLOW}[6/6] Starting application with PM2...${NC}"
pm2 start npm --name "form-permintaan" -- start || pm2 restart form-permintaan
pm2 save

echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}   ✅ SETUP SERVER SELESAI! Aplikasi berjalan di http://localhost:3000${NC}"
echo -e "${GREEN}====================================================================${NC}"
echo -e "\n${CYAN}📌 Langkah Terakhir (Menghubungkan ke Cloudflare Tunnel):${NC}"
echo -e "1. Buka Cloudflare Zero Trust Dashboard (https://one.dash.cloudflare.com)"
echo -e "2. Masuk ke Networks -> Tunnels -> Create a Tunnel"
echo -e "3. Beri nama tunnel, lalu pilih OS 'Debian/Ubuntu 64-bit'"
echo -e "4. Copy perintah instalasi token di Cloudflare dan jalankan di VPS, contoh:"
echo -e "   ${YELLOW}sudo cloudflared service install <TOKEN_DARI_CLOUDFLARE>${NC}"
echo -e "5. Di Cloudflare Public Hostname, isi Service: ${YELLOW}HTTP${NC} dan URL: ${YELLOW}localhost:3000${NC}\n"
