# PDF Generation Server Setup

This Python server uses Playwright to generate high-quality PDFs from the frame element with accurate colors and proper rendering.

## Quick Setup (Windows)

Run the setup script:
```bash
setup_pdf_server.bat
```

Then start the server:
```bash
python pdf_server.py
```

## Manual Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Playwright browsers:**
   ```bash
   playwright install chromium
   ```

3. **Start the PDF server:**
   ```bash
   python pdf_server.py
   ```
   The server will start on `http://localhost:5000`

4. **Make sure your React app is running:**
   The React app should be running on `http://localhost:3000` (or update the port in `Frame.jsx` if different)

## How It Works

1. The React app sends the frame HTML to the Python server
2. The Python server uses Playwright (headless Chrome) to render the HTML with CSS
3. Playwright takes a screenshot of only the frame area
4. The screenshot is converted to a PDF using ReportLab
5. The PDF is sent back to the client for download

## Benefits

- **Accurate colors**: Playwright renders exactly as the browser does
- **Only frame area**: Captures only the frame, not the whole page
- **Buttons hidden**: Remove and color change buttons are automatically hidden
- **High quality**: Uses device-scale rendering for crisp output

## Troubleshooting

- If you get connection errors, make sure the Python server is running on port 5000
- If images don't load, check that image paths in the HTML are correct
- If colors are wrong, ensure the CSS file path is correct in `pdf_server.py`
