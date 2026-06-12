# Project Structure Guide

## Overview

This is a modern, well-organized React + Vite project for the MIAL (Modern Instrument Analysis Laboratory) meter selection and certificate generation system.

## Directory Structure

```
new/
│
├── 📁 public/
│   └── Static assets and manifest
│
├── 📁 src/
│   ├── 📁 components/
│   │   ├── Header.jsx (Animated header with search)
│   │   ├── Header.css
│   │   ├── ScrollableOptions.jsx (Scroll-based meter selector)
│   │   ├── ScrollableOptions.css
│   │   ├── MeterDetail.jsx (Detail modal)
│   │   └── MeterDetail.css
│   │
│   ├── 📁 pages/
│   │   └── (Page components for future use)
│   │
│   ├── 📁 config/
│   │   └── meterCatalog.js (Mock meter data & categories)
│   │
│   ├── 📁 styles/
│   │   └── global.css (Global CSS variables and animations)
│   │
│   ├── 📁 utils/
│   │   └── (Utility functions for future use)
│   │
│   ├── 📁 images/
│   │   └── (Image assets for future use)
│   │
│   ├── App.jsx (Main application component)
│   ├── App.css (App styles)
│   └── main.jsx (React entry point)
│
├── index.html (HTML template)
├── package.json (Dependencies and scripts)
├── vite.config.js (Vite configuration)
├── .gitignore (Git ignore rules)
├── README.md (Project overview)
├── STRUCTURE.md (This file)
└── FEATURES.md (Detailed feature documentation)
```

## Component Details

### Header Component (`src/components/Header.jsx`)
**Purpose**: Main header with animated search functionality

**Features**:
- Sticky positioning with scroll detection
- Animated search bar with focus effects
- Clear button for search
- Status badge
- Logo with gradient effect
- Responsive layout

**Props**:
- `onSearchChange`: Callback when search input changes
- `onSearchSelect`: Callback when search result is selected

**State**:
- `searchQuery`: Current search text
- `isSearchFocused`: Search input focus state
- `isScrolled`: Page scroll state

---

### ScrollableOptions Component (`src/components/ScrollableOptions.jsx`)
**Purpose**: Horizontal scrollable meter selection with zoom effects

**Features**:
- Smooth horizontal scrolling with button controls
- Zoom effect on hover (108% scale + lift)
- Current item counter
- Progress bar
- Responsive layout
- Touch-friendly

**Props**:
- `items`: Array of meter objects to display
- `onSelect`: Callback when meter is selected
- `title`: Section title to display

**Item Structure**:
```javascript
{
  id: 'unique-id',
  label: 'Display Name',
  code: 'SHORT-CODE',
  category: 'Category Name',
  icon: '📊',
  description: 'Description text',
  specs: { key: 'value' }
}
```

---

### MeterDetail Component (`src/components/MeterDetail.jsx`)
**Purpose**: Modal dialog showing detailed meter information

**Features**:
- Full-screen modal overlay with blur
- Meter information display
- Specifications grid
- Action buttons
- Close button
- Responsive modal sizing

**Props**:
- `meter`: Meter object to display
- `onAction`: Callback for action button (e.g., generate certificate)
- `onClose`: Callback to close modal

---

### App Component (`src/App.jsx`)
**Purpose**: Main application logic and state management

**Features**:
- Category selection with visual grid
- Meter filtering by category or search
- Detail modal display
- Search functionality
- Empty states

**State**:
- `selectedCategory`: Currently selected category ID
- `selectedMeter`: Currently selected meter object
- `searchQuery`: Current search text

**Key Functions**:
- `handleCategorySelect()`: Select a category
- `handleMeterSelect()`: Select a meter to view details
- `handleSearchChange()`: Update search query
- `handleMeterAction()`: Handle meter action (generate certificate)
- `handleCloseMeterDetail()`: Close detail modal

---

## Configuration Files

### meterCatalog.js (`src/config/meterCatalog.js`)
Contains mock meter data and utility functions

