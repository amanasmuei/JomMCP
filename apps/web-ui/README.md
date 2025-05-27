# JomMCP Web UI

A modern, responsive web interface for the JomMCP Platform built with Next.js 14, featuring a Notion-inspired design system.

## 🎨 Design System

### Theme & Colors
- **Design Philosophy**: Clean, minimalist interface inspired by Notion
- **Color System**: CSS custom properties with light/dark mode support
- **Typography**: Inter font with optimized font features
- **Component Library**: Custom components built with Radix UI primitives

### Key Features
- ✨ Modern glassmorphism effects
- 🌙 Dark/Light mode support
- 📱 Fully responsive design
- ♿ Accessibility-first components
- 🎯 Consistent design tokens
- 🚀 Optimized performance

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS custom properties
- **Components**: Radix UI + Custom components
- **Icons**: Lucide React
- **State Management**: TanStack Query + Context
- **Type Safety**: TypeScript

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard pages
│   ├── globals.css        # Global styles & design tokens
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx    # Button component
│   │   ├── card.tsx      # Card component
│   │   ├── input.tsx     # Input component
│   │   ├── badge.tsx     # Badge component
│   │   ├── spinner.tsx   # Loading spinner
│   │   └── index.ts      # Component exports
│   └── navigation.tsx    # Main navigation
└── lib/
    └── utils.ts          # Utility functions
```

## 🎯 Component System

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="md">
  Click me
</Button>
```

Variants: `default` | `destructive` | `outline` | `secondary` | `ghost` | `link`
Sizes: `default` | `sm` | `lg` | `icon`

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Badge
```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="success">Active</Badge>
```

Variants: `default` | `secondary` | `destructive` | `outline` | `success` | `warning`

## 🎨 Design Tokens

### Colors
The design system uses CSS custom properties for consistent theming:

```css
:root {
  --background: 255 255 255;
  --foreground: 15 23 42;
  --primary: 59 130 246;
  --secondary: 244 244 245;
  --accent: 244 244 245;
  --muted: 244 244 245;
  --border: 228 228 231;
  --destructive: 239 68 68;
}
```

### Typography
- **Primary Font**: Inter (variable font)
- **Line Heights**: Optimized for readability
- **Font Weights**: 400, 500, 600, 700

### Spacing
- **Base Unit**: 4px
- **Scale**: 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

## 🌙 Dark Mode

Dark mode is implemented using CSS custom properties and next-themes:

```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
```

## 📱 Responsive Design

The UI is built mobile-first with these breakpoints:
- **sm**: 640px
- **md**: 768px  
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 8+

### Installation
```bash
cd apps/web-ui
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🎯 Key Pages

### Homepage (`/`)
- Modern hero section with gradient background
- Feature showcase with interactive cards
- Benefits section highlighting platform advantages
- Call-to-action sections

### Dashboard (`/dashboard`)
- Welcome header with user personalization
- System health status indicator
- Quick stats grid showing key metrics
- Quick action cards for common tasks
- Recent activity feeds for APIs and MCP servers

### Navigation
- Collapsible sidebar with active state indicators
- Responsive mobile menu
- Theme toggle
- User profile menu with logout

## 🔧 Customization

### Adding New Components
1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Follow existing patterns for props and styling

### Theming
Modify CSS custom properties in `src/app/globals.css`:

```css
:root {
  --primary: YOUR_COLOR_VALUES;
}
```

### Icons
The project uses Lucide React for icons:
```tsx
import { IconName } from 'lucide-react'
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Notion Design Inspiration](https://notion.so)

## 🤝 Contributing

1. Follow the existing component patterns
2. Ensure accessibility standards
3. Test in both light and dark modes
4. Maintain responsive design
5. Update documentation for new components
