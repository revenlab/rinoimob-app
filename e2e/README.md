# Production E2E Smoke Tests

These tests are intended for the final production gate before deploy. They run
against real URLs and credentials provided through environment variables.

## Required

```bash
export E2E_API_URL="https://api.example.com"
export E2E_TENANT_SLUG="demo"
export E2E_USER_EMAIL="owner@example.com"
export E2E_USER_PASSWORD="..."
```

## Optional

```bash
export E2E_APP_URL="https://app.example.com"
export E2E_WEBSITE_URL="https://demo.example.com"
export E2E_TENANT_ID="..."
export E2E_EXPECT_USERS_READ=true
export E2E_EXPECT_INTERNAL_STAFF=false
export E2E_ALLOW_MUTATIONS=false
export E2E_FOREIGN_PROPERTY_ID="..."
```

Run:

```bash
npm run test:e2e:prod
```

`E2E_ALLOW_MUTATIONS=true` enables public lead creation tests. Keep it disabled
unless the target tenant is a staging tenant or the production smoke lead is
expected operationally.
