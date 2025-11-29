import React from "react";
import { Link } from "react-router-dom";
import "./css/styles.css";

export default function Usuario() {
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
          <h1 className="mt-4">Usuario</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Gestión de Usuarios</li>
          </ol>
          <div className="card text-start">
            <div className="card-body">
              <div className="table-responsive small">
                <table className="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Nombre Completo</th>
                      <th scope="col">Correo Electrónico</th>
                      <th scope="col">Teléfono</th>
                      <th scope="col">Tipo</th>
                    </tr>
                  </thead>
                  <tbody id="userTableBody">
                    <tr>
                      <th scope="row">1</th>
                      <td><a href="/admin/usuario/3312" id="userLink10000">Amadeus</a></td>
                      <td>amadeusbigboss@gmail.com</td>
                      <td>+56911111111</td>
                      <td><h6><span className="badge bg-primary">ADMINISTRADOR</span></h6></td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td><a href="/admin/usuario/3312" id="userLink10000">Ludovico</a></td>
                      <td>gordoludovico@outlook.com</td>
                      <td>+56922222222</td>
                      <td><h6><span className="badge bg-success">VENDEDOR</span></h6></td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td><a href="/admin/usuario/3312" id="userLink10000">Agatha</a></td>
                      <td>agatha12@hotmail.com</td>
                      <td>+56933333333</td>
                      <td><h6><span className="badge bg-warning">CLIENTE</span></h6></td>
                    </tr>
                  </tbody>
                </table>
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
