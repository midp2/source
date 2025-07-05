// Global variables
let editor;
let currentFile = null;
let files = new Map();
let activeTab = null;
let contextTarget = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    loadFromLocalStorage();
    setupEventListeners();
    
    // Initialize with welcome content
    files.set('welcome.md', {
        name: 'welcome.md',
        content: `# Welcome to Mobile Code Editor

## Features
- ✨ Syntax highlighting for multiple languages
- 📱 Mobile-optimized interface for Kiwi Browser
- 📁 File management and editing
- 🔧 Code execution preview
- 💾 Local storage persistence
- 🎨 Modern dark theme

## Supported Languages
- JavaScript (.js)
- HTML (.html)
- CSS (.css)
- PHP (.php)
- Python (.py)
- Java (.java)
- C++ (.cpp)
- C (.c)
- JSON (.json)
- XML (.xml)
- Markdown (.md)

## How to Use
1. **Upload Files**: Click "Upload Files" to load your code
2. **Create New**: Click "New" to create a new file
3. **Edit**: Click on any file to start editing
4. **Save**: Press Ctrl+S or click the Save button
5. **Run**: Click Run to execute JavaScript/HTML code

## Mobile Tips
- Use the menu button (☰) to toggle the file sidebar
- Long press on files for context menu options
- Swipe between tabs for easy navigation
- All changes are automatically saved locally

Happy coding! 🚀`,
        type: 'markdown',
        modified: false
    });
    
    switchToFile('welcome.md');
    updateFileTree();
});

// Initialize CodeMirror editor
function initializeEditor() {
    const textarea = document.getElementById('codeEditor');
    
    editor = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'markdown',
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        indentWithTabs: false,
        extraKeys: {
            "Ctrl-S": function(cm) {
                saveFile();
            },
            "Cmd-S": function(cm) {
                saveFile();
            },
            "F11": function(cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function(cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
            }
        }
    });
    
    // Handle content changes
    editor.on('change', function() {
        if (currentFile) {
            const content = editor.getValue();
            const fileData = files.get(currentFile);
            if (fileData && fileData.content !== content) {
                fileData.content = content;
                fileData.modified = true;
                updateTabStatus(currentFile);
                saveToLocalStorage();
            }
        }
    });
    
    // Handle touch events for mobile
    editor.on('touchstart', function(cm, event) {
        // Hide virtual keyboard on scroll
        if (event.touches.length > 1) {
            cm.getInputField().blur();
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.querySelector('.menu-btn');
        
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
    
    // Context menu
    document.addEventListener('contextmenu', function(e) {
        const fileItem = e.target.closest('.file-item');
        if (fileItem) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, fileItem.dataset.file);
        }
    });
    
    // Hide context menu on click
    document.addEventListener('click', function() {
        hideContextMenu();
    });
    
    // Mobile long press for context menu
    let longPressTimer;
    document.addEventListener('touchstart', function(e) {
        const fileItem = e.target.closest('.file-item');
        if (fileItem) {
            longPressTimer = setTimeout(function() {
                const rect = fileItem.getBoundingClientRect();
                showContextMenu(rect.left + rect.width / 2, rect.top + rect.height / 2, fileItem.dataset.file);
            }, 500);
        }
    });
    
    document.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
    });
    
    document.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveFile();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewFile();
        }
    });
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// File upload handler
function handleFileUpload(event) {
    const uploadedFiles = event.target.files;
    
    Array.from(uploadedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const fileName = file.name;
            const fileType = getFileType(fileName);
            
            files.set(fileName, {
                name: fileName,
                content: content,
                type: fileType,
                modified: false
            });
            
            updateFileTree();
            switchToFile(fileName);
            saveToLocalStorage();
            addMessage(`File "${fileName}" uploaded successfully`, 'success');
        };
        reader.readAsText(file);
    });
    
    // Reset input
    event.target.value = '';
}

// Create new file
function createNewFile() {
    const fileName = prompt('Enter file name (with extension):');
    if (fileName && !files.has(fileName)) {
        const fileType = getFileType(fileName);
        files.set(fileName, {
            name: fileName,
            content: '',
            type: fileType,
            modified: false
        });
        
        updateFileTree();
        switchToFile(fileName);
        saveToLocalStorage();
        addMessage(`New file "${fileName}" created`, 'success');
    } else if (files.has(fileName)) {
        addMessage(`File "${fileName}" already exists`, 'error');
    }
}

// Switch to file
function switchToFile(fileName) {
    const fileData = files.get(fileName);
    if (!fileData) return;
    
    currentFile = fileName;
    
    // Update editor content and mode
    editor.setValue(fileData.content);
    editor.setOption('mode', getModeForFile(fileData.type));
    
    // Update UI
    updateTabs(fileName);
    updateFileTree();
    
    // Focus editor
    setTimeout(() => {
        editor.focus();
    }, 100);
}

