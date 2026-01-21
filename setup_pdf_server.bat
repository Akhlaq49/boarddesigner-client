@echo off
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Installing Playwright browsers...
playwright install chromium

echo.
echo Setup complete! To start the server, run:
echo python pdf_server.py
pause
