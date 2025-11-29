import React from "react";
import { Link } from "react-router-dom";
import "./css/styles.css";

export default function Perfil() {
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
      <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 mb-3">
        <div className="container-fluid px-4">
          <h1 className="mt-4">Perfil</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Tus datos</li>
          </ol>
          {/* Contenido de perfil*/}
          <div className="mt-4">
            <div className="col-sm-12">
              <h4>
                Información personal
              </h4>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="card text-start">
                  <div className="card-body">
                    <h5 className="card-title">Usuario</h5>
                    <p className="card-text" />
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre<small className="text-danger">*</small></label>
                        <input type="text" className="form-control" id="nombre" name="nombre" required />
                      </div>
                      <div className="col-6 mb-3">
                        <label htmlFor="apellidos" className="form-label">Apellidos<small className="text-danger">*</small></label>
                        <input type="text" className="form-control" id="apellidos" name="apellidos" required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="correo" className="form-label">Correo<small className="text-danger">*</small></label>
                      <input type="email" className="form-control" id="correo" name="correo" required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fechaNacimiento" className="form-label">Fecha nacimiento<small className="text-danger">*</small></label>
                      <input type="date" className="form-control" id="fechaNacimiento" name="fechaNacimiento" required />
                    </div>
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary" onclick="alert('Información personal cambiada exitosamente')">Guardar</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card text-start">
                  <div className="card-body">
                    <h5 className="card-title">Cambiar contraseña</h5>
                    <p className="card-text" />
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Contraseña<small className="text-danger">*</small></label>
                      <input type="password" className="form-control" id="password" name="password" required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="otra-password" className="form-label">Repetir Contraseña<small className="text-danger">*</small></label>
                      <input type="password" className="form-control" id="otra-password" name="otra-password" required />
                    </div>
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary" onclick="alert('Contraseña cambiada exitosamente')">Guardar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-4 bg-light mt-auto">
						<div className="container-fluid px-4">
							<div className="d-flex align-items-center justify-content-between small">
							</div>
						</div>
      </footer>
    </div>
  </div>
    </div>
  );
}
