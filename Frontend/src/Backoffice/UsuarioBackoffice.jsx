import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { REGIONES_Y_COMUNAS } from "../utils/dataRegiones";
import "./css/styles.css";

export default function UsuarioBackoffice() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState('todos');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    direccion: '',
    region: '',
    comuna: '',
    rol: 'CLIENTE'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      mostrarMensaje('Error al cargar usuarios', 'error');
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegionChange = (e) => {
    const regionSeleccionada = e.target.value;
    setFormData({
      ...formData,
      region: regionSeleccionada,
      comuna: ''
    });
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioEditando(null);
    setFormData({
      rut: '',
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      direccion: '',
      region: '',
      comuna: '',
      rol: 'CLIENTE'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioEditando(usuario);
    setFormData({
      rut: usuario.rut,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      password: '', // No mostrar password actual
      direccion: usuario.direccion,
      region: usuario.region,
      comuna: usuario.comuna,
      rol: usuario.rol.nombre
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setUsuarioEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.rut || !formData.nombre || !formData.apellido || !formData.correo || 
        !formData.region || !formData.comuna || !formData.direccion) {
      mostrarMensaje('Todos los campos son obligatorios', 'error');
      return;
    }

    if (!modoEdicion && !formData.password) {
      mostrarMensaje('La contraseña es obligatoria para nuevos usuarios', 'error');
      return;
    }

    try {
      if (modoEdicion) {
        // Actualizar usuario existente
        const dataToSend = { ...formData };
        // Si no se cambió la password, no enviarla
        if (!dataToSend.password) {
          delete dataToSend.password;
        }

        await api.put(`/usuarios/${usuarioEditando.id}`, dataToSend);
        mostrarMensaje('Usuario actualizado exitosamente', 'success');
      } else {
        // Crear nuevo usuario
        await api.post('/usuarios', formData);
        mostrarMensaje('Usuario creado exitosamente', 'success');
      }

      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const mensajeError = error.response?.data?.message || 'Error al guardar usuario';
      mostrarMensaje(mensajeError, 'error');
    }
  };

  const handleEliminar = async (id, nombreCompleto) => {
    if (!window.confirm(`¿Está seguro de eliminar al usuario ${nombreCompleto}?`)) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      mostrarMensaje('Usuario eliminado exitosamente', 'success');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      const mensajeError = error.response?.data?.message || 'Error al eliminar usuario';
      mostrarMensaje(mensajeError, 'error');
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    if (filtroRol === 'todos') return true;
    return usuario.rol.nombre === filtroRol;
  });

  const getBadgeColor = (rol) => {
    switch(rol) {
      case 'ADMIN': return 'bg-primary';
      case 'EMPLEADO': return 'bg-success';
      case 'CLIENTE': return 'bg-warning';
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
                <Link to="/backoffice/Usuario" className="nav-link active">
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
              Administrador
            </div>
          </nav>
        </div>

        <div id="layoutSidenav_content">
          <main>
            <div className="container-fluid px-4">
              <h1 className="mt-4">Gestión de Usuarios</h1>
              <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active">Usuarios Registrados</li>
              </ol>

              {/* Mensajes */}
              {mensaje.texto && (
                <div className={`alert alert-${mensaje.tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                  {mensaje.texto}
                  <button type="button" className="btn-close" onClick={() => setMensaje({ texto: '', tipo: '' })}></button>
                </div>
              )}

              {/* Filtros y Botón Crear */}
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <i className="fas fa-filter me-1"></i>
                    Filtros
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={abrirModalCrear}>
                    <i className="fas fa-plus me-1"></i>
                    Nuevo Usuario
                  </button>
                </div>
                <div className="card-body">
                  <div className="btn-group" role="group">
                    <button 
                      className={`btn ${filtroRol === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFiltroRol('todos')}
                    >
                      Todos ({usuarios.length})
                    </button>
                    <button 
                      className={`btn ${filtroRol === 'ADMIN' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFiltroRol('ADMIN')}
                    >
                      Administradores ({usuarios.filter(u => u.rol.nombre === 'ADMIN').length})
                    </button>
                    <button 
                      className={`btn ${filtroRol === 'EMPLEADO' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFiltroRol('EMPLEADO')}
                    >
                      Empleados ({usuarios.filter(u => u.rol.nombre === 'EMPLEADO').length})
                    </button>
                    <button 
                      className={`btn ${filtroRol === 'CLIENTE' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setFiltroRol('CLIENTE')}
                    >
                      Clientes ({usuarios.filter(u => u.rol.nombre === 'CLIENTE').length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabla de Usuarios */}
              <div className="card">
                <div className="card-header">
                  <i className="fas fa-table me-1"></i>
                  Lista de Usuarios
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center">
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
                            <th>RUT</th>
                            <th>Nombre Completo</th>
                            <th>Correo</th>
                            <th>Región</th>
                            <th>Comuna</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuariosFiltrados.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center">No hay usuarios para mostrar</td>
                            </tr>
                          ) : (
                            usuariosFiltrados.map(usuario => (
                              <tr key={usuario.id}>
                                <td>{usuario.id}</td>
                                <td>{usuario.rut}</td>
                                <td>{usuario.nombre} {usuario.apellido}</td>
                                <td>{usuario.correo}</td>
                                <td>{usuario.region}</td>
                                <td>{usuario.comuna}</td>
                                <td>
                                  <span className={`badge ${getBadgeColor(usuario.rol.nombre)}`}>
                                    {usuario.rol.nombre}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-info me-1"
                                    onClick={() => abrirModalEditar(usuario)}
                                    title="Editar"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleEliminar(usuario.id, `${usuario.nombre} ${usuario.apellido}`)}
                                    title="Eliminar"
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

      {/* Modal Crear/Editar Usuario */}
      {mostrarModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">RUT *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="rut"
                        value={formData.rut}
                        onChange={handleInputChange}
                        placeholder="12345678-9"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Correo Electrónico *</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellido *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Región *</label>
                      <select 
                        className="form-select"
                        name="region"
                        value={formData.region}
                        onChange={handleRegionChange}
                        required
                      >
                        <option value="">Seleccione una región</option>
                        {REGIONES_Y_COMUNAS.map((reg, index) => (
                          <option key={index} value={reg.nombre}>
                            {reg.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Comuna *</label>
                      <select 
                        className="form-select"
                        name="comuna"
                        value={formData.comuna}
                        onChange={handleInputChange}
                        disabled={!formData.region}
                        required
                      >
                        <option value="">
                          {formData.region ? "Seleccione una comuna" : "Primero seleccione región"}
                        </option>
                        {formData.region &&
                          REGIONES_Y_COMUNAS.find((reg) => reg.nombre === formData.region)?.comunas.map((comuna, index) => (
                            <option key={index} value={comuna}>
                              {comuna}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Dirección *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Calle, número, departamento"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Contraseña {modoEdicion ? '(dejar vacío para no cambiar)' : '*'}
                      </label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!modoEdicion}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Rol *</label>
                      <select 
                        className="form-select"
                        name="rol"
                        value={formData.rol}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="CLIENTE">Cliente</option>
                        <option value="EMPLEADO">Empleado</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modoEdicion ? 'Actualizar' : 'Crear'} Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
