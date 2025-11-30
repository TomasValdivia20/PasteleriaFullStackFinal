import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Chart, registerables } from 'chart.js';
import api from "../api";
import "./css/styles.css";

// Registrar componentes de Chart.js
Chart.register(...registerables);

export default function Reportes() {
  const [ventasUltimos15Dias, setVentasUltimos15Dias] = useState(null);
  const [ventasPrimerSemestre, setVentasPrimerSemestre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState({ area: null, bar: null });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (ventasUltimos15Dias && ventasPrimerSemestre) {
      crearGraficos();
    }
    
    return () => {
      if (charts.area) charts.area.destroy();
      if (charts.bar) charts.bar.destroy();
    };
  }, [ventasUltimos15Dias, ventasPrimerSemestre]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [res15Dias, resSemestre] = await Promise.all([
        api.get('/ordenes/stats/ultimos-15-dias'),
        api.get('/ordenes/stats/primer-semestre')
      ]);

      setVentasUltimos15Dias(res15Dias.data);
      setVentasPrimerSemestre(resSemestre.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      setLoading(false);
    }
  };

  const crearGraficos = () => {
    // Gráfico de área - Últimos 15 días
    const areaCtx = document.getElementById("myAreaChart");
    if (areaCtx && ventasUltimos15Dias) {
      if (charts.area) charts.area.destroy();

      const labels = ventasUltimos15Dias.datos.map(d => {
        const fecha = new Date(d.fecha);
        return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
      });
      const data = ventasUltimos15Dias.datos.map(d => d.total);

      const areaChart = new Chart(areaCtx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            label: "Ventas (CLP)",
            data: data,
            backgroundColor: "rgba(2,117,216,0.2)",
            borderColor: "rgba(2,117,216,1)",
            fill: true,
            tension: 0.3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { display: true },
            y: { 
              display: true, 
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString('es-CL');
                }
              }
            }
          },
          plugins: { 
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return 'Total: $' + context.parsed.y.toLocaleString('es-CL');
                }
              }
            }
          }
        }
      });

      setCharts(prev => ({ ...prev, area: areaChart }));
    }

    // Gráfico de barras - Últimos 6 meses
    const barCtx = document.getElementById("myBarChart");
    if (barCtx && ventasPrimerSemestre) {
      if (charts.bar) charts.bar.destroy();

      const labels = ventasPrimerSemestre.datos.map(d => d.mes);
      const data = ventasPrimerSemestre.datos.map(d => d.total);

      const barChart = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Ventas (CLP)",
            data: data,
            backgroundColor: "rgba(2,117,216,0.7)",
            borderColor: "rgba(2,117,216,1)",
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { 
            x: { display: true }, 
            y: { 
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString('es-CL');
                }
              }
            }
          },
          plugins: { 
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return 'Total: $' + context.parsed.y.toLocaleString('es-CL');
                }
              }
            }
          }
        }
      });

      setCharts(prev => ({ ...prev, bar: barChart }));
    }
  };

  const formatearMoneda = (valor) => {
    return '$' + valor.toLocaleString('es-CL');
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
                <Link to="/backoffice/Reportes" className="nav-link active">
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
              <h1 className="mt-4">Reportes de Ventas</h1>
              <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active">Análisis y Estadísticas</li>
              </ol>

              {/* Tarjetas de Resumen */}
              {ventasUltimos15Dias && ventasPrimerSemestre && (
                <div className="row mb-4">
                  <div className="col-xl-6 col-md-6">
                    <div className="card bg-primary text-white mb-4">
                      <div className="card-body">
                        <h5>Ventas Últimos 15 Días</h5>
                        <h3>{formatearMoneda(ventasUltimos15Dias.totalVendido)}</h3>
                        <small>{ventasUltimos15Dias.cantidadOrdenes} órdenes procesadas</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-6 col-md-6">
                    <div className="card bg-success text-white mb-4">
                      <div className="card-body">
                        <h5>Ventas Últimos 6 Meses</h5>
                        <h3>{formatearMoneda(ventasPrimerSemestre.totalVendido)}</h3>
                        <small>{ventasPrimerSemestre.cantidadOrdenes} órdenes procesadas</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gráficos */}
              <div className="row">
                <div className="col-xl-6">
                  <div className="card mb-4">
                    <div className="card-header">
                      <i className="fas fa-chart-area me-1" />
                      Ventas en los últimos 15 días
                    </div>
                    <div className="card-body">
                      {loading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                        </div>
                      ) : (
                        <canvas id="myAreaChart" width="100%" height="200" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="card mb-4">
                    <div className="card-header">
                      <i className="fas fa-chart-bar me-1" />
                      Ventas Últimos 6 Meses
                    </div>
                    <div className="card-body">
                      {loading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                        </div>
                      ) : (
                        <canvas id="myBarChart" width="100%" height="200" />
                      )}
                    </div>
                  </div>
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
