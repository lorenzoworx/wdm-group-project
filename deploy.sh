#!/usr/bin/env bash
set -euo pipefail

# deploy.sh - build client locally and rsync client/build + server/api to remote UTA web root
# Usage: ./deploy.sh [--remote user@host] [--webroot /path/on/remote] [--no-build]

# Defaults - edit if necessary
REMOTE="bxp7143@bxp7143.uta.cloud"
REMOTE_WEBPATH="/home/bxp7143/public_html"
CLIENT_DIR="client"
SERVER_API_DIR="server/api"

# parse args
NO_BUILD=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote)
      REMOTE="$2"; shift 2;;
    --webroot)
      REMOTE_WEBPATH="$2"; shift 2;;
    --no-build)
      NO_BUILD=1; shift 1;;
    --help|-h)
      echo "Usage: $0 [--remote user@host] [--webroot /remote/path] [--no-build]";
      exit 0;;
    *)
      echo "Unknown arg: $1"; exit 1;;
  esac
done

echo "Deploy helper starting"
echo "REMOTE=${REMOTE}"
echo "REMOTE_WEBPATH=${REMOTE_WEBPATH}"

# verify ssh connectivity
echo "Checking SSH connectivity to ${REMOTE}..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "${REMOTE}" echo connected >/dev/null 2>&1; then
  echo "ERROR: cannot SSH to ${REMOTE}. Make sure you have access and key/credentials set up." >&2
  exit 2
fi
echo "SSH OK"

# Build client locally unless requested not to
if [[ ${NO_BUILD} -eq 0 ]]; then
  echo "Building client locally..."
  if [[ ! -d "${CLIENT_DIR}" ]]; then
    echo "ERROR: ${CLIENT_DIR} directory not found" >&2
    exit 3
  fi
  pushd "${CLIENT_DIR}" >/dev/null
  if [[ -f package-lock.json || -f yarn.lock ]]; then
    echo "Installing dependencies (npm ci)..."
    npm ci
  else
    echo "Installing dependencies (npm install)..."
    npm install
  fi
  npm run build
  popd >/dev/null
  echo "Client build complete"
else
  echo "Skipping build (--no-build)";
fi

# Ensure build exists
if [[ ! -d "${CLIENT_DIR}/build" ]]; then
  echo "ERROR: ${CLIENT_DIR}/build not found. Build failed or not run." >&2
  exit 4
fi

# Rsync client build to remote webroot
echo "Syncing client/build/ -> ${REMOTE}:${REMOTE_WEBPATH} (static site)"
rsync -avz --delete --progress --exclude 'api/**' --exclude 'resources/**' "${CLIENT_DIR}/build/" "${REMOTE}:${REMOTE_WEBPATH}/"

# Rsync API PHP files
if [[ -d "${SERVER_API_DIR}" ]]; then
  echo "Syncing server/api/ -> ${REMOTE}:${REMOTE_WEBPATH}/api/"
  rsync -avz --progress "${SERVER_API_DIR}/" "${REMOTE}:${REMOTE_WEBPATH}/api/"
else
  echo "No ${SERVER_API_DIR} directory found; skipping API sync"
fi

# Optional: sync resources folder if exists
if [[ -d "server/resources" ]]; then
  echo "Syncing server/resources/ -> ${REMOTE}:${REMOTE_WEBPATH}/resources/"
  rsync -avz --progress "server/resources/" "${REMOTE}:${REMOTE_WEBPATH}/resources/"
fi

# Ensure .htaccess is present on remote (create minimal SPA rewrite)
echo "Ensuring .htaccess exists on remote..."
ssh "${REMOTE}" "bash -lc 'if [ ! -f \"${REMOTE_WEBPATH}/.htaccess\" ]; then printf "%s\n" \"<IfModule mod_rewrite.c>\" \"RewriteEngine On\" \"RewriteBase /\" \"RewriteRule ^api/ - [L]\" \"RewriteCond %{REQUEST_FILENAME} -f [OR]\" \"RewriteCond %{REQUEST_FILENAME} -d\" \"RewriteRule ^ - [L]\" \"RewriteRule . /index.html [L]\" \"</IfModule>\" > \"${REMOTE_WEBPATH}/.htaccess\"; else echo '.htaccess exists'; fi'"

echo "Deploy finished at $(date)"

exit 0

