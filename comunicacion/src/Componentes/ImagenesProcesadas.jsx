import React, { useState, useEffect } from 'react'
import Bar from './Bar'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import fondo from '../images/fondo.png';
import axios from 'axios'; // <-- AGREGAR ESTA LÍNEA

function ImagenesProcesadas() {
  const [images, setImages] = useState([]); // <-- MODIFICADO

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:8000/images'); // <-- MODIFICADO: Llama a tu API
        // Tu endpoint /images devuelve una lista de image_id.
        // Para mostrar las imágenes, necesitamos construir la URL a la imagen original.
        const fetchedImageUrls = response.data.images.map(imageId => ({
          img: `http://localhost:8000/image/${imageId}/original`, // <-- MODIFICADO: Construye la URL
          title: `Imagen ${imageId.substring(0, 8)}`, // Opcional: un título más amigable
        }));
        setImages(fetchedImageUrls); // <-- MODIFICADO
      } catch (error) {
        console.error("Error al obtener las imágenes:", error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', backgroundImage: `url(${fondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Bar en la parte superior */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        <Bar />
      </div>
      {/* Lista de imágenes ocupando toda la pantalla con margen lateral, sin scroll interno y margen arriba */}
      <div style={{ position: 'relative', zIndex: 2, width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', boxSizing: 'border-box', padding: '32px 4vw 0 4vw' }}>
        <ImageList
          sx={{
            width: '100%',
            height: 'auto',
            minHeight: '80vh',
            m: 0,
            p: 0,
            background: 'transparent',
            borderRadius: 0,
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)'
            },
            gridAutoRows: 'minmax(20vw, 1fr)',
            overflow: 'visible'
          }}
          cols={5}
          gap={16}
        >
          {images.map((item) => ( // <-- MODIFICADO: Itera sobre las imágenes del estado
            <ImageListItem key={item.img}>
              <img
                srcSet={`${item.img}?w=600&h=600&fit=crop&auto=format&dpr=2 2x`}
                src={`${item.img}?w=600&h=600&fit=crop&auto=format`}
                alt={item.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 12,
                  boxShadow: '0 4px 24px #0006'
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      </div>
    </div>
  )
}

export default ImagenesProcesadas