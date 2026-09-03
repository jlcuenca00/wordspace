import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './wordspace-v8.css'
import './soundpacks.css'
import './settings-v2.css'
import './interface-fixes.css'

createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>)
