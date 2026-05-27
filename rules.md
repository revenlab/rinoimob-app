# rinoimob-app — rule.md

Arquivo de histórico de mudanças e crumbs para reduzir tokens em contextos futuros.

---

## Stack

Vue 3 + Vite + TypeScript (strict) + Pinia + Vue Router + Tailwind CSS.
Design system: **Glassmorphism** (backdrop-blur, semi-transparent, bordas sutis).

---

## Módulo de Suporte (`/tenants` — `TenantsAdmin.vue`)

### Acesso

Apenas staff interno (`authStore.isInternalStaff`). Rota `/tenants` com guard.
Menu item `internalOnly: true` em `AppLayout.vue`.

### Tabs disponíveis

| Tab | Permissão necessária |
|-----|----------------------|
| Tenants | `canViewTenants` |
| Operadores | `canViewOperators` |
| Auditoria | `canViewAudit` |

### Permissões no auth store (`src/stores/auth.ts`)

```typescript
supportPermissions: string[]          // populado do MeResponse
hasSupportPermission(p): boolean

// helpers computados:
canViewTenants / canEditTenants
canViewTenantUsers / canEditTenantUsers
canViewOperators / canEditOperators
canViewAudit
canViewHealth
```

### Serviço (`src/services/tenantsAdmin.ts`) — métodos disponíveis

| Método | Endpoint |
|--------|----------|
| `listTenants()` | GET /support/tenants |
| `setTenantStatus(id, active)` | PATCH /support/tenants/{id}/status |
| `updateTenant(id, {name,subdomain})` | PATCH /support/tenants/{id} |
| `listTenantUsers(tenantId)` | GET /support/tenants/{id}/users |
| `setUserStatus(tenantId, userId, active)` | PATCH /support/tenants/{id}/users/{uid}/status |
| `updateTenantUser(tenantId, userId, data)` | PATCH /support/tenants/{id}/users/{uid} |
| `resendInvitation(tenantId, userId)` | POST /support/.../resend-invitation |
| `resetAccess(tenantId, userId)` | POST /support/.../reset-access |
| `listOperators()` | GET /support/operators |
| `setOperatorRole(userId, role)` | PATCH /support/operators/{id}/role |
| `getOperatorPermissions(userId)` | GET /support/operators/{id}/permissions |
| `setOperatorPermissions(userId, perms)` | PUT /support/operators/{id}/permissions |
| `getDashboard()` | GET /support/dashboard |

### Types (`src/types/tenantsAdmin.ts`)

- `SUPPORT_PERMISSIONS` — array com 8 entradas `{ value, label }`
- `SupportPermissionValue` — union type dos 8 valores
- `SupportDashboard` — stats do dashboard de suporte
- `TenantSummary`, `TenantUserSummary` — DTOs principais

---

## Layout (`src/layouts/AppLayout.vue`)

Filtro de nav:
```
(!item.internalOnly || isInternalStaff) && (!item.clientOnly || !isInternalStaff)
```

- `internalOnly: true` → só staff interno vê (ex: /tenants)
- `clientOnly: true` → só clientes veem (imóveis, leads, categorias, etc. — 9 itens)

---

## Dashboard (`src/views/Dashboard.vue`)

Dual-mode:
- `v-if="!authStore.isInternalStaff"` → dashboard CRM (clientes)
- `v-else` → dashboard de suporte (stats de tenants + atividade recente do agente + perfil)

---

## Website Config (`src/views/WebsiteConfig.vue`)

Rota: `/website-config` | Nav: `Site` (`clientOnly: true`)

4 abas: Visual, Conteúdo, Contato, Blog.

- Upload de logo/favicon com preview.
- Color pickers para `primaryColor` e `secondaryColor`.
- Aba Conteúdo agora edita hero + blocos da home (`featured`, `launches`, `categories`, `services`, `stats`, `blog`, `cta`).
- Aba Blog usa `BlogPostsManager.vue` com editor WYSIWYG (Quill) para criar/editar/publicar posts.
- Live preview card com as configurações atuais.
- Serviço: `src/services/websiteConfig.ts`

### Serviço (`src/services/websiteConfig.ts`) — métodos disponíveis

| Método | Endpoint |
|--------|----------|
| `getConfig()` | GET /website-config |
| `updateConfig(data)` | PUT /website-config |
| `uploadLogo(file)` | POST /website-config/logo |
| `uploadFavicon(file)` | POST /website-config/favicon |
| `deleteLogo()` | DELETE /website-config/logo |
| `deleteFavicon()` | DELETE /website-config/favicon |
| `getSupportConfig(tenantId)` | GET /support/tenants/{id}/website-config |
| `updateSupportConfig(tenantId, data)` | PUT /support/tenants/{id}/website-config |

### Aba Site no TenantsAdmin (`TenantsAdmin.vue`)

Tab `Site` visível quando `canEditTenants`. Permite ao suporte editar `website-config` e posts de blog de qualquer tenant (subaba Blog).

### Types (`src/types/tenantsAdmin.ts`)

- `TenantWebsiteConfig` — DTO completo com todos os campos de branding
- `TenantWebsiteConfig` — DTO completo com branding + campos CMS da home
- `BlogPost` / `BlogPostFormInput` / `BlogPostStatus` — tipos do CMS de blog

---

## Convenções

- TypeScript strict — sem `any`.
- Sem arquivos de componente novos desnecessários — preferir inline em `.vue` existente.
- Pinia stores: padrão `useXStore()`.
- Tailwind: sem CSS custom quando possível, usar classes utilitárias.
- `apiFetch<T>()` para todas as chamadas de API.

---

## Last Changes

- Leads UI (`LeadsManagement.vue` e `LeadDetail.vue`) agora exibe `source` dinâmico, incluindo origens detalhadas como `PORTAL_HOME_FORM` e `PORTAL_PROPERTY_FORM`, ao invés de colapsar tudo em apenas "Portal" ou "Manual".
- Realtime de leads via WebSocket: `websocket` store ganhou `subscribeToTenantLeads()`. `LeadsManagement.vue` e `LeadDetail.vue` agora assinam `/topic/{tenantId}.leads` para refletir criação, atualização de status e deleção sem refresh.
