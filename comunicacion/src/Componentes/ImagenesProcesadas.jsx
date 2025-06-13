import React from 'react'
import Bar from './Bar'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

const images = [
  'https://imgs.search.brave.com/VSi9gNCzOITSYtfbvXAN_kSHi8lPEPKGUyjl_t4flNQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3N0YXRpYy5jb20v/bWFya2V0aW5nLWNt/cy9hc3NldHMvaW1h/Z2VzLzZmLzliLzRh/NzMwNDU3NGI2MGIz/MTUwNjc3M2UwODMy/OGIvYWJvdXQtZ29v/Z2xlLXRodW1ibmFp/bC1hLnBuZz1uLXc1/MzEtaDI5OS1mY3Jv/cDY0PTEsMDAwMDAw/MDBmZmZmZmZmZi1y/dw',
  'https://imgs.search.brave.com/VSi9gNCzOITSYtfbvXAN_kSHi8lPEPKGUyjl_t4flNQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3N0YXRpYy5jb20v/bWFya2V0aW5nLWNt/cy9hc3NldHMvaW1h/Z2VzLzZmLzliLzRh/NzMwNDU3NGI2MGIz/MTUwNjc3M2UwODMy/OGIvYWJvdXQtZ29v/Z2xlLXRodW1ibmFp/bC1hLnBuZz1uLXc1/MzEtaDI5OS1mY3Jv/cDY0PTEsMDAwMDAw/MDBmZmZmZmZmZi1y/dw',
    'https://imgs.search.brave.com/VSi9gNCzOITSYtfbvXAN_kSHi8lPEPKGUyjl_t4flNQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3N0YXRpYy5jb20v/bWFya2V0aW5nLWNt/cy9hc3NldHMvaW1h/Z2VzLzZmLzliLzRh/NzMwNDU3NGI2MGIz/MTUwNjc3M2UwODMy/OGIvYWJvdXQtZ29v/Z2xlLXRodW1ibmFp/bC1hLnBuZz1uLXc1/MzEtaDI5OS1mY3Jv/cDY0PTEsMDAwMDAw/MDBmZmZmZmZmZi1y/dw',
  'https://imgs.search.brave.com/VSi9gNCzOITSYtfbvXAN_kSHi8lPEPKGUyjl_t4flNQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3N0YXRpYy5jb20v/bWFya2V0aW5nLWNt/cy9hc3NldHMvaW1h/Z2VzLzZmLzliLzRh/NzMwNDU3NGI2MGIz/MTUwNjc3M2UwODMy/OGIvYWJvdXQtZ29v/Z2xlLXRodW1ibmFp/bC1hLnBuZz1uLXc1/MzEtaDI5OS1mY3Jv/cDY0PTEsMDAwMDAw/MDBmZmZmZmZmZi1y/dw',
]

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1024 },
    items: 3
  },
  desktop: {
    breakpoint: { max: 1024, min: 768 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 768, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
}

function ImagenesProcesadas() {
  return (
    <div style={{ background: '#181818', minHeight: '100vh' }}>
        <Bar />

        <div style={{ maxWidth: "100%", marginTop: "10vh" }}>
          <Carousel
            responsive={responsive}
            showDots={true}
            infinite={true}
            autoPlay={false}
            containerClass="carousel-container"
            itemClass="carousel-item-padding-40-px"
            centerMode={true}
          >
            {images.map((img, idx) => (
              <div key={idx} style={{ padding: 10 }}>
                <img
                  src={img}
                  alt={`img-${idx}`}
                  style={{
                    width: '100%',
                    height: 750,
                    objectFit: 'overflow',
                    borderRadius: 20,
                    boxShadow: '0 4px 24px #0008'
                  }}
                />
              </div>
            ))}
          </Carousel>
        </div>
    </div>
  )
}

export default ImagenesProcesadas