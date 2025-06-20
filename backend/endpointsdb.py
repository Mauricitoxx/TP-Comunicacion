from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv # Para cargar variables de entorno en desarrollo local
import io # Para manejar streams de bytes

# Importaciones para Cloudinary
import cloudinary
import cloudinary.uploader

# Importaciones para procesamiento de imagen (OpenCV)
import cv2
import numpy as np
import requests # Para descargar imágenes desde URLs

# Cargar variables de entorno desde un archivo .env (solo para desarrollo local)
# En Render, DEBES configurar estas variables directamente en las variables de entorno de tu servicio.
load_dotenv()

app = FastAPI()

# Configuración de CORS para permitir peticiones desde tu frontend
# Asegúrate de que los orígenes aquí sean correctos para tu frontend desplegado.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://tp-comunicacion.vercel.app",
        # Puedes añadir más orígenes si tu frontend está desplegado en otros lugares
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras en las solicitudes
)

# --- Configuración de la Base de Datos PostgreSQL ---
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada. ¡Es crucial para la conexión a la base de datos!")
if "postgresql" not in DATABASE_URL:
    raise ValueError("DATABASE_URL debe ser una cadena de conexión PostgreSQL válida.")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Definición del modelo de tabla para las imágenes
class Image(Base):
    __tablename__ = "images" 
    image_id = Column(String, primary_key=True, index=True)
    image_url = Column(String, nullable=False) # URL de la imagen en Cloudinary
    upload_time = Column(DateTime, default=datetime.utcnow)

# --- Configuración de Cloudinary ---
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    raise ValueError("Variables de entorno de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) no configuradas.")