**Exports**:
- `meterCatalog`: Array of all available meters
- `categories`: Array of meter categories
- `getMetersByCategory()`: Function to filter meters by category

---

## Styling System

### Global Styles (`src/styles/global.css`)
Defines CSS variables and global animations

**CSS Variables**:
```css
--primary-color: #0066cc
--primary-dark: #0052a3
--secondary-color: #ff6b35
--text-primary: #2c3e50
--text-secondary: #546e7a
--bg-light: #f8fafb
--bg-white: #ffffff
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08)
--transition-fast: 200ms ease-in-out
--transition-normal: 300ms ease-in-out
```

**Global Animations**:
- `fadeIn`: Fade in with slight upward movement
- `slideInFromLeft`: Slide in from left
- `slideInFromRight`: Slide in from right
- `scaleUp`: Scale up from smaller size
- `pulse`: Continuous pulse effect

---

## File Organization Best Practices

### Components
Each component has:
- JSX file with component logic
- Corresponding CSS file for styling
- Clear prop documentation
- Proper state management

### Configuration
- Centralized meter data in `meterCatalog.js`
- Easy to replace with API calls
- Utility functions for data transformation

### Styles
- Global variables for consistency
- Component-specific CSS files
- Responsive breakpoints: 768px, 480px
- GPU-accelerated animations

### Future Additions

#### Pages
When adding new pages:
```
src/pages/
├── CertificateGenerator.jsx
├── TagGenerator.jsx
├── MeterComparison.jsx
└── Settings.jsx
```

#### Utils
When adding utility functions:
```
src/utils/
├── api.js (API calls)
├── formatters.js (Data formatting)
├── validators.js (Form validation)
└── helpers.js (General utilities)
```

#### Images
Organize by purpose:
```
src/images/
├── icons/
├── logos/
├── meters/
└── backgrounds/
```

---

## Development Workflow

### Adding a New Component

1. Create component JSX file in `src/components/`
2. Create corresponding CSS file in `src/components/`
3. Export component from JSX file
4. Import and use in parent component
5. Add proper prop types and documentation

### Adding New Meter Data

1. Update `src/config/meterCatalog.js`
2. Add meter object to `meterCatalog` array
3. Update category mapping if needed
4. Test in ScrollableOptions component

### Adding New Pages

1. Create page component in `src/pages/`
2. Set up routing (will need React Router)
3. Link from main App or Header
4. Create layout components as needed

---

## Performance Considerations

### CSS Optimizations
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid layout thrashing with CSS classes
- Minimize repaints with proper z-index management

### React Optimizations
- Use `useMemo` for expensive calculations (filtering, sorting)
- Use `useCallback` for event handlers
- Proper key usage in lists
- Consider code splitting for large features

### Image Optimization
- Use appropriate image formats
- Implement lazy loading
- Use responsive images with srcset

---

## Customization Guide

### Changing Colors
Edit CSS variables in `src/styles/global.css`:
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  /* ... other colors */
}
```

### Adjusting Animations
Edit animation speed variables:
```css
:root {
  --transition-fast: 200ms ease-in-out;    /* Edit this */
  --transition-normal: 300ms ease-in-out;  /* Or this */
  --transition-slow: 500ms ease-in-out;
}
```

### Modifying Breakpoints
Search for `@media (max-width:` in component CSS files and adjust values.

---

## Maintenance Tips

1. Keep components focused on single responsibility
2. Centralize shared state in App component
3. Use CSS variables for consistent styling
4. Document prop interfaces
5. Test responsive design regularly
6. Keep utility functions pure and testable

---

## Common Tasks

### Add a new meter
1. Add object to `meterCatalog` in `src/config/meterCatalog.js`
2. Update category mapping if needed
3. Refresh page

### Change header styling
Edit `src/components/Header.css`

### Modify scroll behavior
Edit `src/components/ScrollableOptions.jsx` scroll methods

### Update colors globally
Edit CSS variables in `src/styles/global.css`

---

For more information, see:
- [README.md](README.md) - Project overview
- [FEATURES.md](FEATURES.md) - Detailed feature documentation
