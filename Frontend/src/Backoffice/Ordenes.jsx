import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./css/styles.css";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [detalleOrden, setDetalleOrden] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ordenes');
      setOrdenes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setLoading(false);
    }
  };

  const verDetalleOrden = async (ordenId) => {
    try {
      const response = await api.get(`/ordenes/${ordenId}/detalle`);
      setDetalleOrden(response.data);
      setNuevoEstado(response.data.estado);
      setOrdenSeleccionada(ordenId);
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar detalle de orden:', error);
      alert('Error al cargar el detalle de la orden');
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setDetalleOrden(null);
    setOrdenSeleccionada(null);
    setNuevoEstado("");
  };

  const guardarCambios = async () => {
    if (!nuevoEstado) {
      alert('Debe seleccionar un estado');
      return;
    }

    try {
      setGuardandoEstado(true);
      await api.put(`/ordenes/${ordenSeleccionada}/estado`, {
        nuevoEstado: nuevoEstado
      });
      
      alert('Estado actualizado correctamente');
      cerrarModal();
      cargarOrdenes(); // Recargar tabla
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error desconocido';
      alert(`Error al actualizar el estado de la orden: ${errorMsg}`);
    } finally {
      setGuardandoEstado(false);
    }
  };

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (valor) => {
    return '$' + valor.toLocaleString('es-CL');
  };

  const getBadgeEstado = (estado) => {
    switch(estado) {
      case 'COMPLETADA': return 'bg-success';
      case 'ENTREGADA': return 'bg-primary';
      case 'PROCESANDO': return 'bg-info';
      case 'PENDIENTE': return 'bg-warning';
      case 'CANCELADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="backoffice-page has-sidebar">
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
              <div className="nav">
                <div className="sb-sidenav-menu-heading">Menu</div>
                <Link to="/backoffice/Dashboard" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"/></div>
                  Dashboard
                </Link>
                <Link to="/backoffice/Ordenes" className="nav-link active">
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
                <Link to="/backoffice/Contacto" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-envelope" /></div>
                  Contacto
                </Link>
                <Link to="/backoffice/Usuario" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-user" /></div>
                  Usuario
                </Link>
                <Link to="/backoffice/Reportes" className="nav-link">
                  <div className="sb-nav-link-icon"><i className="fas fa-columns" /></div>
                  Reportes
                </Link>
              </div>
            </div>
            <div className="sb-sidenav-footer">
              <div className="small">Has iniciado sesión como:</div>
              Administrador
            </div>
          </nav>
        </div>

        <div id="layoutSidenav_content">
          <main>
            <div className="container-fluid px-4">
              <h1 className="mt-4">Gestión de Órdenes</h1>
              <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active">Órdenes de Compra</li>
              </ol>

              <div className="card mb-4">
                <div className="card-header">
                  <i className="fas fa-table me-1" />
                  Tabla de Ventas
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Región</th>
                            <th>Fecha de Compra</th>
                            <th>Estado</th>
                            <th>Total de Compra</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordenes.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center">
                                No hay órdenes registradas
                              </td>
                            </tr>
                          ) : (
                            ordenes.map((orden) => (
                              <tr key={orden.id}>
                                <td>{orden.id}</td>
                                <td>{orden.usuario?.nombre} {orden.usuario?.apellido}</td>
                                <td>{orden.usuario?.direccion}</td>
                                <td>{orden.usuario?.region}</td>
                                <td>{formatearFecha(orden.fecha)}</td>
                                <td>
                                  <span className={`badge ${getBadgeEstado(orden.estado)}`}>
                                    {orden.estado}
                                  </span>
                                </td>
                                <td className="fw-bold text-success">
                                  {formatearMoneda(orden.total)}
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => verDetalleOrden(orden.id)}
                                  >
                                    <i className="fas fa-eye me-1"></i>
                                    Ver Detalles
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot>
                          {ordenes.length > 0 && (
                            <tr className="table-info">
                              <td colSpan="6" className="text-end fw-bold">
                                Total General:
                              </td>
                              <td className="fw-bold text-success">
                                {formatearMoneda(
                                  ordenes.reduce((sum, orden) => sum + orden.total, 0)
                                )}
                              </td>
                            </tr>
                          )}
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          <footer className="py-4 bg-light mt-auto">
            <div className="container-fluid px-4">
              <div className="d-flex align-items-center justify-content-between small">
                <div className="text-muted">Pasteleria Mil Sabores © Todos los derechos reservados</div>
                <div>
                  <a href="#">Políticas de Privacidad</a>
                  ·
                  <a href="#">Terminos y Condiciones</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modal de Detalle de Orden */}
      {showModal && detalleOrden && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-receipt me-2"></i>
                  Detalle de Orden #{detalleOrden.id}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={cerrarModal}
                ></button>
              </div>

              <div className="modal-body">
                {/* Información del Cliente */}
                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <i className="fas fa-user me-2"></i>
                    Información del Cliente
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Nombre:</strong> {detalleOrden.clienteNombre} {detalleOrden.clienteApellido}</p>
                        <p><strong>Dirección:</strong> {detalleOrden.clienteDireccion}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Región:</strong> {detalleOrden.clienteRegion}</p>
                        <p><strong>Fecha:</strong> {formatearFecha(detalleOrden.fecha)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Productos de la Orden */}
                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <i className="fas fa-shopping-cart me-2"></i>
                    Productos Ordenados
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-dark">
                          <tr>
                            <th>Producto</th>
                            <th>Variante</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-end">Precio Unit.</th>
                            <th className="text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalleOrden.productos.map((producto, index) => (
                            <tr key={index}>
                              <td>{producto.nombreProducto}</td>
                              <td>{producto.nombreVariante || <em className="text-muted">Sin variante</em>}</td>
                              <td className="text-center">{producto.cantidad}</td>
                              <td className="text-end">{formatearMoneda(producto.precioUnitario)}</td>
                              <td className="text-end fw-bold">{formatearMoneda(producto.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-info">
                          <tr>
                            <td colSpan="4" className="text-end fw-bold">Total:</td>
                            <td className="text-end fw-bold text-success fs-5">
                              {formatearMoneda(detalleOrden.total)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Cambiar Estado */}
                <div className="card">
                  <div className="card-header bg-light">
                    <i className="fas fa-exchange-alt me-2"></i>
                    Cambiar Estado de la Orden
                  </div>
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <label htmlFor="estadoSelect" className="form-label">Seleccionar Estado:</label>
                        <select 
                          id="estadoSelect"
                          className="form-select" 
                          value={nuevoEstado}
                          onChange={(e) => setNuevoEstado(e.target.value)}
                        >
                          <option value="COMPLETADA">Completada</option>
                          <option value="ENTREGADA">Pedido Entregado</option>
                          <option value="PROCESANDO">Procesando</option>
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="CANCELADA">Cancelada</option>
                        </select>
                      </div>
                      <div className="col-md-4 d-grid gap-2 mt-3 mt-md-0">
                        <button 
                          className="btn btn-success btn-lg"
                          onClick={guardarCambios}
                          disabled={guardandoEstado || nuevoEstado === detalleOrden.estado}
                        >
                          {guardandoEstado ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Guardar Cambios
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {nuevoEstado === detalleOrden.estado && (
                      <p className="text-muted mt-2 mb-0">
                        <small><i className="fas fa-info-circle me-1"></i>
                        El estado actual ya es "{nuevoEstado}"</small>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={cerrarModal}
                >
                  <i className="fas fa-times me-2"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