# --- Eventos de inicio y apagado de la aplicación ---
@app.on_event("startup")
def startup_event():
    """
    Función de arranque de la aplicación FastAPI.
    - Inicializa Cloudinary.
    - Crea las tablas de la base de datos PostgreSQL si no existen.
    """
    print("Iniciando aplicación FastAPI...")
    
    # Inicializar Cloudinary
    try:
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True # Usar HTTPS
        )
        print("Cloudinary configurado exitosamente.")
    except Exception as e:
        print(f"Error al configurar Cloudinary: {e}")
        raise

    # Crear tablas de la base de datos PostgreSQL
    print("Intentando crear tablas de la base de datos PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("Tablas de la base de datos PostgreSQL creadas o ya existen.")

# Dependencia para obtener una sesión de base de datos en cada request
def get_db():
    """
    Generador que proporciona una sesión de base de datos para cada solicitud HTTP.
    Asegura que la sesión se cierre correctamente después de la solicitud.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Funciones de procesamiento de imagen ---

def quantize_image(image, bits_per_channel):
    """
    Cuantiza cada canal de una imagen.
    Reduce el número de bits por canal, lo que reduce la cantidad de colores.
    """
    if bits_per_channel >= 8: # Si ya es 8 bits o más, no hace falta cuantizar
        return image
    
    # Calcular el número de niveles para la cuantización
    levels = 2 ** bits_per_channel
    
    # Calcular el factor de escala para reducir los valores de píxel
    # y luego escalarlos de nuevo al rango 0-255 con los nuevos niveles.
    # Ejemplo: para 1 bit, levels=2. (256 // 2) = 128. (255 // (2-1)) = 255.
    # Los píxeles se agrupan en 0 o 128 (si es blanco y negro)
    return (image // (256 // levels) * (255 // (levels - 1))).astype(np.uint8)


async def download_image_from_url(image_url: str):
    """Descarga una imagen de una URL y devuelve sus bytes."""
    try:
        response = requests.get(image_url, stream=True)
        response.raise_for_status() # Lanza una excepción para códigos de estado de error HTTP
        image_bytes = response.content
        return image_bytes
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error al descargar la imagen de Cloudinary: {e}")

async def process_image(image_id: str, resolution: str, bits_per_channel: int, quality: int = None):
    """
    Función central para el procesamiento de imágenes (digitalización/compresión).
    Descarga la imagen, la procesa con OpenCV y devuelve los bytes resultantes.
    """
    db = SessionLocal()
    try:
        image_data = db.query(Image).filter(Image.image_id == image_id).first()
        if not image_data:
            raise HTTPException(status_code=404, detail="Imagen no encontrada en la base de datos.")
        
        image_url = image_data.image_url

        # 1. Descargar la imagen original de Cloudinary
        image_bytes = await download_image_from_url(image_url)

        # 2. Convertir bytes a un array de numpy para OpenCV
        np_array = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=500, detail="No se pudo decodificar la imagen descargada.")

        # 3. Validar y parsear resolución
        try:
            width, height = map(int, resolution.split("x"))
            if width <= 0 or height <= 0:
                raise ValueError
        except ValueError:
            raise HTTPException(status_code=400, detail="Resolución inválida. Usa formato 'anchoxalto' (ej: '100x100')")

        # 4. Validar bits_per_channel
        if bits_per_channel <= 0 or bits_per_channel > 8: # OpenCV normalmente trabaja con 8 bits por canal para la mayoría de ops
            raise HTTPException(status_code=400, detail="bits_per_channel debe estar entre 1 y 8 para cuantificación con este método.")
        
        # 5. Muestreo (redimensionamiento)
        image_resized = cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)

        # 6. Cuantización por canal
        # Dividir los canales B, G, R
        b, g, r = cv2.split(image_resized)
        b_quantized = quantize_image(b, bits_per_channel)
        g_quantized = quantize_image(g, bits_per_channel)
        r_quantized = quantize_image(r, bits_per_channel)
        
        # Unir los canales cuantizados de nuevo
        image_processed = cv2.merge([b_quantized, g_quantized, r_quantized])

        # 7. Codificar la imagen procesada a bytes (JPEG)
        # La calidad solo aplica si es compresión (quality is not None)
        encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality] if quality is not None else []
        success, encoded_image = cv2.imencode(".jpg", image_processed, encode_params)

        if not success:
            raise HTTPException(status_code=500, detail="Error al codificar la imagen procesada.")

        return io.BytesIO(encoded_image.tobytes()) # Devuelve un stream de bytes

    finally:
        db.close()


# --- Endpoints de la API ---

@app.post("/upload", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    """
    Recibe un archivo de imagen, lo sube a Cloudinary,
    y guarda su URL en la base de datos PostgreSQL.
    """
    image_id = str(uuid.uuid4())
    
    try:
        # Cloudinary necesita un archivo o bytes. file.file es un objeto BytesIO.
        # Puedes añadir un folder para organizar tus imágenes en Cloudinary
        upload_result = cloudinary.uploader.upload(file.file, folder="app_images") 
        
        image_url = upload_result.get("secure_url") # Obtiene la URL HTTPS segura

        if not image_url:
            raise HTTPException(status_code=500, detail="No se pudo obtener la URL de la imagen de Cloudinary.")
        
        print(f"Imagen subida a Cloudinary: {image_url}")

        # Guardar la URL en la base de datos PostgreSQL
        db = SessionLocal()
        try:
            new_image = Image(image_id=image_id, image_url=image_url)
            db.add(new_image)
            db.commit()
            db.refresh(new_image)
            print(f"URL de imagen guardada en PostgreSQL: {image_id}")
            return JSONResponse(content={"image_id": image_id, "image_url": image_url}, status_code=201)
        except Exception as db_error:
            db.rollback()
            # Si falla guardar en DB, considera eliminar de Cloudinary para evitar huérfanos
            # Esto es más complejo en Cloudinary, podrías necesitar el public_id de upload_result
            # cloudinary.uploader.destroy(upload_result.get("public_id"))
            print(f"Error al guardar URL en la base de datos: {db_error}. Considera implementar rollback en Cloudinary.")
            raise HTTPException(status_code=500, detail=f"Error al guardar URL en la base de datos: {db_error}")
        finally:
            db.close()

    except Exception as e:
        print(f"Error al subir imagen a Cloudinary: {e}")
        raise HTTPException(status_code=500, detail=f"Error al subir la imagen: {str(e)}")

@app.get("/images", response_model=dict)
def get_images():
    """
    Devuelve una lista de todas las imágenes (sus IDs y URLs) almacenadas en la base de datos.
    """
    db = SessionLocal()
    try:
        images = db.query(Image).order_by(Image.upload_time.desc()).all()
        return {"images": [
            {"image_id": img.image_id, "image_url": img.image_url, "upload_time": img.upload_time.isoformat()}
            for img in images
        ]}
    finally:
        db.close()

@app.get("/image/{image_id}/original")
def get_original_image(image_id: str):
    """
    Obtiene la URL de la imagen original desde la base de datos usando su ID único
    y devuelve una redirección a esa URL de Cloudinary.
    """
    db = SessionLocal()
    try:
        image = db.query(Image).filter(Image.image_id == image_id).first()
        if not image:
            raise HTTPException(status_code=404, detail="Imagen no encontrada en la base de datos.")
        
        # Redirige al cliente a la URL de la imagen en Cloudinary
        return RedirectResponse(url=image.image_url, status_code=302)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener la imagen original: {str(e)}")
    finally:
        db.close()

@app.get("/image/{image_id}/digitized")
async def get_digitized(image_id: str, resolution: str, bits_per_channel: int):
    """
    Endpoint para obtener una imagen digitalizada.
    Descarga la imagen original de Cloudinary, aplica muestreo y cuantificación con OpenCV,
    y devuelve la imagen procesada como una respuesta de archivo.
    """
    try:
        processed_image_stream = await process_image(image_id, resolution, bits_per_channel)
        return FileResponse(processed_image_stream, media_type="image/jpeg")
    except HTTPException as e: # Corregido: eliminado 'a' extra
        raise e # Relanza HTTPExceptions generadas por process_image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el procesamiento de digitalización: {str(e)}")


@app.get("/image/{image_id}/compressed")
async def get_compressed(image_id: str, resolution: str, bits_per_channel: int, quality: int):
    """
    Endpoint para obtener una imagen comprimida.
    Descarga la imagen original de Cloudinary, aplica muestreo, cuantificación y compresión JPEG con OpenCV,
    y devuelve la imagen procesada como una respuesta de archivo.
    """
    if not 0 <= quality <= 100:
        raise HTTPException(status_code=400, detail="quality debe estar entre 0 y 100")
        
    try:
        processed_image_stream = await process_image(image_id, resolution, bits_per_channel, quality)
        return FileResponse(processed_image_stream, media_type="image/jpeg")
    except HTTPException as e:
        raise e # Relanza HTTPExceptions generadas por process_image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el procesamiento de compresión: {str(e)}")
