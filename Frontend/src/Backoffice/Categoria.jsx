import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./css/styles.css";

export default function Categoria() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: ''
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Cargar categorías al montar
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      console.log('📚 [Categorias Backoffice] Cargando categorías...');
      const response = await api.get('/categorias');
      setCategorias(response.data);
      console.log(`✅ [Categorias Backoffice] ${response.data.length} categorías cargadas`);
    } catch (error) {
      console.error('❌ [Categorias Backoffice] Error:', error);
      mostrarMensaje('Error al cargar categorías', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirFormularioNuevo = () => {
    setFormData({ nombre: '', descripcion: '', imagen: '' });
    setCategoriaEditando(null);
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (categoria) => {
    setFormData({
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || '',
      imagen: categoria.imagen || ''
    });
    setCategoriaEditando(categoria);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setCategoriaEditando(null);
    setFormData({ nombre: '', descripcion: '', imagen: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      mostrarMensaje('El nombre es obligatorio', 'error');
      return;
    }

    try {
      if (categoriaEditando) {
        // Actualizar
        console.log(`🔄 [Categorias] Actualizando ID ${categoriaEditando.id}`);
        await api.put(`/categorias/${categoriaEditando.id}`, formData);
        mostrarMensaje('✅ Categoría actualizada exitosamente', 'success');
      } else {
        // Crear
        console.log('➕ [Categorias] Creando nueva categoría');
        await api.post('/categorias', formData);
        mostrarMensaje('✅ Categoría creada exitosamente', 'success');
      }

      cerrarFormulario();
      cargarCategorias();
    } catch (error) {
      console.error('❌ [Categorias] Error en submit:', error);
      mostrarMensaje('Error al guardar categoría', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      return;
    }

    try {
      console.log(`🗑️ [Categorias] Eliminando ID ${id}`);
      await api.delete(`/categorias/${id}`);
      mostrarMensaje('✅ Categoría eliminada exitosamente', 'success');
      cargarCategorias();
    } catch (error) {
      console.error('❌ [Categorias] Error al eliminar:', error);
      mostrarMensaje('Error al eliminar categoría', 'error');
    }
  };

  return (
    <div className="backoffice-page has-sidebar">
      <div id="layoutSidenav">
        {/* Sidebar */}
        <div id="layoutSidenav_nav">
          <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
              <div className="nav">
                <div className="sb-sidenav-menu-heading">Menu</div>
                <Link to="/backoffice/Dashboard" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"/></div>
                  Dashboard
                </Link>
                <Link to="/backoffice/Ordenes" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-table" /></div>
                  Ordenes
                </Link>
                <Link to="/backoffice/Producto" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-book-open" /></div>
                  Producto
                </Link>
                <Link to="/backoffice/Categoria" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-book-open" /></div>
                  Categoría
                </Link>
                <Link to="/backoffice/Usuario" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-user" /></div>
                  Usuario
                </Link>
                <Link to="/backoffice/Reportes" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-columns" /></div>
                  Reportes
                </Link>
                <Link to="/backoffice/Perfil" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-user" /></div>
                  Perfil
                </Link>
              </div>
            </div>
            <div className="sb-sidenav-footer">
              <div className="small">Panel de Administración</div>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div id="layoutSidenav_content">
          <main>
            <div className="container-fluid px-4">
              <h1 className="mt-4">Categorías</h1>
              <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active">Gestión de Categorías</li>
              </ol>

              {/* Mensajes */}
              {mensaje.texto && (
                <div className={`alert alert-${mensaje.tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
                  {mensaje.texto}
                </div>
              )}

              {/* Botón Crear Nueva */}
              <button 
                className="btn btn-primary mb-3" 
                onClick={abrirFormularioNuevo}
              >
                <i className="fas fa-plus"></i> Nueva Categoría
              </button>

              {/* Tabla de Categorías */}
              <div className="card text-start">
                <div className="card-body">
                  {loading ? (
                    <p>Cargando categorías...</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Imagen</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categorias.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center">No hay categorías disponibles</td>
                            </tr>
                          ) : (
                            categorias.map((cat) => (
                              <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td>{cat.nombre}</td>
                                <td>{cat.descripcion || 'Sin descripción'}</td>
                                <td>{cat.imagen ? '✅' : '❌'}</td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => abrirFormularioEditar(cat)}
                                  >
                                    <i className="fas fa-edit"></i> Editar
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleEliminar(cat.id)}
                                  >
                                    <i className="fas fa-trash"></i> Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Formulario */}
              {mostrarFormulario && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          {categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h5>
                        <button type="button" className="btn-close" onClick={cerrarFormulario}></button>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label htmlFor="nombre" className="form-label">
                              Nombre <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="nombre"
                              name="nombre"
                              value={formData.nombre}
                              onChange={handleInputChange}
                              required
                              placeholder="Ej: Tortas de Cumpleaños"
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label">Descripción</label>
                            <textarea
                              className="form-control"
                              id="descripcion"
                              name="descripcion"
                              rows="3"
                              value={formData.descripcion}
                              onChange={handleInputChange}
                              placeholder="Descripción de la categoría..."
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="imagen" className="form-label">URL Imagen</label>
                            <input
                              type="text"
                              className="form-control"
                              id="imagen"
                              name="imagen"
                              value={formData.imagen}
                              onChange={handleInputChange}
                              placeholder="/assets/img/categoria.jpg"
                            />
                            <small className="text-muted">Path relativo o URL completa de Supabase</small>
                          </div>
                        </div>

                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={cerrarFormulario}>
                            Cancelar
                          </button>
                          <button type="submit" className="btn btn-primary">
                            {categoriaEditando ? 'Actualizar' : 'Crear'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>

          <footer className="py-4 bg-light mt-auto">
            <div className="container-fluid px-4">
              <div className="d-flex align-items-center justify-content-between small">
                <div className="text-muted">Pastelería Mil Sabores &copy; 2025</div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
