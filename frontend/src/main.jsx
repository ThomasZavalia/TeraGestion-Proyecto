import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider,ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { theme } from './theme/index.js'; 
import { AuthProvider } from './context/AuthContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleReCaptchaProvider reCaptchaKey="6Ld5eiIsAAAAABw8Qi6lGJwFnsNGJ2TT5srkEKtE">
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}> 
      <AuthProvider>
      <BrowserRouter>            
        <App />
      </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>
  </GoogleReCaptchaProvider>
);