import React from 'react'
import Bar from './Bar'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import fondo from '../images/fondo.png';

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Bike',
  },
]

function ImagenesProcesadas() {
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
          {itemData.map((item) => (
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