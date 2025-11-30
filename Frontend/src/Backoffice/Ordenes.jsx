import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./css/styles.css";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

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
                          </tr>
                        </thead>
                        <tbody>
                          {ordenes.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center">
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
    </div>
  );
}
