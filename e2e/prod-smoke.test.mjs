import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'

const REQUIRED_ENV = [
  'E2E_API_URL',
  'E2E_TENANT_SLUG',
  'E2E_USER_EMAIL',
  'E2E_USER_PASSWORD',
]

const missing = REQUIRED_ENV.filter(name => !process.env[name])
if (missing.length > 0) {
  throw new Error(`Missing required E2E env vars: ${missing.join(', ')}`)
}

const config = {
  target: process.env.E2E_TARGET ?? 'local',
  apiBase: normalizeApiBase(process.env.E2E_API_URL),
  appUrl: normalizeOptionalUrl(process.env.E2E_APP_URL),
  websiteUrl: normalizeOptionalUrl(process.env.E2E_WEBSITE_URL),
  tenantSlug: process.env.E2E_TENANT_SLUG,
  tenantId: process.env.E2E_TENANT_ID,
  email: process.env.E2E_USER_EMAIL,
  password: process.env.E2E_USER_PASSWORD,
  expectInternalStaff: parseBoolean(process.env.E2E_EXPECT_INTERNAL_STAFF, false),
  expectUsersRead: parseBoolean(process.env.E2E_EXPECT_USERS_READ, false),
  allowMutations: parseBoolean(process.env.E2E_ALLOW_MUTATIONS, false),
  foreignPropertyId: process.env.E2E_FOREIGN_PROPERTY_ID,
}

let authState

test('public tenant endpoints are reachable', { timeout: 30_000 }, async () => {
  await expectOk(apiGet('/public/config', { tenant: true }), 'public config')
  await expectOk(apiGet('/public/property-types', { tenant: true }), 'public property types')
  await expectOk(apiGet('/public/properties?page=0&size=1', { tenant: true }), 'public properties')
  await expectOk(apiGet('/public/blog-posts?page=0&size=1', { tenant: true }), 'public blog posts')
})

test('app shell is reachable when E2E_APP_URL is set', { timeout: 20_000, skip: !config.appUrl }, async () => {
  const response = await fetch(config.appUrl)
  assert.equal(response.status, 200)
  assert.match(await response.text(), /<div id="app"><\/div>|<script/i)
})

test('public website is reachable when E2E_WEBSITE_URL is set', { timeout: 20_000, skip: !config.websiteUrl }, async () => {
  const response = await fetch(config.websiteUrl)
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type') ?? '', /text\/html/)
})

test('workspace login, me and logout work end to end', { timeout: 40_000 }, async () => {
  authState = await login()

  const me = await apiGet('/auth/me', { token: authState.accessToken })
  assert.equal(me.response.status, 200)
  assert.equal(me.body.email.toLowerCase(), config.email.toLowerCase())
  assert.ok(me.body.tenantId)

  const logout = await apiPost('/auth/logout', undefined, { token: authState.accessToken })
  assert.equal(logout.response.status, 200)

  const revoked = await apiGet('/auth/me', { token: authState.accessToken })
  assert.ok([401, 403].includes(revoked.response.status), `expected revoked token to fail, got ${revoked.response.status}`)

  authState = await login()
})

test('tenant user listing is permission-gated', { timeout: 20_000 }, async () => {
  const state = await getAuthState()
  const result = await apiGet('/users', { token: state.accessToken })

  if (config.expectUsersRead) {
    assert.equal(result.response.status, 200)
    assert.ok(Array.isArray(result.body))
  } else {
    assert.equal(result.response.status, 403)
  }
})

test('support dashboard access matches internal staff expectation', { timeout: 20_000 }, async () => {
  const state = await getAuthState()
  const me = await apiGet('/auth/me', { token: state.accessToken })
  assert.equal(me.response.status, 200)

  if (config.expectInternalStaff) {
    assert.ok(['SUPPORT_MANAGER', 'SUPPORT_AGENT'].includes(me.body.systemRole), `unexpected support role ${me.body.systemRole}`)
    assert.ok((me.body.supportPermissions ?? []).length > 0)
  } else {
    assert.notEqual(me.body.systemRole, 'SUPPORT_MANAGER')
    assert.notEqual(me.body.systemRole, 'SUPPORT_AGENT')
    assert.deepEqual(me.body.supportPermissions ?? [], [])
  }

  const dashboard = await apiGet('/support/dashboard', { token: state.accessToken })
  if (config.expectInternalStaff) {
    assert.ok([200, 403].includes(dashboard.response.status), `unexpected support dashboard status ${dashboard.response.status}`)
  } else {
    assert.equal(dashboard.response.status, 403)
  }
})

