import { useState, useEffect } from 'react';
import axios from 'axios';

interface MaterialDisponible {
  tipo: string;
  titulo: string;
  cantidad_disponible: number;
  cantidad_total: number;
}

const AvailableMaterials = () => {
  const [materials, setMaterials] = useState<MaterialDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/materiales/disponibles');
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Error al cargar los materiales disponibles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Materiales Disponibles</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Cargando materiales...</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Título</th>
              <th>Cantidad Disponible</th>
              <th>Cantidad Total</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={index}>
                <td>{material.tipo}</td>
                <td>{material.titulo}</td>
                <td>{material.cantidad_disponible}</td>
                <td>{material.cantidad_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AvailableMaterials;