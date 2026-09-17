export const API_BASE_URL = 'http://localhost:3000/api';

export async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || data?.mensaje || `Error en la solicitud HTTP ${res.status}`;
      return { success: false, error: errorMsg, status: res.status };
    }

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'No fue posible conectar con el servidor backend en http://localhost:3000.',
      networkError: true,
    };
  }
}
