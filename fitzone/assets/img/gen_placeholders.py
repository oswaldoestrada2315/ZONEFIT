"""
Genera imágenes de demostración (gradientes + composición abstracta) para
usar como placeholders editables en la plantilla FitZone. No son
fotografías reales: deben reemplazarse por fotografía propia del gimnasio
antes de producción. Se ejecuta una sola vez durante el build del proyecto.
"""
from PIL import Image, ImageDraw, ImageFilter
import math, random, os

OUT = os.path.dirname(os.path.abspath(__file__))
YELLOW = (255, 201, 40)
BG1 = (20, 22, 27)
BG2 = (8, 9, 11)

def gradient_bg(w, h, c1=BG1, c2=BG2, angle="diag"):
    img = Image.new("RGB", (w, h), c1)
    top = Image.new("RGB", (w, h), c2)
    mask = Image.new("L", (w, h))
    mdata = []
    for y in range(h):
        for x in range(w):
            if angle == "diag":
                v = (x / w + y / h) / 2
            elif angle == "radial":
                v = min(1, math.hypot(x - w/2, y - h/2) / (max(w,h)*0.7))
            else:
                v = y / h
            mdata.append(int(255 * v))
    mask.putdata(mdata)
    img.paste(top, (0, 0), mask)
    return img

def vignette(img, strength=70):
    w, h = img.size
    vign = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(vign)
    d.ellipse([-w*0.3, -h*0.3, w*1.3, h*1.3], fill=strength)
    vign = vign.filter(ImageFilter.GaussianBlur(w//6))
    dark = Image.new("RGB", (w, h), (4,4,5))
    return Image.composite(img, dark, vign)

def glow_ring(d, cx, cy, r, width, color, alpha):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(*color, alpha), width=width)

def program_art(w, h, kind):
    img = gradient_bg(w, h, angle="radial", c1=(26,28,33), c2=(9,10,12))
    img = vignette(img, 50)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = w/2, h*0.42

    if kind == "strength":
        # Barra con discos — geometría limpia, no literal
        bar_w = w*0.5
        d.rounded_rectangle([cx-bar_w/2, cy-6, cx+bar_w/2, cy+6], radius=6, fill=(*YELLOW, 190))
        for side in (-1, 1):
            px = cx + side*bar_w*0.46
            for i, rr in enumerate([70, 50, 34]):
                d.ellipse([px-rr*0.22, cy-rr, px+rr*0.22, cy+rr], fill=(*YELLOW, 220-i*40))
        for i in range(3):
            glow_ring(d, cx, cy, 160+i*46, 1, YELLOW, 26-i*7)

    elif kind == "hypertrophy":
        # Capas concéntricas tipo "pulso de esfuerzo"
        for i, rr in enumerate([150, 115, 80, 45]):
            glow_ring(d, cx, cy, rr, 3, YELLOW, 190 - i*34)
        d.ellipse([cx-18, cy-18, cx+18, cy+18], fill=(*YELLOW, 230))

    elif kind == "cardio":
        # Línea de pulso cardiaco estilizada
        pts = []
        n = 5
        seg = w/n
        y0 = cy
        pts.append((0, y0))
        for i in range(n):
            x0 = i*seg
            pts.append((x0+seg*0.38, y0 - h*0.15))
            pts.append((x0+seg*0.55, y0 + h*0.17))
            pts.append((x0+seg*0.72, y0 - h*0.05))
            pts.append((x0+seg, y0))
        d.line(pts, fill=(*YELLOW, 215), width=7, joint="curve")

    elif kind == "mobility":
        # Arco fluido concéntrico (movimiento/flexibilidad)
        bbox = [cx-170, cy-170, cx+170, cy+170]
        for i, (start, end) in enumerate([(200, 340), (160, 300), (20, 160)]):
            d.arc(bbox, start, end, fill=(*YELLOW, 210-i*40), width=6)
            bbox = [b + 22*(1 if j%2==0 else -1) for j,b in enumerate(bbox)]

    label = {"strength":"FUERZA","hypertrophy":"HIPERTROFIA","cardio":"CARDIO","mobility":"MOVILIDAD"}[kind]
    return img

def trainer_art(w, h, seed):
    random.seed(seed)
    img = gradient_bg(w, h, angle="vert", c1=(24,26,31), c2=(9,10,12))
    img = vignette(img, 55)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = w/2, h*0.4
    r = w*0.22
    # cabeza
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(*YELLOW, 55), outline=(*YELLOW, 140), width=2)
    # hombros
    d.rounded_rectangle([cx-r*1.5, cy+r*0.65, cx+r*1.5, h*1.05], radius=60, fill=(*YELLOW, 40), outline=(*YELLOW, 110), width=2)
    return img

def avatar_art(w, h, seed):
    random.seed(seed)
    img = gradient_bg(w, h, angle="radial", c1=(28,30,35), c2=(10,11,13))
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = w/2, h*0.38
    r = w*0.26
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(*YELLOW, 70), outline=(*YELLOW, 150), width=2)
    d.rounded_rectangle([cx-r*1.4, cy+r*0.6, cx+r*1.4, h*1.2], radius=40, fill=(*YELLOW, 50))
    return img

def benefits_art(w, h):
    img = gradient_bg(w, h, angle="vert", c1=(24,26,31), c2=(8,9,11))
    img = vignette(img, 60)
    d = ImageDraw.Draw(img, "RGBA")
    # Haces de luz diagonales — eco del techo con tiras LED del video real
    for i in range(6):
        x0 = w*0.1 + i*w*0.16
        d.line([(x0, h*0.05), (x0 - w*0.22, h*0.55)], fill=(*YELLOW, 50 - i*4), width=3)
    # Marco central sutil (donde iría la foto real del coach/atleta)
    pad_x, pad_y = w*0.12, h*0.16
    d.rounded_rectangle([pad_x, pad_y, w-pad_x, h-pad_y], radius=32, outline=(*YELLOW, 90), width=2)
    # Anillo de progreso decorativo
    cx, cy = w*0.5, h*0.56
    glow_ring(d, cx, cy, w*0.16, 4, YELLOW, 180)
    glow_ring(d, cx, cy, w*0.16+14, 1, YELLOW, 70)
    return img

for name in ["strength", "hypertrophy", "cardio", "mobility"]:
    program_art(800, 1000, name).save(os.path.join(OUT, f"program-{name}.jpg"), quality=85)

for i in range(1, 5):
    trainer_art(640, 800, seed=i*17).save(os.path.join(OUT, f"trainer-{i}.jpg"), quality=85)

for i in range(1, 4):
    avatar_art(160, 160, seed=i*31).save(os.path.join(OUT, f"avatar-{i}.jpg"), quality=82)

benefits_art(900, 1125).save(os.path.join(OUT, "benefits-main.jpg"), quality=88)

print("OK -", sorted(os.listdir(OUT)))
