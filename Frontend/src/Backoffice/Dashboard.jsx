import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/styles.css";
import "./js/scripts.js"; 




export default function Dashboard() {
	useEffect(() => {
	const dtCssHref = "https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/style.min.css";
	let dtLink = document.querySelector(`link[href="${dtCssHref}"]`);
		if (!dtLink) {
			dtLink = document.createElement("link");
			dtLink.rel = "stylesheet";
			dtLink.href = dtCssHref;
			document.head.appendChild(dtLink);
		}
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
					options: {
						responsive: true,
						scales: {
							x: { display: true },
							y: { display: true, beginAtZero: true }
						},
						plugins: { legend: { display: false } }
					}
				});
				charts.push(areaChart);
			}
		} catch (e) {
		}


		try {
			const barCtx = document.getElementById("myBarChart");
			if (barCtx) {
				const barChart = new Chart(barCtx, {
					type: "bar",
					data: {
						labels: ["Enero","Febrero","Marzo","Abril","Mayo","Junio"],
						datasets: [{
							label: "Ventas",
							data: [4215, 5312, 6251, 7841, 9821, 14984],
							backgroundColor: "rgba(2,117,216,0.7)",
							borderColor: "rgba(2,117,216,1)",
						}]
					},
					options: {
						responsive: true,
						scales: { x: { display: true }, y: { beginAtZero: true } },
						plugins: { legend: { display: false } }
					}
				});
				charts.push(barChart);
			}
		} catch (e) {
		}


		let dataTableInstance = null;
		try {
			const tableEl = document.getElementById("datatablesSimple");
			if (tableEl) {
				dataTableInstance = new simpleDatatables.DataTable(tableEl);
			}
		} catch (e) {
		}

		return () => {
			charts.forEach((c) => {
				try { c.destroy(); } catch (e) {}
			});
			if (dataTableInstance && typeof dataTableInstance.destroy === 'function') {
				try { dataTableInstance.destroy(); } catch (e) {}
			}
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
								<div className="collapse" id="collapsePages" aria-labelledby="headingTwo" data-bs-parent="#sidenavAccordion">
									<nav className="sb-sidenav-menu-nested nav accordion" id="sidenavAccordionPages">
										<div className="collapse" id="pagesCollapseAuth" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordionPages">
										</div>
									</nav>
								</div>
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
						<div className="backoffice-inner">
							<div className="container-fluid px-4">
							<h1 className="mt-4">Dashboard</h1>
							<ol className="breadcrumb mb-4">
								<li className="breadcrumb-item active">Dashboard</li>
							</ol>
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
