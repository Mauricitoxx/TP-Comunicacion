import { React, useState, useRef, useEffect } from 'react'
import Button from '@mui/material/Button';
import Bar from './Bar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import { green, blue, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import fondo from '../images/fondo.png';
import { styled } from '@mui/material/styles';

const Home = () => {
const [age, setAge] = useState('');
const [bitDepth, setBitDepth] = useState('');
const [selectedImage, setSelectedImage] = useState(null);
const [selectedImageUrl, setSelectedImageUrl] = useState(null);
const [imageId, setImageId] = useState(null);
const [processedImageUrl, setProcessedImageUrl] = useState(null);



const CargarImagen = async (event) => {
  const file = event.target.files[0];
  if (file) {
    setSelectedImage(file);
    setSelectedImageUrl(URL.createObjectURL(file));
    console.log('Imagen seleccionada:', file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("ID de imagen subida:", data.image_id);
      // guardalo en un estado para luego procesarla
      setImageId(data.image_id);
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  }
};

  const [checked, setChecked] = useState(true);

// Estados para el botón de procesar
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
const timer = useRef();

const buttonSx = {
  ...(success && {
    bgcolor: green[500],
    '&:hover': {
      bgcolor: green[700],
    },
  }),
};

useEffect(() => {
  return () => {
    clearTimeout(timer.current);
  };
}, []);

const handleProcessClick = async () => {
  if (!imageId || !bitDepth || !age) {
    alert("Faltan datos: asegúrate de haber subido la imagen y elegido resolución y profundidad.");
    return;
  }

  setSuccess(false);
  setLoading(true);

  const resolutionMap = {
    10: "800x600",
    20: "1024x800",
    30: "1280x720",
    40: "1360x760",
    50: "1366x768",
  };

  const resolution = resolutionMap[age];
  const bits = Number(bitDepth);
  const endpoint = checked
    ? `http://localhost:8000/image/${imageId}/compressed?resolution=${resolution}&bits_per_channel=${bits}&quality=70`
    : `http://localhost:8000/image/${imageId}/digitized?resolution=${resolution}&bits_per_channel=${bits}`;

  console.log("Procesando imagen con ID:", imageId);
  console.log("Usando resolución:", resolution);
  console.log("Usando bits por canal:", bitDepth);
  console.log("Endpoint:", endpoint);

  
    try {
    const response = await fetch(endpoint);
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    setProcessedImageUrl(imageUrl);
    setSuccess(true);
  } catch (error) {
    console.error("Error al procesar imagen:", error);
  } finally {
    setLoading(false);
  }
};


  const clickCompresion = (event) => {
    setChecked(event.target.checked);
  };

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  const handleBitDepthChange = (event) => {
    setBitDepth(event.target.value);
  };

// Glassmorphism para botones principales
const GlassButton = styled(Button)(({ theme }) => ({
  borderRadius: 8, // Esquinas más suaves
  background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)', // Azul fuerte
  color: '#fff', // Contraste alto
  fontWeight: 800,
  fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif',
  boxShadow: '0 4px 18px 0 rgba(25, 118, 210, 0.18)', // Sombra sutil azul
  backdropFilter: 'blur(6px)',
  border: 'none',
  transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
  padding: '20px 54px', // Más grande
  fontSize: '1.25rem',
  margin: '0 0 48px 0',
  letterSpacing: '0.04em',
  minHeight: '60px', // Más alto
  minWidth: '240px', // Más ancho
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  '&:hover': {
    background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
    boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.28)',
    transform: 'scale(1.055)',
  },
}));

// Glassmorphism container para el contenido principal
const GlassContainer = styled('div')(({ theme }) => ({
  background: 'rgba(255,255,255,0.75)',
  boxShadow: '0 12px 40px 0 rgba(31,38,135,0.22)',
  borderRadius: '40px',
  backdropFilter: 'blur(24px)',
  border: '2.5px solid rgba(255,255,255,0.38)',
  padding: '56px 48px',
  margin: '40px 0',
  maxWidth: 'calc(100vw - 10rem)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Glassmorphism para selects y form controls
const GlassFormControl = styled(FormControl)(({ theme }) => ({
  borderRadius: 22,
  background: 'rgba(60,60,70,0.32)',
  color: '#fff',
  fontWeight: 700,
  fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif',
  boxShadow: '0 8px 32px 0 rgba(60,60,70,0.22), 0 1.5px 8px 0 rgba(0,0,0,0.10)', // Sombra flotante
  backdropFilter: 'blur(10px)',
  border: '2.5px solid rgba(255,255,255,0.18)',
  transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
  padding: '0',
  margin: '0',
  fontSize: '1.2rem',
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.22)',
    borderRadius: 18,
    color: '#111',
    fontSize: '1.2rem',
    fontWeight: 700,
    boxShadow: '0 6px 24px 0 rgba(60,60,70,0.28), 0 1.5px 8px 0 rgba(0,0,0,0.10)', // Sombra flotante
    transition: 'box-shadow 0.22s cubic-bezier(.4,2,.6,1), transform 0.22s cubic-bezier(.4,2,.6,1)',
    '&:hover': {
      boxShadow: '0 12px 36px 0 rgba(60,60,70,0.32), 0 3px 12px 0 rgba(0,0,0,0.12)', // Más flotante al hover
      transform: 'translateY(-2px) scale(1.03)',
      background: 'rgba(255,255,255,0.28)',
    },
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.38)',
      borderWidth: 2,
      boxShadow: '0 2px 8px 0 rgba(60,60,70,0.10)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(120,120,140,0.38)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(120,120,140,0.48)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#111',
    fontWeight: 700,
    fontSize: '1.15rem',
    background: 'rgba(255,255,255,0.0)',
    padding: '0 6px',
    letterSpacing: '0.03em',
    textShadow: '0 2px 8px rgba(60,60,70,0.10)',
  },
  '& .MuiSelect-select': {
    color: '#111',
    background: 'rgba(255,255,255,0.22)',
    borderRadius: 16,
    fontWeight: 700,
    fontSize: '1.2rem',
    padding: '14px 18px',
    boxShadow: '0 4px 16px 0 rgba(60,60,70,0.18)', // Sombra interna para el select
    transition: 'box-shadow 0.22s cubic-bezier(.4,2,.6,1), transform 0.22s cubic-bezier(.4,2,.6,1)',
    '&:hover': {
      boxShadow: '0 8px 32px 0 rgba(60,60,70,0.22)',
      background: 'rgba(255,255,255,0.28)',
      transform: 'translateY(-1.5px) scale(1.02)',
    },
  },
}));

// Switch personalizado para compresión
const CompressionSwitch = styled(Switch)(({ theme }) => ({
  width: 56,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& + .MuiSwitch-track': {
        background: blue[500],
        opacity: 1,
        border: 0,
      },
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.5,
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.18)',
    transition: 'background 0.3s',
  },
  '& .MuiSwitch-track': {
    borderRadius: 20,
    background: grey[400],
    opacity: 1,
    transition: 'background 0.3s',
  },
}));

// Botón de guardar imagen procesada
const SaveButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)',
  color: '#fff',
  fontWeight: 800,
  fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif',
  boxShadow: '0 4px 18px 0 rgba(67, 160, 71, 0.18)',
  backdropFilter: 'blur(6px)',
  border: 'none',
  transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
  padding: '20px 40px',
  fontSize: '1.15rem',
  margin: '0 0 0 24px',
  letterSpacing: '0.04em',
  minHeight: '60px',
  minWidth: '200px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  '&:hover': {
    background: 'linear-gradient(90deg, #388e3c 0%, #43a047 100%)',
    boxShadow: '0 8px 32px 0 rgba(67, 160, 71, 0.28)',
    transform: 'scale(1.055)',
  },
}));

