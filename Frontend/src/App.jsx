import React from "react";
/* --- BLOQUE DE CSS --- */
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/general.css";
import "./css/catalogo.css";
import "./css/Home.css";

// Contextos
import { UserProvider } from "./context/UserContext";
import { CarritoProvider } from "./context/CarritoContext";
import { Routes, Route } from "react-router-dom"; 

// Componentes globales
import Header from "./components/Header";
import Footer from "./components/Footer";

// Páginas
import Home from "./pages/Home";
import Categorias from "./pages/Categorias"; // muestra las categorías
import Carrito from "./pages/Carrito";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import ConfirmacionCompra from "./pages/ConfirmacionCompra";
import ProductDetail from "./pages/ProductDetail"; // ✅ Página de detalle de producto
import AcercaDeNosotros from "./pages/AcercaDeNosotros";
import CategoriaDetallePage from "./pages/CategoriaDetallePage";
import Contacto from './pages/Contacto'; //Pagina formulario contacto

// Blogs
import CategoriaBlogs from "./pages/CategoriaBlogs";
import DetalleBlog from "./pages/DetalleBlog";

// Componentes del catálogo
import ProductosList from "./components/Catalogo/ProductosList";

// Componente de protección de rutas
import ProtectedRoute from "./components/ProtectedRoute";

// Backoffice
import BackofficeDashboard from "./Backoffice/Dashboard";
import BackofficeOrdenes from "./Backoffice/Ordenes";
import BackofficeProducto from "./Backoffice/Producto";
import BackofficeCategoria from "./Backoffice/Categoria";
import BackofficeContacto from "./Backoffice/ContactoBackoffice";
import BackofficeUsuario from "./Backoffice/UsuarioBackoffice";
import BackofficeReportes from "./Backoffice/Reportes";
import BackofficePerfil from "./Backoffice/Perfil";

function App() {
  return (
    <UserProvider>
      <CarritoProvider>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/acercadenosotros" element={<AcercaDeNosotros />} />
              <Route path="/productos" element={<Categorias />} /> {/* muestra las categorías */}
              <Route path="/productos/:categoriaId" element={<CategoriaDetallePage />} />
              <Route
                path="/producto/:id"
                element={<ProductDetail />}
              /> {/* ✅ detalle del producto */}
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/login" element={<Login />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/confirmacion" element={<ConfirmacionCompra />} />

              {/* Rutas para el Blogs*/}
              <Route path="/blogs" element={<CategoriaBlogs />} />
              <Route path="/blogs/:slug" element={<DetalleBlog />} />

              {/* Rutas para el BackOffice - PROTEGIDAS (requieren rol ADMIN) */}
              <Route 
                path="/backoffice" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficeDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backoffice/Dashboard" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficeDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backoffice/Ordenes" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficeOrdenes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backoffice/Producto" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficeProducto />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backoffice/Categoria" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficeCategoria />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backoffice/Contacto" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficeContacto />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backoffice/Usuario" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficeUsuario />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backoffice/Reportes" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficeReportes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backoffice/Perfil" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <BackofficePerfil />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/contacto" element={<Contacto />} />
              </Routes>
          </main>
          <Footer />
      </CarritoProvider>
    </UserProvider>
  );
}

export default App;
