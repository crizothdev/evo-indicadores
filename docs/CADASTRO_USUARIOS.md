# Cadastro de Usuários — Evo Indicadores

## Visão Geral

O sistema possui 4 roles de usuário. O cadastro segue regras diferentes conforme o tipo:

| Role | Método de Cadastro | Quem Cadastra |
|---|---|---|
| **Admin** | Firebase Auth Console | Manual pelo desenvolvedor |
| **Franquia** | Via app (Admin) | Admin do sistema |
| **Operacional** | Via app (Admin) | Admin do sistema |
| **Expansão** | Via app (Admin) | Admin do sistema |

## Fluxo de Cadastro

### 1. Admin (acesso total)

O admin é o único role que **não é cadastrado via app**. O processo é:

1. Acessar o **Firebase Console** → Authentication
2. Clicar em **"Add user"**
3. Preencher email e senha
4. Após criar, copiar o **User UID** gerado
5. No **Firestore**, criar documento em `users/{uid}`:
```json
{
  "name": "Nome do Admin",
  "email": "admin@evo.com",
  "role": "admin",
  "active": true
}
```

> O campo `role: "admin"` no Firestore é o que libera acesso total ao sistema.

### 2. Demais Roles (via app)

Franquia, Operacional e Expansão são cadastrados pelo **Admin** através da tela "Usuários" no sistema:

1. Admin acessa **Usuários** no menu lateral
2. Clica em **"Novo Usuário"**
3. Preenche: nome, email, role, unidade (se franquia)
4. O sistema:
   - Cria o usuário no **Firebase Auth** com email + senha temporária
   - Cria documento em `users/{uid}` com os dados
   - Envia email de redefinição de senha para o usuário

### Campos do Cadastro

| Campo | Obrigatório | Descrição |
|---|---|---|
| `name` | Sim | Nome completo |
| `email` | Sim | Email (será o login) |
| `role` | Sim | franchise / operacional / expansao |
| `unitId` | Apenas franchise | ID da unidade vinculada |

## Firebase Auth vs Firestore

```
Firebase Auth          Firestore (users/{uid})
─────────────          ──────────────────────
email                  name
uid (gerado)           email
                       role
                       unitId (se franchise)
                       active
                       createdAt
```

- **Firebase Auth**: gerencia autenticação (login/senha)
- **Firestore**: armazena dados do perfil (role, unidade)

O `AuthContext` lê o `role` do Firestore para controlar permissões.

## Segurança

- O campo `role` no Firestore **não deve ser editável pelo próprio usuário**
- Apenas o Admin pode alterar roles
- O Firebase Auth não armazena custom claims (roles ficam no Firestore)
- Futuro: implementar Firebase Custom Claims para segurança adicional

## Fluxo de Primeiro Acesso (Usuário)

1. Admin cadastra o usuário no sistema
2. Usuário recebe email de redefinição de senha
3. Usuário define sua senha
4. Login → AuthContext busca role no Firestore → redireciona conforme permissões