// Update file tree
function updateFileTree() {
    const fileTree = document.getElementById('fileTree');
    fileTree.innerHTML = '';
    
    files.forEach((fileData, fileName) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.file = fileName;
        
        if (fileName === currentFile) {
            fileItem.classList.add('active');
        }
        
        const icon = getFileIcon(fileData.type);
        const modifiedIndicator = fileData.modified ? ' •' : '';
        
        fileItem.innerHTML = `
            <i class="${icon}"></i>
            <span>${fileName}${modifiedIndicator}</span>
        `;
        
        fileItem.addEventListener('click', function() {
            switchToFile(fileName);
            // Hide sidebar on mobile after selecting file
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
        
        fileTree.appendChild(fileItem);
    });
}

// Update tabs
function updateTabs(activeFileName) {
    const tabsContainer = document.getElementById('tabsContainer');
    tabsContainer.innerHTML = '';
    
    files.forEach((fileData, fileName) => {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.file = fileName;
        
        if (fileName === activeFileName) {
            tab.classList.add('active');
        }
        
        const modifiedIndicator = fileData.modified ? ' •' : '';
        
        tab.innerHTML = `
            <span class="tab-name">${fileName}${modifiedIndicator}</span>
            <button class="close-tab" onclick="closeTab('${fileName}')">&times;</button>
        `;
        
        tab.addEventListener('click', function(e) {
            if (!e.target.classList.contains('close-tab')) {
                switchToFile(fileName);
            }
        });
        
        tabsContainer.appendChild(tab);
    });
}

// Close tab
function closeTab(fileName) {
    const fileData = files.get(fileName);
    if (fileData && fileData.modified) {
        if (!confirm(`File "${fileName}" has unsaved changes. Close anyway?`)) {
            return;
        }
    }
    
    files.delete(fileName);
    
    // Switch to another file if current file is closed
    if (fileName === currentFile) {
        const remainingFiles = Array.from(files.keys());
        if (remainingFiles.length > 0) {
            switchToFile(remainingFiles[0]);
        } else {
            currentFile = null;
            editor.setValue('');
            updateTabs(null);
        }
    } else {
        updateTabs(currentFile);
    }
    
    updateFileTree();
    saveToLocalStorage();
}

// Update tab status
function updateTabStatus(fileName) {
    const tab = document.querySelector(`[data-file="${fileName}"]`);
    if (tab) {
        const fileData = files.get(fileName);
        const modifiedIndicator = fileData.modified ? ' •' : '';
        const tabName = tab.querySelector('.tab-name');
        tabName.textContent = fileName + modifiedIndicator;
    }
}

// Save file
function saveFile() {
    if (!currentFile) {
        addMessage('No file selected to save', 'error');
        return;
    }
    
    const fileData = files.get(currentFile);
    if (fileData) {
        fileData.modified = false;
        updateTabStatus(currentFile);
        updateFileTree();
        saveToLocalStorage();
        addMessage(`File "${currentFile}" saved successfully`, 'success');
    }
}

// Run code
function runCode() {
    if (!currentFile) {
        addMessage('No file selected to run', 'error');
        return;
    }
    
    const fileData = files.get(currentFile);
    if (!fileData) return;
    
    const outputContent = document.getElementById('outputContent');
    outputContent.innerHTML = '';
    
    try {
        if (fileData.type === 'javascript') {
            // Create a safe execution context
            const originalConsole = console;
            const outputs = [];
            
            const safeConsole = {
                log: (...args) => outputs.push({ type: 'log', args }),
                error: (...args) => outputs.push({ type: 'error', args }),
                warn: (...args) => outputs.push({ type: 'warn', args }),
                info: (...args) => outputs.push({ type: 'info', args })
            };
            
            // Replace console temporarily
            window.console = safeConsole;
            
            try {
                eval(fileData.content);
                
                // Display outputs
                outputs.forEach(output => {
                    const message = output.args.map(arg => 
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' ');
                    
                    addOutput(message, output.type);
                });
                
                if (outputs.length === 0) {
                    addOutput('Code executed successfully (no output)', 'info');
                }
            } catch (error) {
                addOutput(`Error: ${error.message}`, 'error');
            } finally {
                // Restore original console
                window.console = originalConsole;
            }
            
        } else if (fileData.type === 'html') {
            // Create a preview window
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(fileData.content);
            previewWindow.document.close();
            addOutput('HTML file opened in new window', 'info');
            
        } else if (fileData.type === 'markdown') {
            // Simple markdown preview
            const previewWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Markdown Preview</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
                        code { background: #f4f4f4; padding: 2px 4px; border-radius: 2px; }
                    </style>
                </head>
                <body>
                    <pre>${fileData.content}</pre>
                </body>
                </html>
            `;
            previewWindow.document.write(htmlContent);
            previewWindow.document.close();
            addOutput('Markdown file opened in new window', 'info');
            
        } else {
            addOutput(`Cannot run ${fileData.type} files. Only JavaScript and HTML files can be executed.`, 'error');
        }
    } catch (error) {
        addOutput(`Error: ${error.message}`, 'error');
    }
}

// Add output message
function addOutput(message, type = 'info') {
    const outputContent = document.getElementById('outputContent');
    const messageElement = document.createElement('div');
    messageElement.className = `output-${type}`;
    messageElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    outputContent.appendChild(messageElement);
    outputContent.scrollTop = outputContent.scrollHeight;
}

// Clear output
function clearOutput() {
    document.getElementById('outputContent').innerHTML = '<div class="output-message">Output cleared</div>';
}

// Add message
function addMessage(message, type = 'info') {
    addOutput(message, type);
}

// Context menu functions
function showContextMenu(x, y, fileName) {
    contextTarget = fileName;
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    
    // Adjust position if menu goes off screen
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (y - rect.height) + 'px';
    }
}

function hideContextMenu() {
    document.getElementById('contextMenu').style.display = 'none';
    contextTarget = null;
}

function renameFile() {
    if (!contextTarget) return;
    
    const newName = prompt('Enter new file name:', contextTarget);
    if (newName && newName !== contextTarget && !files.has(newName)) {
        const fileData = files.get(contextTarget);
        files.delete(contextTarget);
        files.set(newName, { ...fileData, name: newName });
        
        if (currentFile === contextTarget) {
            currentFile = newName;
        }
        
        updateFileTree();
        updateTabs(currentFile);
        saveToLocalStorage();
        addMessage(`File renamed from "${contextTarget}" to "${newName}"`, 'success');
    }
    
    hideContextMenu();
}

function deleteFile() {
    if (!contextTarget) return;
    
    if (confirm(`Delete file "${contextTarget}"?`)) {
        files.delete(contextTarget);
        
        if (currentFile === contextTarget) {
            const remainingFiles = Array.from(files.keys());
            if (remainingFiles.length > 0) {
                switchToFile(remainingFiles[0]);
            } else {
                currentFile = null;
                editor.setValue('');
                updateTabs(null);
            }
        }
        
        updateFileTree();
        saveToLocalStorage();
        addMessage(`File "${contextTarget}" deleted`, 'success');
    }
    
    hideContextMenu();
}

function downloadFile() {
    if (!contextTarget) return;
    
    const fileData = files.get(contextTarget);
    if (fileData) {
        const blob = new Blob([fileData.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.name;
        a.click();
        URL.revokeObjectURL(url);
        addMessage(`File "${contextTarget}" downloaded`, 'success');
    }
    
    hideContextMenu();
}

// Utility functions
function getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = {
        'js': 'javascript',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'php': 'php',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'json': 'json',
        'xml': 'xml',
        'md': 'markdown',
        'txt': 'text'
    };
    return typeMap[ext] || 'text';
}

function getModeForFile(fileType) {
    const modeMap = {
        'javascript': 'javascript',
        'html': 'xml',
        'css': 'css',
        'php': 'php',
        'python': 'python',
        'java': 'text/x-java',
        'cpp': 'text/x-c++src',
        'c': 'text/x-csrc',
        'json': 'application/json',
        'xml': 'xml',
        'markdown': 'markdown',
        'text': 'text'
    };
    return modeMap[fileType] || 'text';
}

function getFileIcon(fileType) {
    const iconMap = {
        'javascript': 'fab fa-js-square',
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt',
        'php': 'fab fa-php',
        'python': 'fab fa-python',
        'java': 'fab fa-java',
        'cpp': 'fas fa-code',
        'c': 'fas fa-code',
        'json': 'fas fa-brackets-curly',
        'xml': 'fas fa-code',
        'markdown': 'fab fa-markdown',
        'text': 'fas fa-file-text'
    };
    return iconMap[fileType] || 'fas fa-file';
}

// Local storage functions
function saveToLocalStorage() {
    const data = {
        files: Array.from(files.entries()),
        currentFile: currentFile
    };
    localStorage.setItem('mobileCodeEditor', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('mobileCodeEditor');
    if (data) {
        try {
            const parsed = JSON.parse(data);
            files = new Map(parsed.files);
            currentFile = parsed.currentFile;
            
            if (files.size > 0) {
                updateFileTree();
                if (currentFile && files.has(currentFile)) {
                    switchToFile(currentFile);
                }
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
}