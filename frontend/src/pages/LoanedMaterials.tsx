import { useState, useEffect } from 'react';
import axios from 'axios';

interface MaterialEnPrestamo {
  tipo: string;
  titulo: string;
  autor: string;
  cantidad_prestada: number;
  fecha_prestamo: string;
  factor_estancia: number;
}

const LoanedMaterials = () => {
  const [materials, setMaterials] = useState<MaterialEnPrestamo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/materiales/en-prestamo');
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Error al cargar los materiales en préstamo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Materiales en Préstamo Ordenados por Factor de Estancia</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Cargando materiales...</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Cantidad Prestada</th>
              <th>Fecha Préstamo</th>
              <th>Factor de Estancia</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={index}>
                <td>{material.tipo}</td>
                <td>{material.titulo}</td>
                <td>{material.autor}</td>
                <td>{material.cantidad_prestada}</td>
                <td>{new Date(material.fecha_prestamo).toLocaleDateString()}</td>
                <td>{material.factor_estancia.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LoanedMaterials;