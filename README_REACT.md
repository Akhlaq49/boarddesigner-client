# MM Technology interior - React Version

This is the React conversion of the MM Technology interior application.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Project Structure

- `src/App.jsx` - Main application component
- `src/components/` - React components
  - `Header.jsx` - Header component
  - `ButtonParts.jsx` - Button parts sidebar
  - `Frame.jsx` - Device frame with drop zones
  - `ColorPalette.jsx` - Color palette sidebar
  - `IconPopup.jsx` - Icon selection modal
  - `ButtonColorPopup.jsx` - Button color selection modal
  - `FeedbackMessage.jsx` - Feedback/toast messages
- `src/hooks/useDragDrop.js` - Custom hook for drag-and-drop logic
- `src/styles.css` - All styles (Material Design)
- `public/` - Static files

## Features

- Drag and drop button parts onto device layout
- Multiple grid layouts (2x4, 1x8, 2x6)
- Color palette with frame/full color application
- Icon and text customization for buttons
- Material Design UI
- Responsive Bootstrap grid layout

## Note

This is a conversion from vanilla JavaScript to React. The original `drag-drop.js` logic has been converted to React hooks and components. All functionality should work the same as the original version.

