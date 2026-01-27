# Frontend Monorepo

A Turborepo monorepo with Next.js and shadcn/ui components.

## Structure

```
.
├── apps
│   └── devapp          # Next.js application
├── packages
│   ├── ui              # Shared UI components (shadcn/ui)
│   └── typescript-config # Shared TypeScript configurations
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- Node.js >= 18

### Installation

```bash
bun install
```

### Development

Run all apps in development mode (using Turborepo):

```bash
bun dev
```

Or run specific app directly:

```bash
cd apps/devapp
bun dev
```

The devapp will be available at [http://localhost:3000](http://localhost:3000)

### Build

Build all apps:

```bash
bun build
```

## Packages

### @repo/ui

Shared UI component library built with:
- shadcn/ui (all components installed)
- Tailwind CSS
- Radix UI primitives
- TypeScript

Import components:

```tsx
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
```

### @repo/typescript-config

Shared TypeScript configurations:
- `base.json` - Base configuration
- `nextjs.json` - Next.js specific configuration
- `react-library.json` - React library configuration

## Available shadcn/ui Components

All shadcn/ui components are installed and available:
- Accordion, Alert, Alert Dialog
- Avatar, Badge, Breadcrumb
- Button, Button Group, Calendar
- Card, Carousel, Chart
- Checkbox, Collapsible, Command
- Context Menu, Dialog, Drawer
- Dropdown Menu, Form, Field
- Hover Card, Input, Input OTP, Input Group
- Item, KBD, Label
- Menubar, Navigation Menu
- Pagination, Popover, Progress
- Radio Group, Resizable, Scroll Area
- Select, Separator, Sheet
- Sidebar, Skeleton, Slider
- Sonner, Spinner, Switch
- Table, Tabs, Textarea
- Toggle, Toggle Group, Tooltip

## Technology Stack

- [Turborepo](https://turbo.build/repo) - Build system
- [Next.js](https://nextjs.org/) (v16+) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) (v4) - Styling with @theme-based configuration
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Bun](https://bun.sh) - Package manager & runtime

### Tailwind CSS v4 Migration

This project uses Tailwind CSS v4 with the new CSS-first configuration approach:
- Configuration is done via `@theme` blocks in CSS files
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Custom design tokens are defined using `--color-*`, `--radius-*`, and `--animate-*` CSS variables
- Dark mode support via `@variant dark` with custom variants
