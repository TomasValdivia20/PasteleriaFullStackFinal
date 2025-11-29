import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import "./css/styles.css";


export default function Reportes() {
  useEffect(() => {
    const charts = [];
    try {
      const areaCtx = document.getElementById("myAreaChart");
      if (areaCtx) {
        const areaChart = new Chart(areaCtx, {
          type: "line",
          data: {
						labels: ["1 Oct","2 Oct","3 Oct","4 Oct","5 Oct","6 Oct","7 Oct","8 Oct","9 Oct","10 Oct","11 Oct","12 Oct","13 Oct","14 Oct","15 Oct"],
						datasets: [{
							label: "Ventas",
							data: [10000, 30162, 26263, 18394, 18287, 28682, 31274, 33259, 25849, 24159, 32651, 31984, 38451, 32123, 40010],
							backgroundColor: "rgba(2,117,216,0.2)",
							borderColor: "rgba(2,117,216,1)",
							fill: true,
							tension: 0.3,
						}]
					},
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: true }, y: { beginAtZero: true } } }
        });
        charts.push(areaChart);
      }
    } catch (e) {
      // console.error('Area chart init error', e);
    }

    try {
      const barCtx = document.getElementById("myBarChart");
      if (barCtx) {
        const barChart = new Chart(barCtx, {
          type: "bar",
          data: {
            labels: ["Enero","Febrero","Marzo","Abril","Mayo","Junio"],
            datasets: [{ label: "Ventas", data: [4215, 5312, 6251, 7841, 9821, 14984], backgroundColor: "rgba(2,117,216,0.8)", borderColor: "rgba(2,117,216,1)" }]
          },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
        charts.push(barChart);
      }
    } catch (e) {
      // console.error('Bar chart init error', e);
    }

    return () => {
      charts.forEach((c) => { try { c.destroy(); } catch (e) {} });
    };
  }, []);
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
          <div className="small">Has iniciado sesión como:</div>
          Pablito Trabajero
        </div>
      </nav>
    </div>
    <div id="layoutSidenav_content">
      <main>
          <div className="container-fluid px-4">
          <h1 className="mt-4">Reportes</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Gestión de Reportes</li>
          </ol>
          {/* Contenido de reportes*/}
          <div className="row">
            <div className="col-xl-6">
              <div className="card mb-4">
                <div className="card-header">
                  <i className="fas fa-chart-area me-1" />
                  Ventas en los ultimos 15 días
                </div>
                <div className="card-body"><canvas id="myAreaChart" width="100%" height={40} /></div>
              </div>
            </div>
            <div className="col-xl-6">
              <div className="card mb-4">
                <div className="card-header">
                  <i className="fas fa-chart-bar me-1" />
                  Ventas primer semestre
                </div>
                <div className="card-body"><canvas id="myBarChart" width="100%" height={40} /></div>
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
