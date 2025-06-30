from flask import Flask, send_file, request, redirect, url_for, render_template_string
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont, ImageColor
from urllib.parse import quote, unquote

app = Flask(__name__)

FORM_HTML = """
<!doctype html>
<title>Image URL Converter</title>
<h2>Enter prompt, screen name, and responses (one per line):</h2>
<form method="post">
  <textarea name="input_text" rows="12" cols="50" placeholder="Prompt text
Screen name
Response 1
Response 2
Response 3...">{{ default_text }}</textarea><br>
  <button type="submit">Generate Image URL</button>
</form>
{% if url %}
  <p>Generated URL: <a href="{{ url }}" target="_blank">{{ url }}</a></p>
  <img src="{{ url }}" alt="Generated Image" style="max-width: 100%; height: auto; border: 1px solid #ccc; margin-top: 20px;">
{% endif %}
"""

def split_prompt(prompt):
    mid_index = len(prompt) // 2
    left_space = prompt.rfind(' ', 0, mid_index)
    right_space = prompt.find(' ', mid_index)
    if left_space != -1:
        split_point = left_space
    elif right_space != -1:
        split_point = right_space
    else:
        split_point = len(prompt)
    top_text = prompt[:split_point].strip()
    mid_text = prompt[split_point:].strip()
    return top_text, mid_text

@app.route('/', methods=['GET', 'POST'])
def converter():
    url = None
    default_text = ""
    if request.method == 'POST':
        input_text = request.form.get('input_text', '').strip()
        default_text = input_text
        lines = input_text.split('\n')
        if len(lines) >= 2:
            prompt = lines[0].strip()
            screen_name = lines[1].strip()
            responses = [line.strip() for line in lines[2:] if line.strip()]
            parts = [prompt, screen_name] + responses
            # URL-encode parts
            encoded_parts = [quote(quote(part)) for part in parts]
            url_path = '_'.join(encoded_parts)
            url = url_for('generate_image', full_path=url_path)
        else:
            url = None
    return render_template_string(FORM_HTML, url=url, default_text=default_text)

@app.route('/<path:full_path>.png')
def generate_image(full_path):
    parts = full_path.split('_')

    # Decode URL-encoded parts
    parts = [unquote(unquote(part)) for part in parts]

    if len(parts) < 2:
        # Need at least prompt and screen_name
        prompt = "Missing prompt"
        screen_name = "Missing"
        responses = []
    else:
        prompt = parts[0]
        screen_name = parts[1].upper()
        responses = parts[2:]

    top_text, mid_text = split_prompt(prompt)

    # Create white image
    img_width, img_height = 1280, 720
    img = Image.new('RGB', (img_width, img_height), color='white')
    draw = ImageDraw.Draw(img)

    try:
        font_path = "overpass.ttf"  # Adjust as needed
        screen_name_font = ImageFont.truetype(font_path, 48)
        response_font = ImageFont.truetype(font_path, 30)
    except:
        screen_name_font = ImageFont.load_default()
        response_font = ImageFont.load_default()

    # Draw prompt split lines
    draw.text((50, 15), top_text, fill="black", font=response_font)
    draw.text((50, 65), mid_text, fill="black", font=response_font)

    # Draw screen name box in top right
    screen_name_position = (img_width - 250, 45)
    text_bbox = draw.textbbox(screen_name_position, screen_name, font=screen_name_font)
    padding = 25
    rect_coords = (
        text_bbox[0] - padding,
        text_bbox[1] - padding,
        text_bbox[2] + padding,
        text_bbox[3] + padding
    )
    draw.rectangle(rect_coords, fill=ImageColor.getrgb("#F4CADE"))
    draw.text(screen_name_position, screen_name, fill="black", font=screen_name_font)

    # Draw responses with red letters and black text
    def get_letter(index):
        return chr(65 + index)  # A, B, C, ...

    for idx, response in enumerate(responses):
        letter = get_letter(idx)
        letter_position = (50, 125 + idx * 50)
        draw.text(letter_position, letter, fill="red", font=response_font)
        response_position = (100, 125 + idx * 50)
        draw.text(response_position, response, fill="black", font=response_font)

    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
