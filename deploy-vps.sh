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

# 1. Update sistem & install build tools
echo -e "\n${YELLOW}[1/6] Updating system & installing build tools (build-essential)...${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential python3

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

# 4. Setup file .env
echo -e "\n${YELLOW}[4/6] Setting up environment variables (.env)...${NC}"
if [ ! -f .env ]; then
    read -p "Masukkan URL Domain Cloudflare Anda (contoh: https://form.domainanda.com): " APP_URL
    SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "secret_$(date +%s)_key")

    cat <<EOF > .env
DATABASE_URL=file:./local.db
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

# Ensure SQLite database & WAL files have proper read/write permissions
echo -e "\n${YELLOW}[5.5/6] Setting database read/write permissions...${NC}"
touch local.db
chmod 666 local.db local.db-wal local.db-shm 2>/dev/null || true
if [ -n "$SUDO_USER" ]; then
    chown $SUDO_USER:$SUDO_USER local.db local.db-wal local.db-shm 2>/dev/null || true
fi

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
