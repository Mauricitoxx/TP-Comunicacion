from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv # Para cargar variables de entorno en desarrollo local

# Cargar variables de entorno desde un archivo .env (solo para desarrollo local)
# En Render, DEBES configurar la DATABASE_URL directamente en las variables de entorno de tu servicio.
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
        # Para desarrollo, puedes usar "*", pero no es recomendable para producción.
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras en las solicitudes
)

# Configuración de la base de datos PostgreSQL
# La variable de entorno DATABASE_URL debe ser configurada en Render para tu servicio web.
# Para desarrollo local, se carga desde el archivo .env.
# Ya que has confirmado que la variable de entorno está configurada en Render,
# eliminamos el valor predeterminado aquí para forzar su uso desde el entorno.
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada. ¡Es crucial para la conexión a la base de datos!")
if "postgresql" not in DATABASE_URL:
    raise ValueError("DATABASE_URL debe ser una cadena de conexión PostgreSQL válida. Formato esperado: postgresql://user:password@host:port/database_name")

# Crear el motor de la base de datos
# pool_pre_ping=True ayuda a asegurar que las conexiones se mantengan activas y reestablecerlas si se pierden.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Crear una sesión de base de datos
# autocommit=False: No hace commit automáticamente después de cada operación. Debes hacerlo explícitamente.
# autoflush=False: No vacía la caché de la sesión automáticamente en la DB.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para definir modelos de SQLAlchemy
Base = declarative_base()

# Definición del modelo de tabla para las imágenes
class Image(Base):
    __tablename__ = "images" # Nombre de la tabla en la base de datos PostgreSQL

    image_id = Column(String, primary_key=True, index=True) # ID único de la imagen, clave primaria
    image_url = Column(String, nullable=False) # URL de la imagen en tu almacenamiento en la nube (no puede ser nula)
    upload_time = Column(DateTime, default=datetime.utcnow) # Marca de tiempo de subida, se guarda en UTC

