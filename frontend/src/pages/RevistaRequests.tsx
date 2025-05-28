import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';

interface SolicitudRevista {
  id: number;
  nombre_usuario: string;
  direccion_usuario: string;
  titulo_material: string;
}

const RevistaRequests = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudRevista[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/materiales/revistas/solicitudes');
      const data = response.data;
      const formattedData = data.map((item: {
        id: number;
        nombre_usuario?: string;
        nombreUsuario?: string;
        direccion_usuario?: string;
        direccionUsuario?: string;
        titulo_material?: string;
        tituloMaterial?: string;
      }) => ({
        id: item.id,
        nombre_usuario: item.nombre_usuario || item.nombreUsuario || '',
        direccion_usuario: item.direccion_usuario || item.direccionUsuario || '',
        titulo_material: item.titulo_material || item.tituloMaterial || ''
      }));
      setSolicitudes(formattedData);
    } catch (err) {
      console.error('Error fetching solicitudes:', err);
      setError('Error al cargar las solicitudes de revistas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Solicitudes de Revistas</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Usuario</th>
              <th>Dirección</th>
              <th>Título Material</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id}>
                <td>{solicitud.id}</td>
                <td>{solicitud.nombre_usuario}</td>
                <td>{solicitud.direccion_usuario}</td>
                <td>{solicitud.titulo_material}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RevistaRequests;