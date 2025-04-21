import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND } from '../utils/conexion';
import '../styles/MaterialsManagement.css'; 

interface Material {
  id: number;
  identificador: string;
  titulo: string;
  autor: string;
  tipo: string;
  cantidad_prestamo: number;
  cantidad_total: number;
  anio_publicacion: number;
  anio_llegada: number;
  editorial: string;
  factor_estancia: number;
  genero?: string;
  frecuencia_publicacion?: string;
  nombre_congreso?: string;
}

type MaterialType = 'all' | 'libros' | 'revistas' | 'actas';

const MaterialsManagement = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState<MaterialType>('all');
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
    fetchMaterials(1, activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchMaterials(currentPage, activeTab);
  }, [currentPage]);

  const fetchMaterials = async (page: number, type: MaterialType) => {
    setLoading(true);
    setError('');
    try {
      const skip = (page - 1) * itemsPerPage;
      let endpoint = '/api/materiales';

      if (type === 'libros') {
        endpoint = '/api/materiales/libros/';
      } else if (type === 'revistas') {
        endpoint = '/api/materiales/revistas/';
      } else if (type === 'actas') {
        endpoint = '/api/materiales/actas/';
      }
      
      const response = await axios.get(`${BACKEND}${endpoint}?skip=${skip}&limit=${itemsPerPage}`);
      
      if (response.data && response.data.materials && Array.isArray(response.data.materials)) {
        setMaterials(response.data.materials);
        setTotalItems(response.data.total);
        const calculatedTotalPages = Math.ceil(response.data.total / itemsPerPage);
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(`Error al cargar los materiales (${type}).`);
      setMaterials([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialTypeLabel = (): string => {
    switch (activeTab) {
      case 'libros': return 'Libros';
      case 'revistas': return 'Revistas';
      case 'actas': return 'Actas de Congreso';
      default: return 'Materiales';
    }
  };

  const renderAdditionalColumns = () => {
    if (activeTab === 'libros') {
      return <th>Género</th>;
    } else if (activeTab === 'revistas') {
      return <th>Actualización</th>;
    } else if (activeTab === 'actas') {
      return <th>Nombre de Congreso</th>;
    }
    return null;
  };

  const renderAdditionalData = (material: Material) => {
    if (activeTab === 'libros' && material.genero) {
      return <td>{material.genero}</td>;
    } else if (activeTab === 'revistas' && material.frecuencia_publicacion) {
      return <td>{material.frecuencia_publicacion}</td>;
    } else if (activeTab === 'actas' && material.nombre_congreso) {
      return <td>{material.nombre_congreso}</td>;
    }
    return null;
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Gestión de {getMaterialTypeLabel()}</h2>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todos los Materiales
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'libros' ? 'active' : ''}`}
            onClick={() => setActiveTab('libros')}
          >
            Libros
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'revistas' ? 'active' : ''}`}
            onClick={() => setActiveTab('revistas')}
          >
            Revistas
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'actas' ? 'active' : ''}`}
            onClick={() => setActiveTab('actas')}
          >
            Actas de Congreso
          </button>
        </li>
      </ul>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Cargando {getMaterialTypeLabel().toLowerCase()}...</p>
      ) : (
        <>
          {materials.length === 0 ? (
            <div className="alert alert-info">No hay {getMaterialTypeLabel().toLowerCase()} disponibles</div>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Identificador</th>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Tipo</th>
                  <th>Editorial</th>
                  {renderAdditionalColumns()}
                  <th>Disponibles</th>
                  <th>Total</th>
                  <th>Factor Estancia</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td>{material.id}</td>
                    <td>{material.identificador}</td>
                    <td>{material.titulo}</td>
                    <td>{material.autor}</td>
                    <td>{material.tipo}</td>
                    <td>{material.editorial}</td>
                    {renderAdditionalData(material)}
                    <td>{material.cantidad_total - material.cantidad_prestamo}</td>
                    <td>{material.cantidad_total}</td>
                    <td>{material.factor_estancia.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <div>
              <span>Página {currentPage} de {totalPages}</span>
              {materials.length > 0 && (
                <span className="ms-2 text-muted">
                  (Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min((currentPage - 1) * itemsPerPage + materials.length, totalItems)}) 
                  de {totalItems} {getMaterialTypeLabel().toLowerCase()}
                </span>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || materials.length === 0}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MaterialsManagement;