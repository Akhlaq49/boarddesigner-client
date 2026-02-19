# MM Technology interior - Drag and Drop Implementation

A clean, modern drag-and-drop interface for designing custom KNX switches.

## Features

- **Drag and Drop**: Intuitive drag-and-drop functionality for placing button parts on the device layout
- **Visual Feedback**: Clear visual indicators when dragging and dropping elements
- **Clean Architecture**: Modular JavaScript class-based implementation
- **Responsive Design**: Works on different screen sizes
- **State Management**: Built-in methods to save and restore layout states

## File Structure

```
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── drag-drop.js    # Drag and drop functionality
└── README.md       # This file
```

## Usage

1. Open `index.html` in a modern web browser
2. Drag button parts from the sidebar onto the device layout
3. Drop them into the desired drop zones
4. Remove buttons by hovering over them and clicking the X button

## How It Works

### Drag and Drop Flow

1. **Drag Start**: When you start dragging a button, it stores the button type and classes
2. **Drag Over**: As you drag over drop zones, they highlight to show valid drop targets
3. **Drop**: When you drop, the button is placed in the zone with visual feedback
4. **State Management**: The layout state can be saved and restored

### Key Components

- **Draggable Buttons**: Buttons in the sidebar with `draggable="true"` attribute
- **Drop Zones**: Areas in the device layout marked with `data-place` attributes
- **DragDropManager**: Main class that handles all drag-and-drop logic

## API Methods

### Get Current Layout State
```javascript
const state = window.dragDropManager.getLayoutState();
// Returns: { button1: { buttonType: "1", classes: [...] }, ... }
```

### Load Layout State
```javascript
const savedState = {
    button1: { buttonType: "1", classes: ["custom-button-1", "polar-white"] },
    button2: { buttonType: "2", classes: ["custom-button-2", "polar-white"] }
};
window.dragDropManager.loadLayoutState(savedState);
```

## Customization

### Adding New Button Types

1. Add HTML for the new button in the sidebar:
```html
<button class="custom-button-5 draggable-btn" draggable="true" data-button-type="5"></button>
```

2. Add corresponding CSS styles:
```css
.custom-button-5 {
    min-height: 80px;
    background-color: #ffffff;
}
```

### Styling Drop Zones

Modify the `.drop-zone` class in `styles.css` to change appearance:
```css
.drop-zone {
    border: 2px dashed #d1d5db;
    border-radius: 0.375rem;
    /* Add your custom styles */
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This implementation is provided as-is for educational and development purposes.

