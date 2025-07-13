import React, { useState, useEffect } from 'react';
import Bar from './Bar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import fondo from '../images/fondo.png';
// import axios from 'axios'; // No es necesario si usas fetch
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; // Para indicar carga en el modal
import DownloadIcon from '@mui/icons-material/Download';

function ImagenesProcesadas() {
  const [images, setImages] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [versions, setVersions] = useState({ original: '', compressed: '', digitized: '' });
  const [loadingVersions, setLoadingVersions] = useState(false); // Nuevo estado para carga de versiones

  useEffect(() => {
    // Obtiene la lista de imágenes desde el endpoint que devuelve image_id y image_url
    const fetchAllImages = async () => {
      try {
        const res = await fetch('https://tp-comunicacion.onrender.com/images');
        const data = await res.json();
        if (Array.isArray(data.images)) {
          // image_id y image_url
          setImages(data.images.map(img => ({
            id: img.image_id,
            img: img.image_url, // Esta es la URL original de Cloudinary
            title: `Imagen ${img.image_id.substring(0, 8)}`
          })));
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error("Error al obtener la lista de imágenes:", error);
        setImages([]);
      }
    };
    fetchAllImages();
  }, []);

  // Al hacer click, busca las 3 versiones (ahora con parámetros y fetch)
  const handleOpen = async (item) => {
    setSelected(item);
    setOpen(true);
    setVersions({ original: item.img, compressed: '', digitized: '' }); // Muestra la original de inmediato
    setLoadingVersions(true); // Activa el estado de carga

    const id = item.id;
    // Parámetros predeterminados para la visualización en esta galería
    const defaultResolution = "1024x768"; // O la resolución que prefieras para la vista previa
    const defaultBitsPerChannel = 8;     // Profundidad de bits predeterminada
    const defaultQuality = 70;           // Calidad JPEG predeterminada para compresión

    try {
      // 1. Obtener la imagen comprimida
      const compressedEndpoint = `https://tp-comunicacion.onrender.com/image/${id}/compressed?resolution=${defaultResolution}&bits_per_channel=${defaultBitsPerChannel}&quality=${defaultQuality}`;
      console.log("Fetching compressed from:", compressedEndpoint);
      const compressedResponse = await fetch(compressedEndpoint);
      if (!compressedResponse.ok) {
        const errorText = await compressedResponse.text();
        console.error(`Error al obtener comprimida: ${compressedResponse.status} - ${errorText}`);
        setVersions(prev => ({ ...prev, compressed: 'error' })); // Indicar error
      } else {
        const compressedBlob = await compressedResponse.blob();
        setVersions(prev => ({ ...prev, compressed: URL.createObjectURL(compressedBlob) }));
      }

      // 2. Obtener la imagen digitalizada
      const digitizedEndpoint = `https://tp-comunicacion.onrender.com/image/${id}/digitized?resolution=${defaultResolution}&bits_per_channel=${defaultBitsPerChannel}`;
      console.log("Fetching digitized from:", digitizedEndpoint);
      const digitizedResponse = await fetch(digitizedEndpoint);
      if (!digitizedResponse.ok) {
        const errorText = await digitizedResponse.text();
        console.error(`Error al obtener digitalizada: ${digitizedResponse.status} - ${errorText}`);
        setVersions(prev => ({ ...prev, digitized: 'error' })); // Indicar error
      } else {
        const digitizedBlob = await digitizedResponse.blob();
        setVersions(prev => ({ ...prev, digitized: URL.createObjectURL(digitizedBlob) }));
      }

    } catch (error) {
      console.error("Error general al procesar versiones:", error);
      setVersions(prev => ({ ...prev, compressed: 'error', digitized: 'error' })); // Indicar error en ambas
    } finally {
      setLoadingVersions(false); // Desactiva el estado de carga
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    // Revocar las URLs de objeto para liberar memoria
    if (versions.compressed && versions.compressed !== 'error') URL.revokeObjectURL(versions.compressed);
    if (versions.digitized && versions.digitized !== 'error') URL.revokeObjectURL(versions.digitized);
    setVersions({ original: '', compressed: '', digitized: '' }); // Limpiar URLs
  };

  // Función para descargar una imagen por URL
  const handleDownload = (url, filename) => {
    if (!url || url === 'error') return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          {images.map((item) => (
            <ImageListItem key={item.id} onClick={() => handleOpen(item)} style={{ cursor: 'pointer' }}>
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
      {/* Modal de versiones */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Imagen</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
          <img src={versions.original} alt="original" style={{ maxWidth: '80vw', maxHeight: '60vh', borderRadius: '24px', boxShadow: '0 4px 32px #0006', objectFit: 'cover' }} />
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            style={{ marginTop: 18 }}
            onClick={() => handleDownload(versions.original, `original_${selected?.id || ''}.jpg`)}
            disabled={!versions.original || versions.original === 'error'}
          >
            Descargar
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ImagenesProcesadas;
