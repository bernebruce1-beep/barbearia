import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

D = os.path.dirname(os.path.abspath(__file__))
OUT = "/home/user/barbearia/logo"
F = {k: TTFont(os.path.join(D, f)) for k, f in
     [("roman", "bodoni.ttf"), ("italic", "bodoni-italic.ttf"), ("sans", "manrope.ttf"),
      ("roman-b", "bodoni-bold.ttf"), ("italic-b", "bodoni-bold-italic.ttf")]}

def text(font, s, x, y, size, tracking=0.0):
    """Return (path d, advance width, bounds) for s set at baseline (x, y)."""
    f = F[font]; gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm
    sc = size / upm; pen = SVGPathPen(gs); bp = BoundsPen(gs); cx = 0.0
    for i, ch in enumerate(s):
        g = cmap[ord(ch)]
        t = (sc, 0, 0, -sc, x + cx, y)
        gs[g].draw(TransformPen(pen, t)); gs[g].draw(TransformPen(bp, t))
        cx += gs[g].width * sc + (tracking * size if i < len(s) - 1 else 0)
    return pen.getCommands(), cx, bp.bounds

INK, PINK, DEEP, LIGHT, PINK_D = "#15302D", "#A85C78", "#15302D", "#F3F5F4", "#DB93AE"

def sparkle(cx, cy, s, fill):
    # brilho de 4 pontas
    k = s * 0.16
    return (f'<path d="M{cx:.1f},{cy-s:.1f} Q{cx+k:.1f},{cy-k:.1f} {cx+s:.1f},{cy:.1f} Q{cx+k:.1f},{cy+k:.1f} {cx:.1f},{cy+s:.1f} '
            f'Q{cx-k:.1f},{cy+k:.1f} {cx-s:.1f},{cy:.1f} Q{cx-k:.1f},{cy-k:.1f} {cx:.1f},{cy-s:.1f}Z" fill="{fill}"/>')

def monogram(cx, cy, r, ink, pink, sw, simple=False, mono=False):
    # Símbolo: anel aberto (renovação) com um brilho pequeno no vão e um brilho grande no centro.
    # simple: anel e brilho pequeno mais encorpados, para tamanhos pequenos.
    import math
    gap_at, gap = -45, (62 if simple else 50)
    a0 = math.radians(gap_at + gap / 2); a1 = math.radians(gap_at - gap / 2 + 360)
    x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
    x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
    gx, gy = cx + r * math.cos(math.radians(gap_at)), cy + r * math.sin(math.radians(gap_at))
    return (f'<path d="M{x0:.1f},{y0:.1f} A{r},{r} 0 1 1 {x1:.1f},{y1:.1f}" fill="none" stroke="{pink}" '
            f'stroke-width="{sw}" stroke-linecap="round"/>'
            + sparkle(gx, gy, r * (0.26 if simple else 0.2), pink)
            + sparkle(cx, cy, r * (0.6 if simple else 0.55), ink))

def wordmark(x, y, size, ink, pink, center=False, sub_text="ESTÉTICA", track=0.42):
    d1, w1, _ = text("roman", "New ", x, y, size)
    d2, w2, _ = text("italic", "You", x + w1, y, size)
    sub = size * 0.24
    _, w3, _ = text("sans", sub_text, 0, 0, sub, tracking=track)
    sx = x + (w1 + w2 - w3) / 2 if center else x + 3
    d3, w3, _ = text("sans", sub_text, sx, y + size * 0.52, sub, tracking=track)
    return (f'<path d="{d1}" fill="{ink}"/><path d="{d2}" fill="{pink}"/><path d="{d3}" fill="{ink}"/>',
            max(w1 + w2, w3 + 3))

def write(name, w, h, body, bg=None):
    rect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    with open(os.path.join(OUT, name), "w") as fh:
        fh.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">'
                 f'<title>New You Estética</title>{rect}{body}</svg>\n')

# 1) Horizontal (fundo claro) e 2) negativo (fundo escuro)
for name, ink, pink, bg in [("new-you-horizontal.svg", INK, PINK, None),
                            ("new-you-horizontal-negativo.svg", LIGHT, PINK_D, DEEP)]:
    pad, r = 40, 78
    m = monogram(pad + r, pad + r, r, ink, pink, 4)
    wm, ww = wordmark(pad + 2*r + 44, pad + r + 14, 96, ink, pink)
    write(name, pad + 2*r + 44 + ww + pad, 2*(pad + r), m + wm, bg)

# 3) Vertical / empilhado
for name, ink, pink, bg in [("new-you-vertical.svg", INK, PINK, None),
                            ("new-you-vertical-negativo.svg", LIGHT, PINK_D, DEEP)]:
    W = 600; r = 110
    m = monogram(W/2, 60 + r, r, ink, pink, 5.5)
    _, ww = wordmark(0, 0, 104, ink, pink)
    wm, _ = wordmark((W - ww)/2, 60 + 2*r + 130, 104, ink, pink, center=True)
    write(name, W, 60 + 2*r + 130 + 104*0.52 + 70, m + wm, bg)

# 4) Ícone quadrado (avatar do Instagram / WhatsApp)
write("new-you-icone.svg", 1080, 1080, monogram(540, 540, 330, LIGHT, PINK_D, 14), DEEP)
write("new-you-icone-claro.svg", 1080, 1080, monogram(540, 540, 330, INK, PINK, 14), LIGHT)

# 5) Ícone para tamanho pequeno (perfil, favicon): sem anel menor, letras e anel mais grossos
write("new-you-icone-pequeno.svg", 512, 512, monogram(256, 256, 190, LIGHT, PINK_D, 26, simple=True), DEEP)

# 6) Uma cor só (adesivo, bordado, carimbo, gravação): verde e branco
for name, c, bg in [("new-you-mono-verde.svg", INK, None), ("new-you-mono-branco.svg", LIGHT, DEEP)]:
    pad, r = 40, 78
    m = monogram(pad + r, pad + r, r, c, c, 4, mono=True)
    wm, ww = wordmark(pad + 2*r + 44, pad + r + 14, 96, c, c)
    write(name, pad + 2*r + 44 + ww + pad, 2*(pad + r), m + wm, bg)

# 7) Com descritivo dos serviços (fachada, posts)
for name, ink, pink, bg in [("new-you-completo.svg", INK, PINK, None),
                            ("new-you-completo-negativo.svg", LIGHT, PINK_D, DEEP)]:
    pad, r = 40, 78
    m = monogram(pad + r, pad + r, r, ink, pink, 4)
    wm, ww = wordmark(pad + 2*r + 44, pad + r + 14, 96, ink, pink, sub_text="BARBEARIA · TATTOO · ESTÉTICA", track=0.16)
    write(name, pad + 2*r + 44 + ww + pad, 2*(pad + r), m + wm, bg)
print(sorted(os.listdir(OUT)))
