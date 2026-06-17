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

- **Tipos de imóveis desacoplados de categorias**:
  - Nova rota/tela `src/views/PropertyTypesManagement.vue` em `/tipos-de-imoveis`, separada da gestão de categorias.
  - `propertyService` ganhou `uploadPropertyTypeCoverImage()` e `deletePropertyTypeCoverImage()` para a nova API de capa.
  - `src/types/property.ts` agora modela `cardColor` e `coverImageUrl` em `PropertyTypeResponse`.
  - `CategoriesManagement.vue` voltou a tratar apenas categorias; o menu lateral ganhou item próprio “Tipos de Imóveis” e depois foi promovido para a navegação principal.
- **Tipos de imóveis gerenciáveis pelo tenant (#40)**:
  - `propertyService` expõe `listPropertyTypes(activeOnly?)` e `updatePropertyType(code, payload)` para `/property-types`.
  - `src/types/property.ts` centraliza `PropertyTypeResponse`, fallbacks e `propertyTypeLabel`.
  - `CategoriesManagement.vue` ganhou seção "Tipos de imóveis" para editar rótulo, posição e ativo.
  - `PropertyForm.vue`, `PropertiesList.vue` e `PropertyDetail.vue` usam labels/tipos do tenant com fallback local.
- **Regras granulares para corretores (#38)**:
  - `src/types/role.ts` inclui permissões explícitas de tarefas `tasks:read_all`, `tasks:write_all`, `tasks:read_own` e `tasks:write_own`.
  - A matriz de funções exibe essas permissões para montar papéis de corretores com escopo próprio ou amplo.
- **Vídeos em imóveis (#47)**:
  - `types/property.ts` agora inclui `PropertyVideoSource`, `PropertyVideoResponse` e `CreateYoutubeVideoRequest`.
  - `propertyService` ganhou `uploadVideo(propertyId, file, title?)`, `addYoutubeVideo(propertyId, data)` e `deleteVideo(propertyId, videoId)`.
  - `PropertyForm.vue` permite anexar vídeos de até 25MB e cadastrar URLs do YouTube antes de salvar o imóvel; em edição, mostra vídeos existentes e remove pelo endpoint novo.
  - `PropertyDetail.vue` permite upload, cadastro de YouTube, preview/player e remoção de vídeos já cadastrados.
- Cadastro de imóvel: seção Endereço ganhou máscara/consulta ViaCEP para `addressZip`, estados de busca/erro e campos manuais `lat`/`lng` para controlar o ponto exato no mapa público.
- DDI padronizado no app:
  - Novo composable `src/composables/useCountryDDI.ts` com países e DDI (default Brasil +55).
  - Novo componente reutilizável `src/components/ui/PhoneInput.vue` (seletor de país + campo numérico).
  - Campos de telefone migrados para `PhoneInput` em:
    - `LeadsManagement.vue` (novo lead),
    - `LeadDetail.vue` (edição de lead),
    - `TenantsAdmin.vue` (edição de usuário do tenant e contato do website do tenant),
    - `WebsiteConfig.vue` (contato do website),
    - `SendWhatsappActionPanel.vue` (recipientPhone e recipientValue).
  - Ajuste adicional: `WhatsappSettings.vue` (criação de instância) e campos `whatsappNumber` em `WebsiteConfig.vue` e `TenantsAdmin.vue` também usam `PhoneInput` com DDI.
- Leads UI (`LeadsManagement.vue` e `LeadDetail.vue`) agora exibe `source` dinâmico, incluindo origens detalhadas como `PORTAL_HOME_FORM` e `PORTAL_PROPERTY_FORM`, ao invés de colapsar tudo em apenas "Portal" ou "Manual".
- Realtime de leads via WebSocket: `websocket` store ganhou `subscribeToTenantLeads()`. `LeadsManagement.vue` e `LeadDetail.vue` agora assinam `/topic/{tenantId}.leads` para refletir criação, atualização de status e deleção sem refresh.
- `TenantsAdmin.vue` ganhou seção **Plano e limites** para suporte visualizar e editar billing por tenant (plano, limites numéricos e flags de recursos).
- **Domínio customizado Cloudflare**: `pages/account/website-domain.vue` agora exibe `customDomainStatus` e `customDomainTarget`, e `services/websiteConfig.ts` passou a consumir o payload expandido do backend para o fluxo de custom hostnames.
- **Domínio customizado UX cleanup**: `WebsiteConfig.vue` agora mostra resumo real do domínio/status/CNAME dentro da gestão do site; `website-domain.vue` alinha preview com o domínio normalizado, limpa `status/target` ao remover e troca o botão de “atualizar status” por recarga dos dados salvos.
- **Domínio customizado copy/UI**: `website-domain.vue` e o resumo em `WebsiteConfig.vue` agora usam linguagem voltada ao cliente, sem expor Cloudflare, CNAME ou jargão de infraestrutura, e com paleta visual mais neutra.
- `tenantsAdminService` ganhou:
  - `getTenantBilling(tenantId)` → `GET /support/tenants/{id}/billing`
  - `updateTenantBilling(tenantId, payload)` → `PUT /support/tenants/{id}/billing`
- `src/types/tenantsAdmin.ts` agora inclui os tipos `BillingPlanOption`, `TenantBilling` e `UpdateTenantBillingPayload`.
- Correção de integração: `updateTenantBilling` agora envia header `Content-Type: application/json` para evitar `HttpMediaTypeNotSupportedException` no backend (`text/plain`).
- UX de billing no suporte: ao trocar `planCode` em `TenantsAdmin.vue`, o formulário auto-preenche limites e flags com os valores padrão do plano selecionado (converte `null` para `-1` = ilimitado), mantendo possibilidade de edição manual antes de salvar.
- Portal de billing para tenant:
  - Nova tela `src/views/BillingPlan.vue` em rota `/meu-plano`.
  - Novo item de menu client-only “Meu Plano” no `AppLayout.vue`.
  - Novo serviço `src/services/billing.ts` com:
    - `getMyBilling()` → `GET /billing/me`
    - `startCheckout(payload)` → `POST /billing/checkout`
  - Novos tipos em `src/types/billing.ts`.
- Reorganização do menu lateral em `AppLayout.vue`:
  - Itens “WhatsApp”, “Meu Plano” e “Equipe” agora ficam no grupo **Configurações**.
  - Menu principal continua exibindo os demais itens no grupo **Principal**.
  - Filtro de visibilidade (`internalOnly/clientOnly`) foi centralizado em `visibleNavItems` e reaproveitado para separar `mainNavItems` e `settingsNavItems`.
- **Bolsão de Leads — frontend completo** (`LeadPoolsManager.vue`, `types/lead.ts`):
  - `LeadPoolResponse`, `CreateLeadPoolRequest`, `UpdateLeadPoolRequest` agora incluem `brokerSelectionMode`, `brokerIds`, `triggerAfterInactiveDays`.
  - Formulário ganhou campo **"Executar após X dias sem interações"** (`triggerAfterInactiveDays`).
  - Dropdown de distribuição agora inclui **"Aberto para Todos"** (`OPEN_TO_ALL`) além de Round Robin.
  - Seleção de corretores: select `ALL_BROKERS` / `SPECIFIC_BROKERS`; quando específico, carrega lista via `userManagementService.list()` e exibe checkboxes.
  - Critérios com **modo duplo**: toggle Básico (campos individuais: source, city, propertyType, minPrice, maxPrice, keywordContains — serializa para JSON automaticamente) / Avançado (textarea JSON raw). Ao editar, tenta parse do JSON para popular modo básico.
  - Hardening #49: `LeadPoolsManager.vue` agora diferencia carregamento, lista vazia e erro; falha ao carregar corretores mostra retry inline; JSON inválido em critérios avançados fica em erro inline sem quebrar o modal.
