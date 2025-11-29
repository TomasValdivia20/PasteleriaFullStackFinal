import React from "react";
import { Link } from "react-router-dom";
import "./css/styles.css";

export default function Categoria() {
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
          <h1 className="mt-4">Categoría</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Gestión de Categorías</li>
          </ol>
          {/* Listado de Categorias*/}
          <div className="card text-start">
            <div className="card-body">
              <div className="table-responsive small">
                <table className="table table-striped table-sm table-hover">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Descripción</th>
                      <th scope="col">Cantidad de Productos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td><a href="/admin/categoria/2000/index.html">Tortas Cuadradas</a></td>
                      <td>Tortas de forma redonda</td>
                      <td>150</td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td><a href="/admin/categoria/2000/index.html">Tortas Circulares</a></td>
                      <td>Tortas de forma cuadrada</td>
                      <td>90</td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td><a href="/admin/categoria/2000">Postres Individuales</a></td>
                      <td>Postres que se preparan para porciones individuales</td>
                      <td>200</td>
                    </tr>
                    <tr>
                      <th scope="row">4</th>
                      <td><a href="/admin/categoria/2000">Pasteleria Tradicional</a></td>
                      <td>Pasteleria chilena tradicional</td>
                      <td>200</td>
                    </tr>
                    <tr>
                      <th scope="row">5</th>
                      <td><a href="/admin/categoria/2000">Productos Sin Azucar</a></td>
                      <td>Productos que no utilizan azucar en su preparacion</td>
                      <td>120</td>
                    </tr>
                    <tr>
                      <th scope="row">6</th>
                      <td>Productos sin gluten</td>
                      <td>Productos que no contienen gluten</td>
                      <td>80</td>
                    </tr>
                    <tr>
                      <th scope="row">7</th>
                      <td>Productos Veganos</td>
                      <td>Productos veganos</td>
                      <td>70</td>
                    </tr>
                    <tr>
                      <th scope="row">8</th>
                      <td>Productos Especiales</td>
                      <td>Productos especiales para situaciones especiales</td>
                      <td>60</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Gestion de creacion de nueva categoria*/}
          <br /><br /><br />
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Ingreso de nueva categoría</li>
          </ol>
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">Nombre del Categoria<small className="text-danger">*</small></label>
                <input type="text" className="form-control" id="productName" placeholder="Ingrese el nombre del juego" required />
              </div>
              <div className="mb-3">
                <label htmlFor="productDescription" className="form-label">Descripción<small className="text-danger">*</small></label>
                <textarea className="form-control" id="productDescription" rows={3} placeholder="Ingrese una descripción del juego" required defaultValue={""} />
              </div>
              <div className="text-end">
                <button type="submit" className="btn btn-primary" onclick="alert('Categoria creada exitosamente')">Guardar</button>
              </div>
            </form>
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
