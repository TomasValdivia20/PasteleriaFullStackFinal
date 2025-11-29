import React from "react";
import { Link } from "react-router-dom";
import "./css/styles.css";


export default function Producto() {
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
          <h1 className="mt-4">Producto</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Gestión de Productos</li>
          </ol>
          <div className="card text-start">
            <div className="card-body">
              <div className="table-responsive small">
                <table className="table table-striped table-sm table-hover">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Producto</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Descripción</th>
                      <th scope="col">Precio</th>
                      <th scope="col">Disponibilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td><a href="/admin/producto/1000">Torta Red Velvet</a></td>
                      <td>Tortas Cuadradas</td>
                      <td>Torta cuadrada de Red Velvet</td>
                      <td>$35.000 - $40.000</td>
                      <td>20/100</td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td><a href="/admin/producto/1000">Torta "Cancha de futbol"</a></td>
                      <td>Tortas Cuadradas </td>
                      <td>Torta Cuadrada decorada como Cancha de futbol, rellena con crema y manjar</td>
                      <td>$35.000 - $40.000</td>
                      <td>20/100</td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td><a href="/admin/producto/1000">Torta Nuez Manjar</a></td>
                      <td>Tortas Circulares</td>
                      <td>Torta circular de nuez con manjar</td>
                      <td>$35.000 - $60.000</td>
                      <td>20/100</td>
                    </tr>
                    <tr>
                      <th scope="row">4</th>
                      <td><a href="/admin/producto/1000">Torta panqueque naranja</a></td>
                      <td>Tortas Circulares</td>
                      <td>Torta circular de panqueques con naranja</td>
                      <td>$35.000 - $60.000</td>
                      <td>20/100</td>
                    </tr>
                    <tr>
                      <th scope="row">5</th>
                      <td><a href="/admin/producto/1000">Mousse de chocolate</a></td>
                      <td>Postres Individuales</td>
                      <td>Postre individual de Mousse sabor chocolate</td>
                      <td>$35.000 - $60.000</td>
                      <td>Agotado</td>
                    </tr>
                    <tr>
                      <th scope="row">6</th>
                      <td><a href="/admin/producto/1000">Mousse de Berries</a></td>
                      <td>Postres Individuales</td>
                      <td>Postre individual de Mousse sabor a Berries</td>
                      <td>$35.000 - $60.000</td>
                      <td>20/100</td>
                    </tr>
                    <tr>
                      <th scope="row">7</th>
                      <td><a href="/admin/producto/1000">Kuchen de nuez</a></td>
                      <td>Productos Sin Azucar</td>
                      <td>Producto sin azucar de Kuchen de nuez</td>
                      <td>$35.000 - $60.000</td>
                      <td>20/50</td>
                    </tr>
                    <tr>
                      <th scope="row">8</th>
                      <td><a href="/admin/producto/1000">Kuchen de almendras</a></td>
                      <td>Productos Sin Azucar</td>
                      <td>Producto sin azucar de Kuchen de almendra</td>
                      <td>$35.000 - $60.000</td>
                      <td>20/50</td>
                    </tr>
                    <tr>
                      <th scope="row">9</th>
                      <td><a href="/admin/producto/1000">Chilenitos (12 Unidades)</a></td>
                      <td>Pasteleria Tradicional</td>
                      <td>Pasteleria tradicional chilena de Chilenitos que se vende en decena.</td>
                      <td>$35.000 - $60.000</td>
                      <td>40/100</td>
                    </tr>
                    <tr>
                      <th scope="row">10</th>
                      <td><a href="/admin/producto/1000">Cachitos (12 Unidades)</a></td>
                      <td>Pasteleria Tradicional</td>
                      <td>Pasteleria tradicional chilena de Cachitos que se vende en decena.</td>
                      <td>$35.000 - $60.000</td>
                      <td>20/100</td>
                    </tr>
                    <tr>
                      <th scope="row">11</th>
                      <td><a href="/admin/producto/1000">Rollitos de canela sin gluten (12 Unidades)</a></td>
                      <td>Productos sin gluten</td>
                      <td>Pasteleria sin gluten de Rollitos de canela que se vende en decena.</td>
                      <td>$35.000 - $60.000</td>
                      <td>18/20</td>
                    </tr>
                    <tr>
                      <th scope="row">12</th>
                      <td><a href="/admin/producto/1000">Kuchen de Nuez Keto sin gluten</a></td>
                      <td>Productos sin Gluten</td>
                      <td>Pasteleria sin gluten de Kuchen keto de nuez</td>
                      <td>$35.000 - $60.000</td>
                      <td>Agotado</td>
                    </tr>
                    <tr>
                      <th scope="row">13</th>
                      <td><a href="/admin/producto/1000">Brownie vegano</a></td>
                      <td>Productos Veganos</td>
                      <td>Unidad de Brownie vegano</td>
                      <td>$35.000 - $60.000</td>
                      <td>20/50</td>
                    </tr>
                    <tr>
                      <th scope="row">14</th>
                      <td><a href="/admin/producto/1000">Torta vegana de frambuesa y chocolate</a></td>
                      <td>Productos Veganos</td>
                      <td>Torta vegana, que contieen frambuesa y chocolate vegano</td>
                      <td>$35.000 - $60.000</td>
                      <td>20/50</td>
                    </tr>
                    <tr>
                      <th scope="row">15</th>
                      <td><a href="/admin/producto/1000">Torta de Bodas "Mil Sabores"</a></td>
                      <td>Productos Especiales</td>
                      <td>Torta de bodas especial</td>
                      <td>$35.000 - $60.000</td>
                      <td>2/10</td>
                    </tr>
                    <tr>
                      <th scope="row">16</th>
                      <td><a href="/admin/producto/1000">Pan de Pascua</a></td>
                      <td>Productos Especiales</td>
                      <td>Producto de temporada especial</td>
                      <td>$35.000 - $60.000</td>
                      <td>2/10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Gestion de creacion de nuevo producto*/}
          <br /><br /><br />
          <h4>Creación de nuevo producto</h4>
          <div className="card text-start">
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="productName" className="form-label">ID<small className="text-danger">*</small></label>
                  <input type="text" className="form-control" id="productName" placeholder="Ingrese el nombre del juego" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="productName" className="form-label">Nombre del Producto<small className="text-danger">*</small></label>
                  <input type="text" className="form-control" id="productName" placeholder="Ingrese el nombre del producto" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="productDescription" className="form-label">Descripción<small className="text-danger">*</small></label>
                  <textarea className="form-control" id="productDescription" rows={3} placeholder="Ingrese una descripción del producto" required defaultValue={""} />
                </div>
                <div className="row">
                  <div className="mb-3 col-6 col-md-4">
                    <label htmlFor="productPrice" className="form-label">Precio<small className="text-danger">*</small></label>
                    <input type="number" className="form-control" id="productPrice" placeholder="Ingrese el precio del producto (En caso de tener rango, especificar)" required />
                  </div>
                  <div className="mb-3 col-6 col-md-4">
                    <label htmlFor="productPrice" className="form-label">Stock<small className="text-danger">*</small></label>
                    <input type="number" className="form-control" id="productPrice" placeholder="Cantidad disponible del producto" required />
                  </div>
                  <div className="mb-3 col-6 col-md-4">
                    <label htmlFor="productCategory" className="form-label">Categoría<small className="text-danger">*</small></label>
                    <select className="form-select" id="productCategory" required>
                      <option value="" disabled>Seleccione una categoría</option>
                      <option value="Tortas Cuadradas">Tortas Cuadradas</option>
                      <option value="Tortas Circulares">Tortas Circulares</option>
                      <option value="Postres Individuales">Postres Individuales</option>
                      <option value="Pasteleria Tradicional">Pasteleria Tradicional</option>
                      <option value="Productos Sin Azucar">Productos Sin Azucar</option>
                      <option value="Productos sin gluten">Productos sin gluten</option>
                      <option value="Productos Veganos">Productos Veganos</option>
                      <option value="Productos Especiales">Productos Especiales</option>
                    </select>
                  </div>
                  <div className="mb-3 col-6 col-md-4">
                    <label htmlFor="productAvailability" className="form-label">Disponibilidad<small className="text-danger">*</small></label>
                    <select className="form-select" id="productAvailability" required>
                      <option value="Disponible">Disponible</option>
                      <option value="Agotado">Agotado</option>
                    </select>
                  </div>
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-primary" onClick={() => alert('Producto creado exitosamente')}>Guardar</button>
                </div>
              </form>
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
