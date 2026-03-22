# ⬡ PRISM Dashboard

> The centralized admin control panel for the **PRISM** multi-vendor ecosystem.

![PRISM Tech Stack](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Integrated-38B2AC?style=flat&logo=tailwind-css)
![i18n](https://img.shields.io/badge/i18n-Supported-brightgreen)

PRISM Dashboard is a robust, scalable Next.js application designed to manage and monitor the entire PRISM platform. It provides specialized control interfaces for managing vendors, users, and transactions across various service modules including standard e-commerce, restaurants, pharmacies, groceries, taxi services, and property bookings.

## ✨ Core Features

* **Multi-Module Management:** Centralized control for distinct PRISM verticals (E-commerce, Food Delivery, Pharmacy, Groceries, Ride-hailing, and Property Bookings).
* **Internationalization (i18n):** Full multi-language support localized through the `app/[locale]` routing structure and dedicated message dictionaries.
* **Modern UI Architecture:** Built with reusable, accessible components (`components/ui`) utilizing Radix UI / shadcn concepts.
* **Type-Safe Ecosystem:** End-to-end TypeScript implementation ensuring reliable data handling for complex vendor architectures.
* **Responsive Layout:** Tailwind-powered design that works seamlessly across desktop and tablet for admin-on-the-go.

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** Customized reusable components (configured via `components.json`)
* **Internationalization:** Integrated i18n tooling

## 📂 Project Structure

```text
PRISM-Dashboard/
├── app/
│   └── [locale]/       # Internationalized App Router pages and layouts
├── components/
│   └── ui/             # Reusable UI components (buttons, tables, modals)
├── i18n/               # Internationalization configuration and routing setups
├── interfaces/         # Global TypeScript definitions and data models
├── lib/                # Utility functions and shared helpers
├── messages/           # Translation dictionaries (JSON) for localized text
├── public/             # Static assets (images, icons, fonts)
└── services/           # API handlers and external integrations
🚀 Getting Started
Prerequisites
Ensure you have Node.js (v18+) and your preferred package manager (npm, yarn, pnpm, or bun) installed.

Installation
Clone the repository:

Bash
git clone [https://github.com/Mostafa-Devfolio/PRISM-Dashboard.git](https://github.com/Mostafa-Devfolio/PRISM-Dashboard.git)
cd PRISM-Dashboard
Install dependencies:

Bash
npm install
# or yarn install / pnpm install / bun install
Set up Environment Variables:
Create a .env.local file in the root directory and add your development variables (e.g., API URLs, authentication secrets).

Running the Development Server
Start the local server:

Bash
npm run dev
# or yarn dev / pnpm dev / bun dev
Open http://localhost:3000 with your browser to see the result. The page will auto-update as you modify files within the app directory.

🌐 Building for Production
To create an optimized production build:

Bash
npm run build
npm run start
🤝 Contributing
Contributions to the PRISM Dashboard are subject to the internal development lifecycle. Ensure that any new UI elements are added via the components/ui directory and proper TypeScript interfaces are strictly defined in the interfaces/ folder before making API calls.

📄 License
Copyright © 2026 Mostafa. All rights reserved.