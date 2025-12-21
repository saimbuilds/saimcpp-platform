#!/usr/bin/env python3
import markdown
import os

# Read the markdown file
with open('/home/saimsys/.gemini/antigravity/brain/3fa15374-ac3c-4067-9de5-a153cc729a5b/monetization_roadmap.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert markdown to HTML
html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

# Create a styled HTML document
html_template = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Monetization Roadmap - Competitive Programming Platform</title>
    <style>
        @page {{
            margin: 1in;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
        }}
        h1 {{
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            page-break-after: avoid;
        }}
        h2 {{
            color: #34495e;
            margin-top: 30px;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            page-break-after: avoid;
        }}
        h3 {{
            color: #555;
            margin-top: 20px;
            page-break-after: avoid;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            page-break-inside: avoid;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }}
        th {{
            background-color: #3498db;
            color: white;
        }}
        tr:nth-child(even) {{
            background-color: #f2f2f2;
        }}
        blockquote {{
            background: #f9f9f9;
            border-left: 5px solid #3498db;
            margin: 20px 0;
            padding: 15px 20px;
            font-style: italic;
            page-break-inside: avoid;
        }}
        ul, ol {{
            margin: 15px 0;
            padding-left: 30px;
        }}
        li {{
            margin: 8px 0;
        }}
        code {{
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }}
        hr {{
            border: none;
            border-top: 2px solid #eee;
            margin: 30px 0;
        }}
        strong {{
            color: #2c3e50;
        }}
    </style>
</head>
<body>
{html_content}
</body>
</html>"""

# Write HTML file
html_path = '/home/saimsys/vibe coding/monetization_roadmap.html'
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_template)

print(f"HTML file created: {html_path}")
print("Now converting to PDF using Chrome...")

# Convert to PDF using Chrome
pdf_path = '/home/saimsys/vibe coding/monetization_roadmap.pdf'
os.system(f'google-chrome --headless --disable-gpu --print-to-pdf="{pdf_path}" "{html_path}"')

print(f"PDF created: {pdf_path}")
