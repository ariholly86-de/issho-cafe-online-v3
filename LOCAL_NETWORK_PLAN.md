# ISSHO CAFE — Local Network Migration Plan

Baseline protected before local-network work:
- Source branch: `main`
- Baseline commit: `5ea3d58a4a25bc1a209c0ae1568fc9d17b3801e0`
- Backup branch: `backup-before-local-network-2026-08-26`

## Current architecture inventory

### Frontend / operational pages
- `customer.html` — customer menu/order flow
- `qr-meja.html` — table QR flow (if present in the repository/deployment)
- `staff-alarm.html` / cashier variants — cashier/order alarm flow (deployment naming must be verified)
- `dapur-v6.html`, `dapur-v7.html`, `dapur-v8.html` — kitchen variants
- `owner-rpp02n.html` — owner reporting (deployment naming must be verified)
- `hub.html`, `index.html` — navigation/entry points
- `loud-alarm.js` — alarm behavior

### Backend/data currently observed
Supabase project ref: `xvhimyflrqrdudijwjdn`.
Observed tables include:
- categories
- products
- tables
- orders
- order_items
- payments
- expenses
- settings
- staff_pins
- staff_profiles
- devices
- device_commands
- telemetry

Observed RPC/functions include customer order creation, staff order/payment/status operations, expense/report operations, product/category administration, and payment-proof submission.

### Realtime / storage / external services to audit before migration
- Supabase REST API
- Supabase Realtime subscriptions
- Supabase Storage (`payment-proofs` observed in customer flow)
- QRIS/payment payload and payment-proof flow
- external CDN assets (for example QRCode.js)
- Vercel production deployment
- Android Printer Bridge / RPP02N integration

## Non-destructive migration rule

Do not modify `main`, production Vercel configuration, or production Supabase schema/data while preparing local mode.

All local-network changes must be developed in a separate branch and tested independently. Production changes require an explicit later approval.

## Target local architecture

Windows local server + cafe LAN/Wi-Fi:
- local web server
- local API/backend where required
- local PostgreSQL/Supabase-compatible data layer if full offline operation is selected
- local realtime channel
- local storage for payment proofs where required
- printer bridge retained separately

Target access pattern:
`http://<LOCAL-SERVER-IP>/...`

## Migration acceptance tests

1. Customer QR opens the local customer page.
2. Customer can load categories/products/tables.
3. Customer can create an order.
4. Cashier receives the order.
5. Kitchen receives the order in realtime.
6. Kitchen status updates propagate to cashier/customer as applicable.
7. Alarm behavior remains functional.
8. Payment-proof flow remains functional or has an explicitly defined local replacement.
9. Owner reports continue to calculate correctly.
10. RPP02N printer bridge remains functional.
11. System continues to operate with WAN/Internet disconnected.
12. Production Vercel/Supabase behavior remains unchanged.

## Important limitation

The current public repository/API inspection is not sufficient to safely copy the entire production Supabase database contents, Storage objects, secrets, Vercel environment variables, or private deployment configuration. These must be exported/backed up through their respective authenticated management interfaces before a full offline clone is attempted.
