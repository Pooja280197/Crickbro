import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux";
import Store from "./redux/Store.js";
import { LoginPopupProvider } from "./context/LoginPopupContext.jsx";

createRoot(document.getElementById('root')).render(
  <Provider store={Store}>
      <LoginPopupProvider>
        
          <App />
       
      </LoginPopupProvider>
    </Provider>
)
