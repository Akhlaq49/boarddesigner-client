"""
PDF Generation Server using Playwright
Generates high-quality PDFs from the frame element
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from playwright.sync_api import sync_playwright
import base64
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from PIL import Image
import json
import time
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    """
    Generate PDF from HTML frame element
    Expects JSON with:
    - html: HTML content of the frame element
    - width: frame width in pixels
    - height: frame height in pixels
    - gridType: grid type (2x4, 1x8, 2x6)
    """
    try:
        data = request.json
        html_content = data.get('html')
        frame_width = data.get('width', 320)
        frame_height = data.get('height', 320)
        grid_type = data.get('gridType', '2x4')
        
        if not html_content:
            return jsonify({'error': 'HTML content is required'}), 400
        
        # Read CSS file to include styles
        css_content = ""
        try:
            css_path = os.path.join(os.path.dirname(__file__), 'src', 'styles.css')
            if os.path.exists(css_path):
                with open(css_path, 'r', encoding='utf-8') as f:
                    css_content = f.read()
        except Exception as e:
            print(f"Warning: Could not load CSS file: {e}")
        
        # Create a temporary HTML file with the frame
        html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #ffffff;
            padding: 20px;
        }}
        .frame-container {{
            width: {frame_width}px;
            height: {frame_height}px;
            background: #ffffff;
        }}
        /* Hide buttons */
        .remove-button,
        .button-color-btn {{
            display: none !important;
            visibility: hidden !important;
        }}
        /* Include original CSS */
        {css_content}
    </style>
</head>
<body>
    <div class="frame-container">
        {html_content}
    </div>
</body>
</html>
"""
        
        # Use Playwright to capture screenshot with overall timeout
        screenshot = None
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
            )
            context = browser.new_context(
                viewport={'width': frame_width + 40, 'height': frame_height + 40},
                ignore_https_errors=True
            )
            page = context.new_page()
            
            # Set reasonable timeout for page operations (30 seconds max)
            page.set_default_timeout(30000)
            
            # Intercept and handle image requests with timeout
            def handle_image_route(route):
                request_obj = route.request
                url = request_obj.url
                resource_type = request_obj.resource_type
                
                # Only handle actual image requests
                if resource_type == 'image' or '/images/' in url or '/ican/images/' in url:
                    # If it's a relative image path, try to load from React dev server
                    if url.startswith('/images/') or url.startswith('/ican/images/'):
                        # Try loading from React app (assuming it's running on localhost:3000)
                        new_url = f'http://localhost:3000{url}'
                        try:
                            route.continue_(url=new_url, timeout=5000)
                            return
                        except Exception as e:
                            print(f"Failed to redirect image {url}: {e}")
                            # Abort if redirect fails - don't block
                            route.abort()
                            return
                
                # For other requests, continue normally
                try:
                    route.continue_()
                except:
                    route.abort()
            
            # Route only image requests to handle relative paths
            page.route('**/images/**', handle_image_route)
            page.route('**/ican/images/**', handle_image_route)
            
            # Load HTML content (don't wait for all resources)
            try:
                page.set_content(html_template, wait_until='domcontentloaded', timeout=10000)
            except Exception as e:
                print(f"Warning: Content load had issues: {e}")
                # Try to continue anyway - the HTML might still be loaded
            
            # Wait for initial rendering - give it time but don't wait forever
            page.wait_for_timeout(3000)
            
            # Try to wait for images to load, but with a short timeout
            try:
                # Wait for any images in the frame to load (max 5 seconds)
                page.wait_for_load_state('networkidle', timeout=5000)
            except:
                print("Network idle timeout - continuing anyway")
                pass
            
            # Debug: Check what's actually in the page
            try:
                body_html = page.locator('body').inner_html()
                print(f"Body HTML length: {len(body_html)}")
                # Check for key elements
                has_frame_container = '.frame-container' in body_html or page.locator('.frame-container').count() > 0
                has_key = '#key' in body_html or page.locator('#key').count() > 0
                has_layout = 'class="layout' in body_html or page.locator('.layout').count() > 0
                print(f"Elements found - .frame-container: {has_frame_container}, #key: {has_key}, .layout: {has_layout}")
            except Exception as e:
                print(f"Debug check failed: {e}")
            
            # Try to take screenshot with longer timeout and don't wait for images
            screenshot = None
            screenshot_error = None
            
            # Method 1: Try .frame-container using bounding box approach
            try:
                frame_container = page.locator('.frame-container')
                count = frame_container.count()
                if count > 0:
                    print(f"Found .frame-container element (count: {count})")
                    # Get bounding box and use page.screenshot with clip
                    bbox = frame_container.first.bounding_box(timeout=5000)
                    if bbox:
                        print(f"Bounding box: {bbox}")
                        screenshot = page.screenshot(
                            type='png',
                            clip={
                                'x': bbox['x'],
                                'y': bbox['y'],
                                'width': bbox['width'],
                                'height': bbox['height']
                            },
                            timeout=10000
                        )
                        print("Screenshot taken from .frame-container (clip method)")
                    else:
                        # Fallback to locator screenshot
                        screenshot = frame_container.first.screenshot(
                            type='png', 
                            timeout=30000,
                            animations='disabled'
                        )
                        print("Screenshot taken from .frame-container (locator method)")
            except Exception as e:
                screenshot_error = str(e)
                print(f"Method 1 (.frame-container) failed: {e}")
            
            # Method 2: Try #key if method 1 failed
            if not screenshot:
                try:
                    key_element = page.locator('#key')
                    count = key_element.count()
                    if count > 0:
                        print(f"Found #key element (count: {count})")
                        # Try bounding box method first
                        try:
                            bbox = key_element.first.bounding_box(timeout=5000)
                            if bbox:
                                screenshot = page.screenshot(
                                    type='png',
                                    clip={
                                        'x': bbox['x'],
                                        'y': bbox['y'],
                                        'width': bbox['width'],
                                        'height': bbox['height']
                                    },
                                    timeout=10000
                                )
                                print("Screenshot taken from #key (clip method)")
                            else:
                                raise Exception("No bounding box")
                        except:
                            # Fallback to locator screenshot
                            screenshot = key_element.first.screenshot(
                                type='png', 
                                timeout=30000,
                                animations='disabled'
                            )
                            print("Screenshot taken from #key (locator method)")
                except Exception as e:
                    screenshot_error = str(e)
                    print(f"Method 2 (#key) failed: {e}")
            
            # Method 3: Try .layout if methods 1-2 failed
            if not screenshot:
                try:
                    layout_element = page.locator('.layout')
                    count = layout_element.count()
                    if count > 0:
                        print(f"Found .layout element (count: {count})")
                        screenshot = layout_element.first.screenshot(
                            type='png', 
                            timeout=30000,
                            animations='disabled'
                        )
                        print("Screenshot taken from .layout")
                except Exception as e:
                    screenshot_error = str(e)
                    print(f"Method 3 (.layout) failed: {e}")
            
            # Method 4: Fallback to body screenshot
            if not screenshot:
                try:
                    print("Using body fallback screenshot")
                    screenshot = page.screenshot(
                        type='png', 
                        timeout=30000, 
                        full_page=False,
                        animations='disabled'
                    )
                    print("Screenshot taken from body")
                except Exception as e:
                    screenshot_error = str(e)
                    print(f"Method 4 (body) also failed: {e}")
            
            browser.close()
            
            if not screenshot:
                raise Exception("Failed to capture screenshot")
        
        # Convert screenshot to PDF
        img = Image.open(io.BytesIO(screenshot))
        
        # Calculate PDF dimensions maintaining aspect ratio
        img_width, img_height = img.size
        aspect_ratio = img_width / img_height
        
        # A4 dimensions in points (1 point = 1/72 inch)
        a4_width, a4_height = A4
        max_width = a4_width - 40  # 20pt margin on each side
        max_height = a4_height - 40
        
        if aspect_ratio > max_width / max_height:
            pdf_width = max_width
            pdf_height = max_width / aspect_ratio
        else:
            pdf_height = max_height
            pdf_width = max_height * aspect_ratio
        
        # Create PDF
        buffer = io.BytesIO()
        pdf_canvas = canvas.Canvas(buffer, pagesize=(pdf_width, pdf_height))
        
        # Center the image
        x_offset = (pdf_width - pdf_width) / 2
        y_offset = (pdf_height - pdf_height) / 2
        
        # Draw image on PDF
        img_reader = ImageReader(io.BytesIO(screenshot))
        pdf_canvas.drawImage(
            img_reader,
            0, 0,
            width=pdf_width,
            height=pdf_height,
            preserveAspectRatio=True
        )
        
        pdf_canvas.save()
        buffer.seek(0)
        
        # Return PDF file
        filename = f'board-design-{grid_type}-{int(time.time())}.pdf'
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("Starting PDF generation server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
