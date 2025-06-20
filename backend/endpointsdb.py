from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv # Para cargar variables de entorno en desarrollo local

# Importaciones para Cloudinary
import cloudinary
import cloudinary.uploader

# Importaciones para procesamiento de imagen (OpenCV)
# NOTA: cv2 y numpy solo se necesitan si planeas implementar la lógica real
# de procesamiento de imagen en el backend. Si solo quieres persistencia,
# estas y las funciones asociadas pueden eliminarse para un backend más ligero.
import cv2
import numpy as np

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

# --- Funciones de procesamiento de imagen (para referencia, no implementadas completamente) ---
# Estas funciones requieren que cv2 y numpy estén instalados y configurados correctamente.
# La lógica de procesamiento real debería descargar la imagen de Cloudinary, procesarla,
# y luego subirla de nuevo a Cloudinary (o servirla directamente).
def quantize_image(image, bits_per_channel):
    """Función de cuantificación de imagen. Requiere OpenCV."""
    if bits_per_channel >= 8:
        return image
    levels = 2 ** bits_per_channel
    return (image // (256 // levels) * (255 // (levels - 1))).astype(np.uint8)

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
def get_digitized(image_id: str, resolution: str, bits_per_channel: int):
    """
    Endpoint para obtener una imagen digitalizada.
    NOTA: La lógica de procesamiento de imágenes con OpenCV NO está implementada aquí.
    Esto requeriría:
    1. Descargar la imagen original de Cloudinary usando la image_url.
    2. Cargarla con cv2.imdecode (desde bytes).
    3. Aplicar el muestreo y la cuantificación.
    4. Subir la imagen procesada de nuevo a Cloudinary (quizás con una transformación o nuevo nombre).
    5. Devolver una redirección a la nueva URL de Cloudinary.
    """
    raise HTTPException(
        status_code=501, 
        detail="Funcionalidad de digitalización no implementada. Requiere descarga, procesamiento (OpenCV) y re-almacenamiento/servido de la imagen."
    )

@app.get("/image/{image_id}/compressed")
def get_compressed(image_id: str, resolution: str, bits_per_channel: int, quality: int):
    """
    Endpoint para obtener una imagen comprimida.
    NOTA: La lógica de procesamiento de imágenes con OpenCV NO está implementada aquí.
    Ver las notas en get_digitized para la complejidad de esta implementación.
    Cloudinary ofrece transformaciones al vuelo que podrían manejar esto más fácilmente.
    """
    raise HTTPException(
        status_code=501, 
        detail="Funcionalidad de compresión no implementada. Requiere descarga, procesamiento (OpenCV) y re-almacenamiento/servido de la imagen."
    )