test('public lead creation smoke works when mutations are enabled', { timeout: 30_000, skip: !config.allowMutations }, async () => {
  const marker = randomUUID()
  const result = await apiPost('/public/leads', {
    name: `E2E Smoke ${marker}`,
    email: `e2e+${marker}@rinoimob.test`,
    phone: '+5511999999999',
    message: `E2E smoke test ${marker}`,
    source: `E2E_PROD_SMOKE_${config.target.toUpperCase()}`,
  }, { tenant: true })

  assert.ok([200, 201, 204].includes(result.response.status), `unexpected public lead status ${result.response.status}`)
})

test('foreign property ids are rejected when fixture is provided', { timeout: 30_000, skip: !config.allowMutations || !config.foreignPropertyId }, async () => {
  const marker = randomUUID()
  const result = await apiPost('/public/leads', {
    name: `E2E Foreign Property ${marker}`,
    email: `e2e-foreign+${marker}@rinoimob.test`,
    phone: '+5511888888888',
    message: `E2E foreign property isolation ${marker}`,
    propertyId: config.foreignPropertyId,
    source: `E2E_PROD_SMOKE_${config.target.toUpperCase()}`,
  }, { tenant: true })

  assert.ok([403, 404].includes(result.response.status), `expected cross-tenant property rejection, got ${result.response.status}`)
})

async function getAuthState() {
  if (!authState) {
    authState = await login()
  }
  return authState
}

async function login() {
  const identify = await apiPost('/auth/identify', {
    email: config.email,
    password: config.password,
  })
  assert.equal(identify.response.status, 200, `identify failed: ${identify.response.status} ${JSON.stringify(identify.body)}`)
  assert.ok(identify.body.preAuthToken)
  assert.ok(Array.isArray(identify.body.tenants))

  const tenant = selectTenant(identify.body.tenants)
  const selected = await apiPost('/auth/select-tenant', {
    preAuthToken: identify.body.preAuthToken,
    tenantId: tenant.id,
  })
  assert.equal(selected.response.status, 200, `select-tenant failed: ${selected.response.status} ${JSON.stringify(selected.body)}`)
  assert.ok(selected.body.accessToken)

  return {
    tenant,
    accessToken: selected.body.accessToken,
    refreshToken: selected.body.refreshToken,
  }
}

function selectTenant(tenants) {
  const byId = config.tenantId ? tenants.find(tenant => tenant.id === config.tenantId) : null
  const bySlug = tenants.find(tenant => tenant.subdomain === config.tenantSlug)
  const tenant = byId ?? bySlug
  assert.ok(tenant, `authenticated user does not belong to tenant ${config.tenantId ?? config.tenantSlug}`)
  return tenant
}

async function apiGet(path, options = {}) {
  return apiRequest('GET', path, undefined, options)
}

async function apiPost(path, body, options = {}) {
  return apiRequest('POST', path, body, options)
}

async function apiRequest(method, path, body, options = {}) {
  const headers = {
    Accept: 'application/json',
  }
  if (options.tenant) {
    headers['X-Tenant-Slug'] = config.tenantSlug
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${config.apiBase}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  return {
    response,
    body: await readBody(response),
  }
}

async function expectOk(promise, label) {
  const result = await promise
  assert.equal(result.response.status, 200, `${label} returned ${result.response.status}: ${JSON.stringify(result.body)}`)
  return result
}

async function readBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function normalizeApiBase(value) {
  const trimmed = value.replace(/\/+$/, '')
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`
}

function normalizeOptionalUrl(value) {
  return value ? value.replace(/\/+$/, '') : undefined
}

function parseBoolean(value, defaultValue) {
  if (value === undefined || value === '') return defaultValue
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}
