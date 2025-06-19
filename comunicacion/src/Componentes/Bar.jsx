import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';

export default function MenuAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'rgb(109, 109, 109)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <MenuItem
                sx={{
                  bgcolor: 'rgb(109, 109, 109)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1.58rem',
                  px: 1.5,
                  py: 1.2,
                  borderRadius: 2,
                  letterSpacing: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgb(90, 90, 90)',
                    color: '#fff',
                  },
                }}
              >
                Inicio
              </MenuItem>
            </Link>
            {/* Barra vertical de separación */}
            <Box
              sx={{
                height: 28,
                width: '2px',
                bgcolor: 'white',
                mx: 1.5,
                borderRadius: 1,
                opacity: 0.7,
              }}
            />
            <Link to="/imagenes-procesadas" style={{ textDecoration: 'none' }}>
              <MenuItem
                sx={{
                  bgcolor: 'rgb(102, 102, 102)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  letterSpacing: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgb(90, 90, 90)',
                    color: '#fff',
                  },
                }}
              >
                Imágenes procesadas
              </MenuItem>
            </Link>
          </Box>
          <Typography variant="h6" component="div" sx={{ fontSize: '2.08rem' ,ml: 3, color: 'white', fontWeight: 600 }}>
            Photos
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