# Función que se ejecuta al inicio de la aplicación FastAPI.
# Se asegura de que todas las tablas definidas en los modelos SQLAlchemy existan en la base de datos.
@app.on_event("startup")
def startup_event():
    """
    Función de arranque que crea las tablas de la base de datos si no existen.
    Esto es útil para la inicialización automática de la base de datos en el despliegue.
    """
    print("Intentando crear tablas de la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("Tablas de la base de datos creadas o ya existen.")

# Dependencia para obtener una sesión de base de datos en cada request
# Esto asegura que cada solicitud tenga su propia sesión de DB y que se cierre correctamente.
def get_db():
    """
    Generador que proporciona una sesión de base de datos para cada solicitud HTTP.
    Maneja la apertura y el cierre de la sesión de la base de datos de manera segura.
    """
    db = SessionLocal()
    try:
        yield db # Cede el control al endpoint, que usará esta sesión
    finally:
        db.close() # Asegura que la sesión se cierre al finalizar la solicitud

# Nuevo endpoint para "subir" la URL de una imagen
# Este endpoint NO sube la imagen en sí. Asume que la imagen ya fue subida a un servicio de cloud storage
# (como Firebase Storage o AWS S3) por el frontend o un proceso externo, y que se le proporciona la URL resultante.
@app.post("/upload_image_url", response_model=dict) # response_model para documentar la respuesta esperada
async def upload_image_url(image_url: str = Body(..., embed=True)):
    """
    Recibe la URL de una imagen ya alojada en un servicio de almacenamiento en la nube.
    Guarda esta URL junto con un ID único en la base de datos PostgreSQL.
    """
    db = SessionLocal() # Obtiene una nueva sesión de base de datos
    try:
        # Generar un ID único para esta entrada de imagen en la base de datos
        new_image_id = str(uuid.uuid4())
        
        # Crear una nueva instancia del modelo Image con los datos recibidos
        new_image = Image(image_id=new_image_id, image_url=image_url)
        db.add(new_image) # Añade el nuevo objeto a la sesión de SQLAlchemy
        db.commit() # Confirma la transacción, guardando el objeto en la base de datos
        db.refresh(new_image) # Refresca el objeto para obtener cualquier valor generado por la DB (ej., upload_time)
        
        # Devuelve el ID de la imagen y su URL en formato JSON con un código de estado 201 (Created)
        return JSONResponse(content={"image_id": new_image.image_id, "image_url": new_image.image_url}, status_code=201)
    except Exception as e:
        db.rollback() # Si ocurre un error, revierte cualquier cambio pendiente en la transacción
        raise HTTPException(status_code=500, detail=f"Error al subir la URL de la imagen: {str(e)}")
    finally:
        db.close() # Asegura que la sesión de la base de datos se cierre en cualquier caso

# Endpoint para obtener la lista de URLs de imágenes
@app.get("/images", response_model=dict)
def get_images():
    """
    Devuelve una lista de todas las imágenes (sus IDs y URLs) almacenadas en la base de datos.
    Las imágenes se ordenan por su tiempo de subida, mostrando las más recientes primero.
    """
    db = SessionLocal()
    try:
        # Consulta todas las imágenes y las ordena por upload_time en orden descendente (más recientes primero)
        images = db.query(Image).order_by(Image.upload_time.desc()).all()
        # Formatea la lista de objetos Image a un formato JSON compatible para la respuesta
        return {"images": [
            {"image_id": img.image_id, "image_url": img.image_url, "upload_time": img.upload_time.isoformat()}
            for img in images
        ]}
    finally:
        db.close()

# Endpoint para obtener la URL original de una imagen por su ID
@app.get("/image/{image_id}/original", response_model=dict)
def get_original_image_url(image_id: str):
    """
    Obtiene la URL de la imagen original desde la base de datos usando su ID único.
    """
    db = SessionLocal()
    try:
        # Busca la imagen por su image_id en la base de datos
        image = db.query(Image).filter(Image.image_id == image_id).first()
        if not image:
            raise HTTPException(status_code=404, detail="Imagen no encontrada")
        
        # Devuelve el ID de la imagen y su URL
        return {"image_id": image.image_id, "image_url": image.image_url}
    finally:
        db.close()

# NOTA IMPORTANTE sobre los endpoints /digitized y /compressed:
# Estos endpoints están aquí como marcadores de posición. La lógica real para procesar
# imágenes (digitalizar, comprimir con OpenCV) es compleja en un entorno de nube:
# 1. Tu backend necesitaría descargar la imagen original de la 'image_url' (Firebase Storage/S3).
# 2. Realizar el procesamiento de imagen con librerías como OpenCV.
# 3. Subir la imagen procesada de nuevo al cloud storage (quizás a una nueva ruta).
# 4. Devolver la nueva URL de la imagen procesada al frontend.
# Esto es una arquitectura más avanzada que el simple manejo de URLs en la base de datos.

@app.get("/image/{image_id}/digitized")
def get_digitized(image_id: str, resolution: str, bits_per_channel: int):
    """
    Endpoint para obtener una imagen digitalizada.
    Actualmente, esto es solo un marcador de posición y requiere implementación
    de procesamiento de imágenes en la nube.
    """
    raise HTTPException(status_code=501, detail="Funcionalidad de imagen digitalizada no implementada. Requiere procesamiento de imagen externo (ej. con OpenCV) y re-almacenamiento en la nube.")

@app.get("/image/{image_id}/compressed")
def get_compressed(image_id: str, resolution: str, bits_per_channel: int, quality: int):
    """
    Endpoint para obtener una imagen comprimida.
    Actualmente, esto es solo un marcador de posición y requiere implementación
    de procesamiento de imágenes en la nube.
    """
    raise HTTPException(status_code=501, detail="Funcionalidad de imagen comprimida no implementada. Requiere procesamiento de imagen externo (ej. con OpenCV) y re-almacenamiento en la nube.")

# No es necesario un evento de shutdown específico para SQLAlchemy en un entorno serverless/PaaS
# como Render, ya que las conexiones se manejan por sesión y se cierran automáticamente.
