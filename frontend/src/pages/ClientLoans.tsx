import { useState } from 'react';
import axios from 'axios';

interface MaterialPrestado {
  titulo: string;
  autor: string;
}

const ClientLoans = () => {
  const [carne, setCarne] = useState('');
  const [materials, setMaterials] = useState<MaterialPrestado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/prestamos/cliente/${carne}`);
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('Error al cargar los préstamos del cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Préstamos por Cliente</h2>
      <div className="mb-3">
        <label htmlFor="carne" className="form-label">Carné de Identidad</label>
        <input
          type="text"
          className="form-control"
          id="carne"
          value={carne}
          onChange={(e) => setCarne(e.target.value)}
        />
      </div>
      <button className="btn btn-primary mb-3" onClick={fetchLoans}>
        Buscar Préstamos
      </button>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Cargando préstamos...</p>
      ) : (
        <ul className="list-group">
          {materials.map((material, index) => (
            <li key={index} className="list-group-item">
              <strong>{material.titulo}</strong> - {material.autor}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientLoans;