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
import { green } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import fondo from '../images/fondo.png';

const Home = () => {
const [age, setAge] = useState('');
const [bitDepth, setBitDepth] = useState('');
const [selectedImage, setSelectedImage] = useState(null);
const [selectedImageUrl, setSelectedImageUrl] = useState(null);

const CargarImagen = (event) => {
    const file = event.target.files[0];
    if (file) {
        setSelectedImage(file);
        setSelectedImageUrl(URL.createObjectURL(file));
        console.log('Imagen seleccionada:', file);
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

const handleProcessClick = () => {
  if (!loading) {
    setSuccess(false);
    setLoading(true);
    timer.current = setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 2000);
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

return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundImage: `url(${fondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="entorno">
        <Bar/>
        <div className="titulo">
          <h1 className="texttitle" style={{ textAlign: 'center', color: 'white' }}>Digitalizador de imagenes</h1>
        </div>
        <Stack direction="row" spacing={2} style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', top: '20px' }}>
          <input
            accept="image/*"
            style={{ display: 'none', }}
            id="upload-image"
            type="file"
            onChange={CargarImagen}
          />
          <label htmlFor="upload-image">
            <Button style={{marginBottom: '30px '}}variant="contained" component="span">
              CARGAR IMAGEN
            </Button>
          </label>
        </Stack>
        {/* Controles principales */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '16px',
            marginLeft: '1.5vh',
            gap: '8px'
          }}
        >
          <div style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            {/* Resolución */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '202px' }}>
              <h3 style={{margin: 0, textAlign: 'center', width: '100%', color:'white' }}>Resolucion</h3>
              <FormControl 
                style={{ width: '202px',marginTop: '10px', color: 'white', backdropFilter: 'blur(10px)' }}
                sx={{
                  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                }}
              >
                <InputLabel style={{color:'white'}}id="demo-simple-select-label">Largo x Altura</InputLabel>
                <Select style={{ width: '202px' }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={age}
                  label="Largo x Altura"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>800x600</MenuItem>
                  <MenuItem value={20}>1024x800</MenuItem>
                  <MenuItem value={30}>1280x720</MenuItem>
                  <MenuItem value={40}>1360x760</MenuItem>
                  <MenuItem value={50}>1366x768</MenuItem>       
                </Select>
              </FormControl>
            </div>
            {/* Compresión (ahora en el medio) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '202px', marginTop: '18px', backdropFilter: 'blur(10px)', background:'rgba(0, 0, 0, 0.2)', border: '2px solid white', padding: '16px', borderRadius: '20px' }}>
              <InputLabel id="demo-simple-select-label" style={{ marginBottom:'8px', color:'white'}}>Aplicar Compresión</InputLabel>
              <Switch
                checked={checked}
                onChange={clickCompresion}
                label="Compresión"
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </div>
            {/* Profundidad de bit */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '202px' }}>
              <h3 style={{margin: 0, textAlign: 'center', width: '100%', color:'white' }}>Profundidad de bit</h3>
              <FormControl 
                variant="outlined"
                style={{ width: '202px', marginTop: '10px', backdropFilter: 'blur(10px)'}}
                sx={{
                  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                }}
              >
                <InputLabel 
                  style={{color : 'white', zIndex:'11', background: 'rgba(0, 0, 0, 0)', padding: '0 4px'}} // background para mejor contraste
                  id="bit-depth-select-label"
                  variant="outlined" // <-- Agregado
                >
                  Bits
                </InputLabel>
                <Select
                  labelId="bit-depth-select-label"
                  id="bit-depth-select"
                  value={bitDepth}
                  label="Bits"
                  onChange={handleBitDepthChange}
                  style={{ width: '202px', color: 'white'}}
                >
                  <MenuItem value={1}>1 bit</MenuItem>
                  <MenuItem value={8}>8 bits</MenuItem>
                  <MenuItem value={16}>16 bits</MenuItem>
                  <MenuItem value={24}>24 bits</MenuItem>
                  <MenuItem value={32}>32 bits</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          {/* Botón de procesar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', width: '100%' }}>
            <Box sx={{ m: 1, position: 'relative' }}>
              <Button
                variant="contained"
                sx={buttonSx}
                disabled={loading}
                onClick={handleProcessClick}
                startIcon={success ? <CheckIcon /> : <SaveIcon />}
              >
                Procesar imagen
              </Button>
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
          </div>
        </Box>
        {/* Galería de imágenes: original y resultado */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            maxWidth: '1200px',
            margin: '32px auto 0 auto',
            minHeight: '320px',
            justifyContent: 'center',
            alignItems: 'stretch',
            background: 'rgba(250, 250, 250, 0)',
            gap: '24px',
            padding: '16px',
            boxSizing: 'border-box',
            transition: 'all 0.2s',
          }}
        >
          {/* Imagen original */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '4px solid rgb(255, 255, 255)',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgb(255, 255, 255)',
              background: 'rgba(7, 4, 4, 0.35)',
              margin: '0 4px',
              minWidth: 0,
              padding: '12px 8px',
              backdropFilter: 'blur(10px)',
              minHeight: '320px',
              maxWidth: '100%',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.1em', color: 'white' }}>Original</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
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
                <span style={{ color: '#fff' }}>Imagen original</span>
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
              border: '4px solid rgb(255, 255, 255)',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgb(255, 255, 255)',
              background: 'rgba(7, 4, 4, 0.35)',
              margin: '0 4px',
              minWidth: 0,
              padding: '12px 8px',
              backdropFilter: 'blur(10px)',
              minHeight: '320px',
              maxWidth: '100%',
              position: 'relative'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.1em', color: 'white' }}>Procesada</div>
            <div style={{ flex: 1,
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               width: '100%', 
               minHeight: '260px' }}>
              {loading ? (
                <CircularProgress size={48} sx={{ color: green[500] }} />
              ) : (
                <span style={{ color: '#fff' }}>Imagen procesada</span>
              )}
            </div>
          </div>
        </div>
        {/* Responsive: apilar imágenes en mobile */}
        <style>
          {`
            @media (max-width: 900px) {
              .entorno > div[style*="display: flex"][style*="background: #fafafa"] {
                flex-direction: column !important;
                gap: 16px !important;
              }
            }
            @media (max-width: 600px) {
              .entorno > div[style*="display: flex"][style*="background: #fafafa"] > div {
                min-height: 180px !important;
                padding: 8px 2px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
)
}
export default Home