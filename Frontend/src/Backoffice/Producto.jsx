import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./css/styles.css";

export default function Producto() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioBase: '',
    imagen: '',
    categoriaId: '',
    variantes: [{ nombre: '', precio: '', stock: '', infoNutricional: '' }]
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/productos'),
        api.get('/categorias')
      ]);
      setProductos(prodRes.data);
      setCategorias(catRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarMensaje('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVarianteChange = (index, field, value) => {
    const nuevasVariantes = [...formData.variantes];
    nuevasVariantes[index][field] = value;
    setFormData({ ...formData, variantes: nuevasVariantes });
  };

  const agregarVariante = () => {
    setFormData({
      ...formData,
      variantes: [...formData.variantes, { nombre: '', precio: '', stock: '', infoNutricional: '' }]
    });
  };

  const eliminarVariante = (index) => {
    if (formData.variantes.length <= 1) {
      mostrarMensaje('Debe haber al menos 1 variante (tamaño)', 'error');
      return;
    }
    const nuevasVariantes = formData.variantes.filter((_, i) => i !== index);
    setFormData({ ...formData, variantes: nuevasVariantes });
  };

  const abrirFormularioNuevo = () => {
    setProductoEditando(null);
    setFormData({ 
      nombre: '', 
      descripcion: '', 
      precioBase: '', 
      imagen: '', 
      categoriaId: '',
      variantes: [{ nombre: '', precio: '', stock: '', infoNutricional: '' }]
    });
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (producto) => {
    setProductoEditando(producto);
    setFormData({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precioBase: producto.precioBase || '',
      imagen: producto.imagen || '',
      categoriaId: producto.categoria?.id || '',
      variantes: producto.variantes && producto.variantes.length > 0 
        ? producto.variantes.map(v => ({
            nombre: v.nombre || '',
            precio: v.precio || '',
            stock: v.stock || '',
            infoNutricional: v.infoNutricional || ''
          }))
        : [{ nombre: '', precio: '', stock: '', infoNutricional: '' }]
    });
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProductoEditando(null);
    setFormData({ 
      nombre: '', 
      descripcion: '', 
      precioBase: '', 
      imagen: '', 
      categoriaId: '',
      variantes: [{ nombre: '', precio: '', stock: '', infoNutricional: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.categoriaId) {
      mostrarMensaje('Nombre y categoría son obligatorios', 'error');
      return;
    }

    // Validar que haya al menos 1 variante
    if (!formData.variantes || formData.variantes.length === 0) {
      mostrarMensaje('Debe agregar al menos 1 variante (tamaño)', 'error');
      return;
    }

    // Validar que todas las variantes tengan nombre y precio
    const variantesValidas = formData.variantes.filter(v => v.nombre.trim() && v.precio);
    if (variantesValidas.length === 0) {
      mostrarMensaje('Al menos 1 variante debe tener nombre y precio', 'error');
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precioBase: parseFloat(formData.precioBase) || 0,
        imagen: formData.imagen,
        categoria: { id: parseInt(formData.categoriaId) },
        variantes: variantesValidas.map(v => ({
          nombre: v.nombre,
          precio: parseFloat(v.precio) || 0,
          stock: parseInt(v.stock) || 0,
          infoNutricional: v.infoNutricional || ''
        }))
      };

      if (productoEditando) {
        await api.put(`/productos/${productoEditando.id}`, payload);
        mostrarMensaje('Producto actualizado exitosamente', 'success');
      } else {
        await api.post('/productos', payload);
        mostrarMensaje('Producto creado exitosamente', 'success');
      }

      cerrarFormulario();
      cargarDatos();
    } catch (error) {
      console.error('Error guardando producto:', error);
      mostrarMensaje('Error al guardar producto', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return;

    try {
      await api.delete(`/productos/${id}`);
      mostrarMensaje('Producto eliminado exitosamente', 'success');
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      mostrarMensaje('Error al eliminar producto', 'error');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
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
              <h1 className="mt-4">Productos</h1>
              <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active">Gestión de Productos</li>
              </ol>

              {/* Mensajes */}
              {mensaje.texto && (
                <div className={`alert alert-${mensaje.tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
                  {mensaje.texto}
                </div>
              )}

              {/* Botón Crear Nuevo */}
              <button 
                className="btn btn-primary mb-3" 
                onClick={abrirFormularioNuevo}
              >
                <i className="fas fa-plus"></i> Nuevo Producto
              </button>

              {/* Tabla de Productos */}
              <div className="card text-start">
                <div className="card-body">
                  {loading ? (
                    <p>Cargando productos...</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <th>Precio Base</th>
                            <th>Variantes</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center">No hay productos disponibles</td>
                            </tr>
                          ) : (
                            productos.map((prod) => (
                              <tr key={prod.id}>
                                <td>{prod.id}</td>
                                <td>{prod.nombre}</td>
                                <td>{prod.categoria?.nombre || 'Sin categoría'}</td>
                                <td>{prod.descripcion || 'Sin descripción'}</td>
                                <td>${prod.precioBase?.toLocaleString('es-CL') || 0}</td>
                                <td>
                                  {prod.variantes && prod.variantes.length > 0 ? (
                                    <span className="badge bg-primary">{prod.variantes.length} tamaño(s)</span>
                                  ) : (
                                    <span className="badge bg-warning text-dark">Sin variantes</span>
                                  )}
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => abrirFormularioEditar(prod)}
                                  >
                                    <i className="fas fa-edit"></i> Editar
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleEliminar(prod.id)}
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
                          {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
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
                              placeholder="Ej: Torta Red Velvet"
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
                              placeholder="Descripción del producto..."
                            />
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="precioBase" className="form-label">
                                Precio Base <span className="text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="precioBase"
                                name="precioBase"
                                value={formData.precioBase}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="100"
                                placeholder="35000"
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="categoriaId" className="form-label">
                                Categoría <span className="text-danger">*</span>
                              </label>
                              <select
                                className="form-select"
                                id="categoriaId"
                                name="categoriaId"
                                value={formData.categoriaId}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>
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
                              placeholder="/assets/img/producto.jpg o URL Supabase"
                            />
                            <small className="text-muted">Path relativo o URL completa de Supabase</small>
                          </div>

                          {/* Sección de Variantes (Tamaños) */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <label className="form-label mb-0">
                                Variantes / Tamaños <span className="text-danger">*</span>
                              </label>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-success"
                                onClick={agregarVariante}
                              >
                                <i className="fas fa-plus"></i> Agregar Tamaño
                              </button>
                            </div>
                            <small className="text-muted d-block mb-3">
                              Ej: "12 personas", "16 personas", "Tamaño único"
                            </small>

                            {formData.variantes.map((variante, index) => (
                              <div key={index} className="card mb-3">
                                <div className="card-body">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="mb-0">Variante {index + 1}</h6>
                                    {formData.variantes.length > 1 && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => eliminarVariante(index)}
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    )}
                                  </div>

                                  <div className="row">
                                    <div className="col-md-6 mb-2">
                                      <label className="form-label">
                                        Nombre / Tamaño <span className="text-danger">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={variante.nombre}
                                        onChange={(e) => handleVarianteChange(index, 'nombre', e.target.value)}
                                        placeholder="Ej: 12 personas"
                                        required
                                      />
                                    </div>

                                    <div className="col-md-3 mb-2">
                                      <label className="form-label">
                                        Precio <span className="text-danger">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={variante.precio}
                                        onChange={(e) => handleVarianteChange(index, 'precio', e.target.value)}
                                        placeholder="35000"
                                        min="0"
                                        step="100"
                                        required
                                      />
                                    </div>

                                    <div className="col-md-3 mb-2">
                                      <label className="form-label">Stock</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={variante.stock}
                                        onChange={(e) => handleVarianteChange(index, 'stock', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                      />
                                    </div>

                                    <div className="col-12 mb-2">
                                      <label className="form-label">Información Nutricional</label>
                                      <textarea
                                        className="form-control"
                                        rows="2"
                                        value={variante.infoNutricional}
                                        onChange={(e) => handleVarianteChange(index, 'infoNutricional', e.target.value)}
                                        placeholder="Opcional: Calorías, ingredientes, etc."
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={cerrarFormulario}>
                            Cancelar
                          </button>
                          <button type="submit" className="btn btn-primary">
                            {productoEditando ? 'Actualizar' : 'Crear'}
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
