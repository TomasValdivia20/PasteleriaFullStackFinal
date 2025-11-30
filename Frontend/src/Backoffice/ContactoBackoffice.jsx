import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./css/styles.css";

export default function ContactoBackoffice() {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'leidos', 'no-leidos'
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarContactos();
  }, [filtro]);

  const cargarContactos = async () => {
    try {
      setLoading(true);
      
      let url = '/contactos';
      if (filtro === 'leidos') {
        url += '?leido=true';
      } else if (filtro === 'no-leidos') {
        url += '?leido=false';
      }
      
      const response = await api.get(url);
      setContactos(response.data);
    } catch (error) {
      console.error('Error cargando contactos:', error);
      mostrarMensaje('Error al cargar mensajes de contacto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeido = async (id, nuevoEstado) => {
    try {
      await api.put(`/contactos/${id}/leido`, { leido: nuevoEstado });
      mostrarMensaje(
        `Mensaje marcado como ${nuevoEstado ? 'leído' : 'no leído'}`, 
        'success'
      );
      cargarContactos();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      mostrarMensaje('Error al actualizar estado del mensaje', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este mensaje de contacto?')) return;

    try {
      await api.delete(`/contactos/${id}`);
      mostrarMensaje('Mensaje eliminado exitosamente', 'success');
      cargarContactos();
    } catch (error) {
      console.error('Error eliminando contacto:', error);
      mostrarMensaje('Error al eliminar mensaje', 'error');
    }
  };

  const verDetalle = (contacto) => {
    setContactoSeleccionado(contacto);
    setMostrarModal(true);
    
    // Si no está leído, marcarlo automáticamente
    if (!contacto.leido) {
      handleMarcarLeido(contacto.id, true);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setContactoSeleccionado(null);
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <div className="small">Panel de Administración</div>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div id="layoutSidenav_content">
          <main>
            <div className="container-fluid px-4">
              <h1 className="mt-4">Mensajes de Contacto</h1>
              <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active">Gestión de Mensajes de Contacto</li>
              </ol>

              {/* Mensajes */}
              {mensaje.texto && (
                <div className={`alert alert-${mensaje.tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
                  {mensaje.texto}
                </div>
              )}

              {/* Filtros */}
              <div className="mb-3">
                <div className="btn-group" role="group">
                  <button
                    className={`btn ${filtro === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFiltro('todos')}
                  >
                    Todos
                  </button>
                  <button
                    className={`btn ${filtro === 'no-leidos' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFiltro('no-leidos')}
                  >
                    No Leídos
                  </button>
                  <button
                    className={`btn ${filtro === 'leidos' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFiltro('leidos')}
                  >
                    Leídos
                  </button>
                </div>
              </div>

              {/* Tabla de Contactos */}
              <div className="card text-start">
                <div className="card-body">
                  {loading ? (
                    <p>Cargando mensajes...</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Mensaje</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactos.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center">No hay mensajes disponibles</td>
                            </tr>
                          ) : (
                            contactos.map((contacto) => (
                              <tr key={contacto.id} className={!contacto.leido ? 'table-warning' : ''}>
                                <td>
                                  {contacto.leido ? (
                                    <span className="badge bg-secondary">Leído</span>
                                  ) : (
                                    <span className="badge bg-primary">Nuevo</span>
                                  )}
                                </td>
                                <td>{formatearFecha(contacto.fechaEnvio)}</td>
                                <td>{contacto.nombre}</td>
                                <td>{contacto.email}</td>
                                <td>{contacto.telefono || '-'}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-link"
                                    onClick={() => verDetalle(contacto)}
                                  >
                                    Ver mensaje
                                  </button>
                                </td>
                                <td>
                                  <button
                                    className={`btn btn-sm ${contacto.leido ? 'btn-outline-secondary' : 'btn-success'} me-2`}
                                    onClick={() => handleMarcarLeido(contacto.id, !contacto.leido)}
                                    title={contacto.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                                  >
                                    <i className={`fas ${contacto.leido ? 'fa-envelope' : 'fa-envelope-open'}`}></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleEliminar(contacto.id)}
                                  >
                                    <i className="fas fa-trash"></i>
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

              {/* Modal Detalle */}
              {mostrarModal && contactoSeleccionado && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          Mensaje de {contactoSeleccionado.nombre}
                        </h5>
                        <button type="button" className="btn-close" onClick={cerrarModal}></button>
                      </div>
                      <div className="modal-body">
                        <div className="mb-3">
                          <strong>Fecha:</strong> {formatearFecha(contactoSeleccionado.fechaEnvio)}
                        </div>
                        <div className="mb-3">
                          <strong>Nombre:</strong> {contactoSeleccionado.nombre}
                        </div>
                        <div className="mb-3">
                          <strong>Email:</strong>{' '}
                          <a href={`mailto:${contactoSeleccionado.email}`}>
                            {contactoSeleccionado.email}
                          </a>
                        </div>
                        <div className="mb-3">
                          <strong>Teléfono:</strong>{' '}
                          {contactoSeleccionado.telefono ? (
                            <a href={`tel:${contactoSeleccionado.telefono}`}>
                              {contactoSeleccionado.telefono}
                            </a>
                          ) : (
                            'No proporcionado'
                          )}
                        </div>
                        <div className="mb-3">
                          <strong>Mensaje:</strong>
                          <div className="mt-2 p-3 border rounded bg-light">
                            {contactoSeleccionado.mensaje}
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                          Cerrar
                        </button>
                        <a 
                          href={`mailto:${contactoSeleccionado.email}?subject=Re: Tu mensaje en Pastelería Mil Sabores`}
                          className="btn btn-primary"
                        >
                          <i className="fas fa-reply"></i> Responder por Email
                        </a>
                      </div>
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
