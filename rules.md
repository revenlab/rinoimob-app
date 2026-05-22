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

## Convenções

- TypeScript strict — sem `any`.
- Sem arquivos de componente novos desnecessários — preferir inline em `.vue` existente.
- Pinia stores: padrão `useXStore()`.
- Tailwind: sem CSS custom quando possível, usar classes utilitárias.
- `apiFetch<T>()` para todas as chamadas de API.
