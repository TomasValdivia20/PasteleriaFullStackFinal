import React from "react";
import { Link } from "react-router-dom";
import "./css/styles.css";

export default function Ordenes() {
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
          <h1 className="mt-4">Ordenes</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Registro de boletas</li>
          </ol>
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-table me-1" />
              Tabla de ventas
            </div>
            <div className="card-body">
              <table id="datatablesSimple">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Region</th>
                    <th>Edad</th>
                    <th>Fecha de compra</th>
                    <th>Total de compra</th>
                  </tr>
                </thead>
                <tfoot>
                  <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Region</th>
                    <th>Edad</th>
                    <th>Fecha de Compra</th>
                    <th>Total de Compra</th>
                  </tr>
                </tfoot>
                <tbody>
                  <tr>
                    <td>Sebastian Carrasco</td>
                    <td>Recoleta 140</td>
                    <td>Metropolitana</td>
                    <td>61</td>
                    <td>2025/04/25</td>
                    <td>$16,800</td>
                  </tr>
                  <tr>
                    <td>Javier Cornejo</td>
                    <td>Bernando o' Higgins 2</td>
                    <td>Magallanes</td>
                    <td>63</td>
                    <td>2025/07/25</td>
                    <td>$170,750</td>
                  </tr>
                  <tr>
                    <td>Ricardo Piscina</td>
                    <td>Peru 12</td>
                    <td>Arica</td>
                    <td>66</td>
                    <td>2025/01/12</td>
                    <td>$86,000</td>
                  </tr>
                  <tr>
                    <td>Alfonso Sandoval</td>
                    <td>Valparaiso 12</td>
                    <td>Valparaiso</td>
                    <td>22</td>
                    <td>2025/03/29</td>
                    <td>$433,060</td>
                  </tr>
                  <tr>
                    <td>Kike Morandé</td>
                    <td>Viña del Mar 67</td>
                    <td>Valparaiso</td>
                    <td>33</td>
                    <td>2025/11/28</td>
                    <td>$162,700</td>
                  </tr>
                  <tr>
                    <td>Willy Sabor</td>
                    <td>Monjitas 54</td>
                    <td>Metropolitana</td>
                    <td>61</td>
                    <td>2025/12/02</td>
                    <td>$372,000</td>
                  </tr>
                  <tr>
                    <td>Anita Alvarado</td>
                    <td>Jorge Pratt 76</td>
                    <td>Metropolitana</td>
                    <td>59</td>
                    <td>2025/08/06</td>
                    <td>$137,500</td>
                  </tr>
                  <tr>
                    <td>Pancho Delsur</td>
                    <td>Bombero Nuñez 34</td>
                    <td>Metropolitana</td>
                    <td>55</td>
                    <td>2025/10/14</td>
                    <td>$327,900</td>
                  </tr>
                  <tr>
                    <td>Pedro Pascal</td>
                    <td>Monjitas 52</td>
                    <td>Metropolitana</td>
                    <td>39</td>
                    <td>2025/09/15</td>
                    <td>$205,500</td>
                  </tr>
                  <tr>
                    <td>Sergio Lagos</td>
                    <td>La Moneda 3</td>
                    <td>Metropolitana</td>
                    <td>23</td>
                    <td>2025/12/13</td>
                    <td>$103,600</td>
                  </tr>
                </tbody>
              </table>
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
