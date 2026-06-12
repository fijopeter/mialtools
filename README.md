# MIAL - Modern Instrument Analysis Laboratory

A modern, beautifully designed web application for meter selection and certificate generation with scroll-based UI and smooth animations.

## ✨ Features

### 🎨 Modern UI Design
- **Animated Header** with live search functionality
- **Scroll-Based Options** with zoom/paging effects
- **Category Selection** with smooth transitions
- **Detail Modal** for meter information
- **Gradient Backgrounds** and smooth animations throughout

### 🔍 Advanced Search
- Real-time search across meter labels, codes, and categories
- Animated search bar in header with focus effects
- Auto-clear functionality
- Live result filtering

### 📊 Scrollable Meter Selection
- Horizontal scroll with smooth animations
- Zoom effect on hover (108% scale with lift effect)
- Counter showing current item / total items
- Progress bar at the bottom
- Navigation arrows (disabled when not needed)
- Responsive design for all screen sizes

### 🎯 Interactive Features
- Category browsing with visual cards
- Detail view modal with meter specifications
- Action buttons for certificate generation
- Keyboard-friendly navigation
- Fully responsive on mobile/tablet/desktop

## 📁 Project Structure

```
new/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Header.jsx     # Header with animated search
│   │   ├── Header.css
│   │   ├── ScrollableOptions.jsx  # Scroll-based meter selector
│   │   ├── ScrollableOptions.css
│   │   ├── MeterDetail.jsx         # Detail modal
│   │   └── MeterDetail.css
│   ├── pages/             # Page components (future)
│   ├── config/            # Configuration files
│   │   └── meterCatalog.js  # Mock meter data
│   ├── styles/            # Global styles
│   │   └── global.css     # Global CSS variables and animations
│   ├── utils/             # Utility functions (future)
│   ├── images/            # Image assets (future)
│   ├── App.jsx            # Main application component
│   ├── App.css            # App styles
│   └── main.jsx           # React entry point
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── README.md             # This file
```

## 🚀 Getting Started

### Installation

```bash
cd new
npm install
```

### Development

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 🎨 Design System

### Color Palette
- **Primary**: #0066cc (Blue)
- **Secondary**: #ff6b35 (Orange)
- **Success**: #00b894 (Green)
- **Error**: #d63031 (Red)
- **Text Primary**: #2c3e50 (Dark Gray)
- **Background**: Linear gradient from #f8fafb to #f0f4f8

### Animations
- **Fade In**: 300ms smooth opacity transition
- **Scale Up**: 300ms smooth scale animation
- **Slide In**: 300ms directional slide animations
- **Zoom Hover**: 400ms cubic-bezier for smooth zoom effect
- **Shimmer**: 2s infinite shimmer effect on cards

### Typography
- **Font Family**: System fonts (Apple System, Segoe UI, Roboto, etc.)
- **Body**: 14px
- **Headings**: 16px - 32px depending on hierarchy

## 🔧 Key Components

### Header
- Sticky positioning with scroll detection
- Animated search input with focus effects
- Status badge
- Logo with gradient effect
- Responsive layout

### ScrollableOptions
- Horizontal scroll container with smooth behavior
- Dynamic zoom effect on hover
- Current item counter
- Progress bar
- Navigation buttons with disabled states
- Touch-friendly scroll

### MeterDetail
- Modal overlay with blur effect
- Header section with icon and title
- Information grid
- Specifications list
- Action buttons
- Responsive modal sizing

### App
- Category selection grid
- Search functionality
- Meter filtering
- State management for selected items

## 💡 Usage

### Selecting a Meter

1. **Via Category**: Click on a category card to browse meters
2. **Via Search**: Use the header search to find meters by name, code, or category
3. **Scrolling**: Use arrow buttons or scroll horizontally to browse meters
4. **Detail View**: Click on a meter card to view full details

### Meter Data Structure

Each meter includes:
- `id`: Unique identifier
- `label`: Display name
- `code`: Short code/model number
- `category`: Meter category
- `type`: Meter type
- `icon`: Emoji icon
- `description`: Full description
- `specs`: Object with specifications

## 🎯 Future Enhancements

- [ ] Connect to real API for meter data
- [ ] Certificate generation form
- [ ] Tag generation interface
- [ ] User authentication
- [ ] Save/Export functionality
- [ ] Advanced filtering options
- [ ] Meter comparison tool
- [ ] Custom themes/dark mode
- [ ] Multi-language support

## 📱 Responsive Breakpoints

- **Desktop**: 1400px max-width
- **Tablet**: 768px and below
- **Mobile**: 480px and below

## ⚡ Performance

- Optimized CSS with GPU acceleration
- Smooth animations using transform and opacity
- Memoized calculations in React
- Efficient event handling
- Lazy loading ready

## 📄 License

Internal use only.

---

Built with ❤️ using React and Vite
