from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import cv2
import numpy as np
import os
import uuid
import sqlite3
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://tp-comunicacion.vercel.app"
    ],  # o ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directorio para almacenar imágenes
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Conexión a la base de datos SQLite
DB_FILE = "images.db"
conn = sqlite3.connect(DB_FILE, check_same_thread=False)
cursor = conn.cursor()

# Crear tabla si no existe
cursor.execute('''
    CREATE TABLE IF NOT EXISTS images (
        image_id TEXT PRIMARY KEY,
        file_path TEXT,
        upload_time TEXT
    )
''')
conn.commit()

# Función para quantizar cada canal
def quantize_image(image, bits_per_channel):
    if bits_per_channel >= 8:
        return image
    levels = 2 ** bits_per_channel
    return (image // (256 // levels) * (255 // (levels - 1))).astype(np.uint8)

# Subir imagen
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    image_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{image_id}.jpg")
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Guardar en la base de datos
    upload_time = datetime.now().isoformat()
    cursor.execute("INSERT INTO images (image_id, file_path, upload_time) VALUES (?, ?, ?)", 
                   (image_id, file_path, upload_time))
    conn.commit()
    
    return {"image_id": image_id}

# Obtener lista de imágenes para el carrusel
@app.get("/images")
def get_images():
    cursor.execute("SELECT image_id FROM images ORDER BY upload_time DESC")
    images = cursor.fetchall()
    return {"images": [image[0] for image in images]}

# Obtener imagen original
@app.get("/image/{image_id}/original")
def get_original(image_id: str):
    cursor.execute("SELECT file_path FROM images WHERE image_id = ?", (image_id,))
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    file_path = result[0]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(file_path, media_type="image/jpeg")

# Obtener imagen digitalizada
@app.get("/image/{image_id}/digitized")
def get_digitized(image_id: str, resolution: str, bits_per_channel: int):
    cursor.execute("SELECT file_path FROM images WHERE image_id = ?", (image_id,))
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    file_path = result[0]
    
    # Cargar imagen
    image = cv2.imread(file_path)
    
    # Validar y parsear resolución
    try:
        width, height = map(int, resolution.split("x"))
        if width <= 0 or height <= 0:
            raise ValueError
    except ValueError:
        raise HTTPException(status_code=400, detail="Resolución inválida. Usa formato 'anchoxalto' (ej: '100x100')")
    
    # Validar bits_per_channel
    if bits_per_channel <= 0:
        raise HTTPException(status_code=400, detail="bits_per_channel debe ser positivo")
    
    # Muestreo (redimensionamiento)
    image_resized = cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)
    
    # Cuantización por canal
    b, g, r = cv2.split(image_resized)
    b_quantized = quantize_image(b, bits_per_channel)
    g_quantized = quantize_image(g, bits_per_channel)
    r_quantized = quantize_image(r, bits_per_channel)
    image_quantized = cv2.merge([b_quantized, g_quantized, r_quantized])
    
    # Guardar temporalmente
    temp_file = os.path.join(UPLOAD_DIR, f"{image_id}_digitized.jpg")
    cv2.imwrite(temp_file, image_quantized)
    return FileResponse(temp_file, media_type="image/jpeg")

# Obtener imagen comprimida
@app.get("/image/{image_id}/compressed")
def get_compressed(image_id: str, resolution: str, bits_per_channel: int, quality: int):
    cursor.execute("SELECT file_path FROM images WHERE image_id = ?", (image_id,))
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    file_path = result[0]
    
    # Cargar imagen
    image = cv2.imread(file_path)
    
    # Validar parámetros
    try:
        width, height = map(int, resolution.split("x"))
        if width <= 0 or height <= 0:
            raise ValueError
    except ValueError:
        raise HTTPException(status_code=400, detail="Resolución inválida. Usa formato 'anchoxalto' (ej: '100x100')")
    
    if bits_per_channel <= 0:
        raise HTTPException(status_code=400, detail="bits_per_channel debe ser positivo")
    if not 0 <= quality <= 100:
        raise HTTPException(status_code=400, detail="quality debe estar entre 0 y 100")
    
    # Muestreo
    image_resized = cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)
    
    # Cuantización
    b, g, r = cv2.split(image_resized)
    b_quantized = quantize_image(b, bits_per_channel)
    g_quantized = quantize_image(g, bits_per_channel)
    r_quantized = quantize_image(r, bits_per_channel)
    image_quantized = cv2.merge([b_quantized, g_quantized, r_quantized])
    
    # Guardar con compresión JPEG
    temp_file = os.path.join(UPLOAD_DIR, f"{image_id}_compressed.jpg")
    cv2.imwrite(temp_file, image_quantized, [cv2.IMWRITE_JPEG_QUALITY, quality])
    return FileResponse(temp_file, media_type="image/jpeg")

# Cerrar conexión a la base de datos al apagar la aplicación
@app.on_event("shutdown")
def shutdown_event():
    conn.close()
