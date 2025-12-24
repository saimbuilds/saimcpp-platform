from PIL import Image
import os

# Load the logo
logo_path = "/home/saimsys/vibe coding/saimcpp-react/public/finallogo.jpeg"
output_path = "/home/saimsys/vibe coding/saimcpp-react/public/finallogo.png"

# Open the image
img = Image.open(logo_path)

# Convert to RGBA if not already
img = img.convert("RGBA")

# Get the pixel data
datas = img.getdata()

# Create new image data with transparent background
newData = []
for item in datas:
    # Check if pixel is black (or very dark)
    # Adjust threshold as needed - lower = more aggressive
    if item[0] < 40 and item[1] < 40 and item[2] < 40:
        # Make it transparent
        newData.append((255, 255, 255, 0))
    else:
        # Keep the pixel
        newData.append(item)

# Update image data
img.putdata(newData)

# Save as PNG with transparency
img.save(output_path, "PNG")
print(f"Transparent logo saved to: {output_path}")
