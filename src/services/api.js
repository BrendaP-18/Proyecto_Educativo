const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Cliente de peticiones a la API con soporte de token
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token_asistencia');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Error en la comunicación con el servidor.');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Servicio de Autenticación
 */
export const authService = {
  // Iniciar sesión
  async login(credentials) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem('token_asistencia', data.token);
      localStorage.setItem('user_asistencia', JSON.stringify(data.user));
    }
    return data;
  },

  // Registrar nuevo usuario
  async register(userData) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('token_asistencia', data.token);
      localStorage.setItem('user_asistencia', JSON.stringify(data.user));
    }
    return data;
  },

  // Obtener perfil actual
  async getProfile() {
    return await apiRequest('/auth/me');
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token_asistencia');
    localStorage.removeItem('user_asistencia');
  },

  // Obtener usuario guardado en localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user_asistencia');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
};

/**
 * Servicio de Escuelas
 */
export const escuelasService = {
  async getEscuelas() {
    return await apiRequest('/escuelas');
  }
};

/**
 * Servicio de Dashboard
 */
export const dashboardService = {
  async getStats(idEscuela) {
    const query = idEscuela ? `?id_escuela=${idEscuela}` : '';
    return await apiRequest(`/dashboard/stats${query}`);
  }
};

/**
 * Servicio de Solicitudes y Administración General
 */
export const solicitudesService = {
  // Crear solicitud (público)
  async create(data) {
    return await apiRequest('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Obtener todas las solicitudes con filtros (admin)
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/solicitudes${query ? `?${query}` : ''}`);
  },

  // Estadísticas globales del Administrador General
  async getAdminStats() {
    return await apiRequest('/solicitudes/stats');
  },

  // Aprobar solicitud
  async approve(id) {
    return await apiRequest(`/solicitudes/${id}/aprobar`, {
      method: 'PUT',
    });
  },

  // Rechazar solicitud
  async reject(id, motivo) {
    return await apiRequest(`/solicitudes/${id}/rechazar`, {
      method: 'PUT',
      body: JSON.stringify({ motivo }),
    });
  }
};

/**
 * Servicio del Portal del Docente
 */
export const docenteService = {
  // Obtener datos del dashboard docente (métricas, grupos, materias, alumnos en riesgo)
  async getDashboard(idUsuario) {
    return await apiRequest(`/docentes/dashboard?id_usuario=${idUsuario}`);
  },

  // Obtener lista de asistencia por grupo y fecha
  async getAsistencia(idGrupo, fecha) {
    const query = new URLSearchParams({ id_grupo: idGrupo, ...(fecha ? { fecha } : {}) }).toString();
    return await apiRequest(`/docentes/asistencia?${query}`);
  },

  // Guardar pase de lista de asistencia
  async guardarAsistencia(data) {
    return await apiRequest('/docentes/asistencia', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Obtener calificaciones por grupo, materia y periodo
  async getCalificaciones(idGrupo, idMateria, periodo) {
    const query = new URLSearchParams({ 
      id_grupo: idGrupo, 
      id_materia: idMateria, 
      ...(periodo ? { periodo } : {}) 
    }).toString();
    return await apiRequest(`/docentes/calificaciones?${query}`);
  },

  // Guardar calificaciones en BD
  async guardarCalificaciones(data) {
    return await apiRequest('/docentes/calificaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
