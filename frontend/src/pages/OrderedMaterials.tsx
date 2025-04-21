import { useState, useEffect } from 'react';
import axios from 'axios';

interface Material {
  id: number;
  titulo: string;
  autor: string;
}

const OrderedMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/materiales');
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Error al cargar los materiales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Materiales Ordenados por Autor y Título</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Cargando materiales...</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Autor</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr key={material.id}>
                <td>{material.id}</td>
                <td>{material.titulo}</td>
                <td>{material.autor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderedMaterials;