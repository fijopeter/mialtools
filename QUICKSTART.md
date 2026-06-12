# Quick Start Guide

## 🚀 Getting Started in 3 Minutes

### Step 1: Install Dependencies
Open terminal in the `new` folder and run:
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The app will automatically open at `http://localhost:5173`

### Step 3: Start Exploring!
- Click on a category to browse meters
- Use the search bar to find specific meters
- Hover over meter cards to see zoom effect
- Click a meter to view full details

---

## 📝 What You Get

### ✅ Modern UI
- Animated header with search
- Scroll-based option selection
- Zoom effects on hover
- Smooth transitions throughout

### ✅ Responsive Design
- Works on desktop, tablet, and mobile
- Touch-friendly on mobile devices
- Adaptive layouts for all screen sizes

### ✅ Well-Organized Code
- Clean folder structure
- Component-based architecture
- Global CSS variables
- Reusable animations

---

## 🎯 Key Features to Try

### 1. Search Animation
- Click on the search bar in the header
- Notice the animated border and shadow
- Type to see live filtering

### 2. Scroll with Zoom
- Click on a category
- Scroll left/right with arrow buttons
- Hover over cards to see them zoom
- Notice the progress bar at the bottom

### 3. Smooth Transitions
- Watch how the modal slides up
- See the fade-in animations
- Notice the scale effects

### 4. Responsive Layout
- Resize your browser window
- See categories grid adapt
- Watch buttons and text resize
- Try on mobile device

---

## 📁 Main Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main application logic |
| `src/components/Header.jsx` | Header with search |
| `src/components/ScrollableOptions.jsx` | Scroll-based meter selector |
| `src/components/MeterDetail.jsx` | Detail modal |
| `src/config/meterCatalog.js` | Meter data |
| `src/styles/global.css` | Global styles & animations |

---

## 🛠️ Common Customizations

### Change Logo Text
Edit `src/components/Header.jsx`:
```jsx
<span className="logo-text">YOUR-TEXT</span>
```

### Add More Meters
Edit `src/config/meterCatalog.js`:
```javascript
{
  id: 'new-meter-id',
  label: 'New Meter Name',
  code: 'NM-100',
  // ... other fields
}
```

### Change Colors
Edit `src/styles/global.css`:
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

### Adjust Animation Speed
Edit in `src/styles/global.css`:
```css
--transition-normal: 300ms ease-in-out; /* Change this */
```

---

## 🐛 Troubleshooting

### Port 5173 Already in Use?
Change in `vite.config.js`:
```javascript
server: {
  port: 5174, // Change this
}
```

### Search Not Working?
Check:
1. Search query matches meter data
2. Browser console for errors
3. Make sure meter catalog is loaded

### Styles Not Loading?
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (npm run dev)
- Check for CSS syntax errors

### Animations Choppy?
- Use modern browser (Chrome, Firefox, Edge, Safari)
- Check GPU acceleration is enabled
- Reduce other browser tabs/processes

---

## 📚 Documentation Files

- **README.md** - Project overview and features
- **STRUCTURE.md** - Detailed folder structure
- **FEATURES.md** - In-depth feature documentation
- **QUICKSTART.md** - This file!

---

## 🎨 Visual Guide

### Homepage
```
┌─────────────────────────────────────┐
│  🎨 Header with Animated Search     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Category Selection Grid (4 Cards)  │
│  🔗 ⚡ 📍 📏                       │
└─────────────────────────────────────┘
```

### After Selecting Category
```
┌─────────────────────────────────────┐
│  Header with Search                 │
└─────────────────────────────────────┘

┌─ Scrollable Meters ─────────────────┐
│  ← [Card] [Card] [Card] →           │
│  Progress: ████░░░░░░░░░░░░░        │
│  Current: 1 / 10                    │
└─────────────────────────────────────┘
```

### Meter Detail Modal
```
┌─────────────────────────────────────┐
│ ┌────────────────────────────────┐  │
│ │  📊 Meter Name              ✕  │  │
│ │  CODE                           │  │
│ ├────────────────────────────────┤  │
│ │  Information • Specifications   │  │
│ ├────────────────────────────────┤  │
│ │  [Generate Certificate] [Close] │  │
│ └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🚢 Building for Production

```bash
npm run build
```

This creates optimized files in the `dist/` folder ready for deployment.

---

## 📞 Next Steps

1. ✅ Install and run the project
2. ✅ Explore the UI and animations
3. ✅ Customize colors and text
4. ✅ Add your own meter data
5. ✅ Connect to your backend API
6. ✅ Deploy to production

---

## 💡 Tips

- Use the browser DevTools to inspect animations
- Try modifying CSS variables for quick customizations
- Check the Components tab to understand React structure
- Test on real mobile devices for better experience
- Use Chrome DevTools mobile emulation

---

For more details, see:
- **README.md** - Full project overview
- **STRUCTURE.md** - Complete folder structure
- **FEATURES.md** - Detailed feature documentation

Enjoy your modern MIAL interface! 🎉
