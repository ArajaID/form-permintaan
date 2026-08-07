#!/bin/bash
set -e

# Warna untuk output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}   UPDATE SCRIPT (Form Permintaan Barang - Production VPS)         ${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. Pull kode terbaru dari Git
echo -e "\n${YELLOW}[1/4] Pulling latest code from repository...${NC}"
git pull

# 2. Install dependencies & push database schema
echo -e "\n${YELLOW}[2/4] Installing dependencies & updating MariaDB schema...${NC}"
npm ci
npx drizzle-kit push

# 3. Build Next.js Production
echo -e "\n${YELLOW}[3/4] Building Next.js production bundle...${NC}"
npm run build

# 4. Restart PM2 Process (Zero Downtime Reload)
echo -e "\n${YELLOW}[4/4] Reloading PM2 process...${NC}"
pm2 reload form-permintaan || pm2 restart form-permintaan
pm2 save

echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}   ✅ UPDATE VPS SELESAI! Aplikasi telah diperbarui & berjalan.     ${NC}"
echo -e "${GREEN}====================================================================${NC}\n"
