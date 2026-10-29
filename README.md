# ShopLedger SaaS (React + Vite PWA)

ShopLedger is a multi-tenant Point of Sale (POS), Inventory & Bookkeeping SaaS WebApp tailored for Nigerian small and medium retail businesses (electrical shops, supermarkets/provisions, pharmacies, fashion boutiques).

## Features
- **Strict Multi-Tenancy**: Completely separate tenant databases. Emeka Electronics, Mama Nkechi Provisions, and HealthPlus Pharmacy never see each other's products or stock.
- **Cashier POS & PIN Login**: Fast checkout with 4-digit PIN authentication. No passwords needed for clerks.
- **One-Tap WhatsApp Invites & Receipts**: Store owners can invite cashiers directly via WhatsApp with their Store Code and PIN, and issue instant receipts to customers.
- **Expense Tracking & Net Profit**: Gross profit (`price - cost`) minus shop expenses (generator fuel, rent, salaries) = real Net Profit.
- **PWA & Mobile-First**: Includes `manifest.json` and `sw.js` for full compatibility with **pwabuilder.com** and offline support.

## Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PWA**: Service Worker (`sw.js`) + Web App Manifest (`manifest.json`)
