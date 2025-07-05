# Mobile Code Editor for Kiwi Browser

A comprehensive, mobile-optimized web-based code editor specifically designed for Kiwi Browser on Android OS. This developer tool allows you to edit and read source code with syntax highlighting, file management, and code execution capabilities.

## 🚀 Features

### Core Features
- **📱 Mobile Optimized**: Specifically designed for Kiwi Browser on Android
- **🎨 Syntax Highlighting**: Beautiful syntax highlighting using CodeMirror
- **📁 File Management**: Create, edit, rename, delete, and download files
- **💾 Local Storage**: Automatic persistence across browser sessions
- **🔧 Code Execution**: Run JavaScript and HTML files directly in the editor
- **📑 Tab System**: Work with multiple files simultaneously
- **🌙 Dark Theme**: Easy on the eyes for long coding sessions

### Supported Languages
- JavaScript (.js)
- HTML (.html, .htm)
- CSS (.css)
- PHP (.php)
- Python (.py)
- Java (.java)
- C++ (.cpp)
- C (.c)
- JSON (.json)
- XML (.xml)
- Markdown (.md)
- Plain Text (.txt)

## 🛠️ Installation

1. **Download the files** to your web server or local directory
2. **Open `index.html`** in Kiwi Browser
3. **Start coding!** The editor will initialize automatically

### Files Structure
```
mobile-code-editor/
├── index.html          # Main application file
├── styles.css          # CSS styling and responsive design
├── app.js             # JavaScript functionality
├── example-script.js   # Demo JavaScript file
├── demo-page.html     # Demo HTML file
├── sourceweb1.php     # Optional PHP backend
└── README.md          # This documentation
```

## 📱 Usage

### Getting Started
1. **Open** `index.html` in Kiwi Browser
2. **Toggle Sidebar**: Tap the menu button (☰) to show/hide the file panel
3. **Create Files**: Click "New" to create a new file
4. **Upload Files**: Use "Upload Files" to import existing code
5. **Edit Code**: Tap any file to start editing with syntax highlighting

### Mobile-Specific Features
- **Touch Optimized**: All buttons and interface elements are touch-friendly
- **Long Press**: Long press on files for context menu (rename, delete, download)
- **Swipe Navigation**: Easy tab switching on mobile devices
- **Responsive Design**: Adapts to different screen sizes and orientations

### Keyboard Shortcuts
- **Ctrl+S / Cmd+S**: Save current file
- **Ctrl+N / Cmd+N**: Create new file
- **F11**: Toggle fullscreen mode
- **Esc**: Exit fullscreen mode

### Code Execution
- **JavaScript**: Click "Run" to execute JS code and see output
- **HTML**: Click "Run" to open HTML files in a new window
- **Other Languages**: Syntax highlighting and editing support

## 🎯 Advanced Features

### File Management
- **Create**: Add new files with any supported extension
- **Edit**: Real-time syntax highlighting and auto-save
- **Rename**: Right-click or long-press to rename files
- **Delete**: Remove files with confirmation
- **Download**: Save files to your device

### Local Storage
- All files are automatically saved to browser's local storage
- Work persists across browser sessions
- No data is sent to external servers

### Context Menus
- **Desktop**: Right-click on files for options
- **Mobile**: Long-press on files for context menu
- **Options**: Rename, Delete, Download

## 🔧 Technical Details

### Dependencies
- **CodeMirror 6.65.7**: Syntax highlighting and code editing
- **Font Awesome 6.0.0**: Icons and UI elements
- **No Server Required**: Runs entirely in the browser

### Browser Compatibility
- **Primary**: Kiwi Browser (Android)
- **Secondary**: Chrome, Firefox, Safari, Edge
- **Mobile**: Optimized for touch interfaces
- **Desktop**: Full functionality available

### Performance
- **Lightweight**: Minimal resource usage
- **Fast Loading**: Optimized for mobile networks
- **Smooth Scrolling**: Touch-friendly interactions
- **Memory Efficient**: Handles large files well

## 📝 Examples

### JavaScript Example
```javascript
// Example: Basic calculator
const add = (a, b) => a + b;
const result = add(5, 3);
console.log(`5 + 3 = ${result}`);

// DOM manipulation
document.getElementById('output').innerHTML = `Result: ${result}`;
```

### HTML Example
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Mobile Code Editor!</h1>
        <p>This HTML file can be previewed by clicking Run.</p>
    </div>
</body>
</html>
```

## 🔒 Security

### Local Storage Only
- All files are stored locally in your browser
- No data is transmitted to external servers
- Privacy-focused design

### Safe Code Execution
- JavaScript execution is sandboxed
- Console output is captured safely
- No file system access beyond downloads

## 🛠️ Customization

### Themes
- Currently uses Dracula theme
- Can be modified in `styles.css`
- CodeMirror themes can be added

### Languages
- Add new language support by including CodeMirror modes
- Modify file type detection in `app.js`
- Extend syntax highlighting as needed

## 🐛 Troubleshooting

### Common Issues
1. **Files not loading**: Check browser's local storage permissions
2. **Syntax highlighting not working**: Ensure CodeMirror CDN is accessible
3. **Touch issues**: Try refreshing the page or clearing cache
4. **Performance**: Close unused tabs to free memory

### Browser Settings
- **JavaScript**: Must be enabled
- **Local Storage**: Must be allowed
- **Pop-ups**: Allow for HTML preview windows

## 📚 API Reference

### Main Functions
- `createNewFile()`: Create a new file
- `saveFile()`: Save current file
- `runCode()`: Execute current file
- `toggleSidebar()`: Show/hide file panel
- `switchToFile(filename)`: Open specific file

### Storage Functions
- `saveToLocalStorage()`: Persist data
- `loadFromLocalStorage()`: Restore data
- `clearStorage()`: Reset all data

## 🤝 Contributing

Feel free to contribute to this project by:
1. **Reporting Issues**: Submit bug reports or feature requests
2. **Adding Languages**: Extend syntax highlighting support
3. **Improving Mobile**: Enhance touch interactions
4. **Optimizing Performance**: Make the editor even faster

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Getting Started

1. **Download** all files to your device
2. **Open** `index.html` in Kiwi Browser
3. **Start** with the demo files or create your own
4. **Enjoy** coding on your mobile device!

The Mobile Code Editor makes it easy to write, edit, and test code directly on your Android device using Kiwi Browser. Whether you're a professional developer or just learning to code, this tool provides a powerful and intuitive mobile coding experience.

Happy coding! 🚀