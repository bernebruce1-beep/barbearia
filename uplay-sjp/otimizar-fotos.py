"""Gera as versões WebP usadas pelo site a partir dos JPGs em fotos/.

Uso: python3 otimizar-fotos.py   (precisa de opencv-python)
Para cada fotos/NOME.jpg cria fotos/NOME.webp (até 1600 px) e fotos/NOME-800.webp.
Rode de novo sempre que trocar ou adicionar uma foto.
"""
import glob, os
import cv2

for src in sorted(glob.glob(os.path.join(os.path.dirname(__file__) or '.', 'fotos', '*.jpg'))):
    if os.path.basename(src).startswith('og-'):
        continue  # a imagem de compartilhamento continua em JPG
    im = cv2.imread(src)
    base = src[:-4]
    for suffix, side in (('', 1600), ('-800', 800)):
        h, w = im.shape[:2]
        k = min(1, side / max(h, w))
        out = cv2.resize(im, (round(w * k), round(h * k)), interpolation=cv2.INTER_AREA)
        cv2.imwrite(base + suffix + '.webp', out, [cv2.IMWRITE_WEBP_QUALITY, 78])
    print('ok', os.path.basename(src))
