# Deploy — Evo Indicadores

## Firebase Hosting

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Inicializar Firebase no projeto

```bash
firebase init
```

Selecionar:
- **Hosting**: Configure files for Firebase Hosting
- **Use an existing project**: `evo-indicadores` (ou criar novo)
- **Public directory**: `dist`
- **Configure as single-page app**: Yes
- **Overwrite index.html**: No

### 3. Configurar variáveis de ambiente

No Firebase Console, ou via CLI:

```bash
firebase functions:config:set \
  firebase.api_key="AIzaSy..." \
  firebase.auth_domain="evo-indicadores.firebaseapp.com" \
  firebase.project_id="evo-indicadores"
```

### 4. Build e Deploy

```bash
npm run build
firebase deploy --only hosting
```

### 5. URL

```
https://evo-indicadores.web.app
https://evo-indicadores.firebaseapp.com
```

---

## GitHub Pages (alternativa)

### 1. Criar repositório

Crie um repositório no GitHub chamado `evo-indicadores`.

### 2. Conectar e push

```bash
git remote add origin https://github.com/SEU_USUARIO/evo-indicadores.git
git push -u origin main
```

### 3. Configurar Secrets

No repositório: **Settings → Secrets and variables → Actions → New repository secret**

| Nome | Valor |
|------|-------|
| `VITE_FIREBASE_API_KEY` | Chave API do Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio Auth |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

### 4. GitHub Actions Workflow

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 5. Configurar GitHub Pages

**Settings → Pages**:
- Source: GitHub Actions

### 6. Autorizar domínio no Firebase

Firebase Console → **Authentication → Settings → Authorized domains**:
- `SEU_USUARIO.github.io`

---

## Variáveis de Ambiente

Arquivo `.env` (não versionado):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

O projeto funciona em **modo mock** quando as variáveis não estão configuradas (útil para desenvolvimento local sem Firebase).