// Función para guardar la imagen procesada
const handleSaveImage = () => {
  if (processedImageUrl) {
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = 'imagen_procesada.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

return (
    <div style={{
      minHeight: '100vh',
      width: '99vw',
      backgroundImage: `url(${fondo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#111'
    }}>
      <div className="entorno" style={{
        fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif",
        width: '100%',
        maxWidth: '1500px',
        margin: '0 auto',
        padding: '0 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#111'
      }}>
        <div style={{ width: '100vw', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Bar/>
        </div>
        <div style={{ height: '64px' }} />
        <GlassContainer>
          <div className="titulo" style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <h1 className="texttitle" style={{
              fontSize: '3.2rem',
              textAlign: 'center',
              color: '#111',
              fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif",
              width: '100%',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textShadow: '0 4px 24px rgba(60,60,70,0.18)'
            }}>
              Digitalizador de imagenes
            </h1>
          </div>
          <Stack direction="row" spacing={8} style={{
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            top: '24px',
            marginBottom: '56px',
            width: '100%',
            display: 'flex',
            color: '#111'
          }}>
            <input
              accept="image/*"
              style={{ display: 'none', }}
              id="upload-image"
              type="file"
              onChange={CargarImagen}
            />
            <label htmlFor="upload-image" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <GlassButton
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon style={{ fontSize: 28 }} />}
                style={{
                  left: '-20px',
                  minWidth: 240,
                  minHeight: 60,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  borderRadius: 8,
                  boxShadow: '0 4px 18px 0 rgba(25, 118, 210, 0.18)',
                  letterSpacing: '0.04em'
                }}
              >
                CARGAR IMAGEN
              </GlassButton>
            </label>
          </Stack>
          {/* Controles principales */}
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '40px',
              marginLeft: '1.5vh',
              gap: '64px',
              fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif",
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <div style={{
              display: 'flex',
              gap: '100px',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              flexWrap: 'wrap',
              marginBottom: '48px',
              marginTop: '32px',
            }}>
              {/* Resolución */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '240px',
                fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif",
                justifyContent: 'center',
                color: '#111'
              }}>
                <h3 style={{
                  margin: 0,
                  textAlign: 'center',
                  width: '100%',
                  color: '#111',
                  fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif",
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.45rem',
                  letterSpacing: '0.03em',
                  textShadow: '0 2px 8px rgba(60,60,70,0.10)'
                }}>
                  Resolucion
                </h3>
                <GlassFormControl
                  style={{ width: '240px', marginTop: '16px', color: 'white', alignSelf: 'center' }}
                >
                  <InputLabel style={{ color: '#111', fontWeight: 700, fontSize: '1.1rem' }} id="demo-simple-select-label">Largo x Altura</InputLabel>
                  <Select
                    style={{ width: '240px', alignSelf: 'center', fontWeight: 700, fontSize: '1.15rem' }}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="Largo x Altura"
                    onChange={handleChange}
                  >
                    <MenuItem value={10} style={{ fontWeight: 700, fontSize: '1.1rem' }}>800x600</MenuItem>
                    <MenuItem value={20} style={{ fontWeight: 700, fontSize: '1.1rem' }}>1024x800</MenuItem>
                    <MenuItem value={30} style={{ fontWeight: 700, fontSize: '1.1rem' }}>1280x720</MenuItem>
                    <MenuItem value={40} style={{ fontWeight: 700, fontSize: '1.1rem' }}>1360x760</MenuItem>
                    <MenuItem value={50} style={{ fontWeight: 700, fontSize: '1.1rem' }}>1366x768</MenuItem>
                  </Select>
                </GlassFormControl>
              </div>
              {/* Profundidad de bit */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '240px',
                fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif",
                justifyContent: 'center',
                color: '#111'
              }}>
                <h3 style={{
                  margin: 0,
                  textAlign: 'center',
                  width: '100%',
                  color: '#111',
                  fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif",
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.45rem',
                  letterSpacing: '0.03em',
                  textShadow: '0 2px 8px rgba(60,60,70,0.10)'
                }}>
                  Profundidad de bit
                </h3>
                <GlassFormControl
                  variant="outlined"
                  style={{ width: '240px', marginTop: '16px', alignSelf: 'center' }}
                >
                  <InputLabel
                    style={{
                      color: '#111',
                      zIndex: '11',
                      background: 'rgba(0, 0, 0, 0)',
                      padding: '0 6px',
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}
                    id="bit-depth-select-label"
                    variant="outlined"
                  >
                    Bits
                  </InputLabel>
                  <Select
                    labelId="bit-depth-select-label"
                    id="bit-depth-select"
                    value={bitDepth}
                    label="Bits"
                    onChange={handleBitDepthChange}
                    style={{ width: '240px', alignSelf: 'center', fontWeight: 700, fontSize: '1.15rem' }}
                  >
                    <MenuItem value={1} style={{ fontWeight: 700, fontSize: '1.1rem' }}>1 bit</MenuItem>
                    <MenuItem value={8} style={{ fontWeight: 700, fontSize: '1.1rem' }}>8 bits</MenuItem>
                    <MenuItem value={16} style={{ fontWeight: 700, fontSize: '1.1rem' }}>16 bits</MenuItem>
                    <MenuItem value={24} style={{ fontWeight: 700, fontSize: '1.1rem' }}>24 bits</MenuItem>
                    <MenuItem value={32} style={{ fontWeight: 700, fontSize: '1.1rem' }}>32 bits</MenuItem>
                  </Select>
                </GlassFormControl>
              </div>
            </div>
            {/* Galería de imágenes: original y resultado */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                maxWidth: '1400px',
                margin: '40px auto 0 auto',
                minHeight: '380px',
                justifyContent: 'center',
                alignItems: 'stretch',
                background: 'rgba(250, 250, 250, 0)',
                gap: '36px',
                padding: '24px',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif"
              }}
            >
              {/* Imagen original */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '5px solid rgb(255, 255, 255)',
                  borderRadius: '22px',
                  boxShadow: '0 4px 24px rgb(255, 255, 255)',
                  background: 'rgba(7, 4, 4, 0.45)',
                  margin: '0 6px',
                  minWidth: 0,
                  padding: '18px 12px',
                  backdropFilter: 'blur(14px)',
                  minHeight: '380px',
                  maxWidth: '100%',
                }}
              >
                <div style={{
                  fontWeight: 800,
                  marginBottom: '14px',
                  fontSize: '1.35em',
                  color: '#111',
                  letterSpacing: '0.03em'
                }}>Original</div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  {selectedImageUrl ? (
                    <img
                      src={selectedImageUrl}
                      alt="Original"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '260px',
                        objectFit: 'contain',
                        display: 'block',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <span style={{ color: '#111' }}>Imagen original</span>
                  )}
                </div>
              </div>
              {/* Imagen procesada */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '5px solid rgb(255, 255, 255)',
                  borderRadius: '22px',
                  boxShadow: '0 4px 24px rgb(255, 255, 255)',
                  background: 'rgba(7, 4, 4, 0.45)',
                  margin: '0 6px',
                  minWidth: 0,
                  padding: '18px 12px',
                  backdropFilter: 'blur(14px)',
                  minHeight: '380px',
                  maxWidth: '100%',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontWeight: 800,
                  marginBottom: '14px',
                  fontSize: '1.35em',
                  color: '#111',
                  letterSpacing: '0.03em'
                }}>Procesada</div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  minHeight: '320px'
                }}>
                  {loading ? (
                    <CircularProgress size={48} sx={{ color: green[500] }} />
                  ) : (
                    processedImageUrl ? (
                      <img
                        src={processedImageUrl}
                        alt="Processed"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '260px',
                          objectFit: 'contain',
                          display: 'block',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#111' }}>Imagen procesada</span>
                    ))
                  }
                </div>
              </div>
            </div>
            {/* Opciones debajo de las imágenes */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              marginTop: '1px',
              marginBottom: '24px'
            }}>
              {/* Compresión */}
              <div style={{
                display: 'flex',
                alignItems: 'left',
                gap: '16px',
                justifyContent: 'left',
                width: '100%',
              }}>
                <InputLabel id="compression-switch-label" style={{
                  color: '#111',
                  fontWeight: 800,
                  fontSize: '1.18rem',
                  margin: 0,
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  Aplicar Compresión
                </InputLabel>
                <CompressionSwitch
                  checked={checked}
                  onChange={clickCompresion}
                  inputProps={{ 'aria-label': 'Aplicar Compresión', id: 'compression-switch' }}
                />
              </div>
              {/* Botones de procesar y guardar */}
              <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'right', marginTop: '0', width: '100%' }}>
                <Box sx={{ m: 1,top: '-100px',left:'350px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <GlassButton
                    variant="contained"
                    sx={buttonSx}
                    disabled={loading}
                    onClick={handleProcessClick}
                    startIcon={<PlayArrowIcon style={{ fontSize: 28 }} />}
                    style={{
                      minWidth: 240,
                      minHeight: 60,
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      borderRadius: 8,
                      boxShadow: '0 4px 18px 0 rgba(25, 118, 210, 0.18)',
                      letterSpacing: '0.04em'
                    }}
                  >
                    PROCESAR IMAGEN
                  </GlassButton>
                  {loading && (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: green[500],
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                  )}
                </Box>
                <SaveButton
                  variant="contained"
                  startIcon={<DownloadIcon style={{ fontSize: 26 }} />}
                  onClick={handleSaveImage}
                  disabled={!processedImageUrl}
                >
                  GUARDAR IMAGEN
                </SaveButton>
              </div>
            </div>
          </Box>
        </GlassContainer>
      </div>
    </div>
  );
}

export default Home
