import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Category from './pages/Category'
import Favorites from './pages/Favorites'
import Admin from './pages/Admin'
import Auth from './pages/Auth'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/category/:categoryName"
        element={<Category />}
      />

      <Route
        path="/product/:id"
        element={<ProductDetail />}
      />

      <Route
        path="/favorites"
        element={<Favorites />}
      />

      <Route
        path="/admin"
        element={<Admin />}
      />

      <Route
        path="/auth"
        element={<Auth />}
      />
    </Routes>
  )
}