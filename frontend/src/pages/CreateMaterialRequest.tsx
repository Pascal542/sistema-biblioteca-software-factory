import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface Material {
    id: number;
    titulo: string;
    autor: string;
    tipo: string;
    descripcion?: string;
    ubicacion?: string;
    estado?: string;
    cantidad?: number;
    total?: number;
    fecha_adquisicion?: string;
    activo?: boolean;
}

interface User {
    id: number;
    nombre: string;
    carne_identidad: string;
    direccion: string;
    email: string;
    rol: string;
}

const CreateMaterialRequest = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);
    
    // Estados para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [isSearchMode, setIsSearchMode] = useState(false);

    useEffect(() => {
        fetchUserData();
        loadInitialMaterials();
    }, []);

    // Búsqueda con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                setIsSearchMode(true);
                searchMaterials(searchTerm, 1);
            } else {
                setIsSearchMode(false);
                setSelectedMaterial(null);
                loadInitialMaterials();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/me');
            setUserData(response.data);
        } catch (err: unknown) {
            console.error('Error fetching user data:', err);
            setError('Error al obtener los datos del usuario. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const loadInitialMaterials = async (page: number = 1) => {
        try {
            setLoading(true);

            // Usar la misma lógica de MaterialsManagement con filtro de disponibles
            const params = new URLSearchParams({
                page: page.toString(),
                size: '4',
                estado: 'disponible' // Solo materiales disponibles
            });

            const response = await api.get(`/materiales/buscar/avanzado?${params}`);

            if (response.data && response.data.data && response.data.pagination) {
                // Filtrar adicionalmente materiales con cantidad > 0 y activos
                const availableMaterials = response.data.data.filter(
                    (material: Material) =>
                        material.activo === true &&
                        material.cantidad &&
                        material.cantidad > 0
                );

                setMaterials(availableMaterials);
                setCurrentPage(response.data.pagination.page);
                setTotalPages(response.data.pagination.pages);
                setTotalResults(response.data.pagination.total);
            } else {
                throw new Error('Formato de respuesta inesperado');
            }
        } catch (err) {
            console.error('Error loading initial materials:', err);
            setError('Error al cargar los materiales.');
        } finally {
            setLoading(false);
        }
    };

    const searchMaterials = useCallback(async (term: string, page: number = 1) => {
        try {
            setSearching(true);
            
            // Usar la misma lógica de MaterialsManagement
            const params = new URLSearchParams({
                page: page.toString(),
                size: '10',
                titulo: term.trim(),
                estado: 'disponible' // Solo materiales disponibles
            });

            const response = await api.get(`/materiales/buscar/avanzado?${params}`);
            
            if (response.data && response.data.data && response.data.pagination) {
                // Filtrar adicionalmente materiales con cantidad > 0 y activos
                const availableMaterials = response.data.data.filter(
                    (material: Material) => 
                        material.activo === true && 
                        material.cantidad && 
                        material.cantidad > 0
                );
                
                setMaterials(availableMaterials);
                setCurrentPage(response.data.pagination.page);
                setTotalPages(response.data.pagination.pages);
                setTotalResults(response.data.pagination.total);
            } else {
                throw new Error('Formato de respuesta inesperado');
            }
        } catch (err) {
            console.error('Error searching materials:', err);
            setError('Error al buscar materiales.');
        } finally {
            setSearching(false);
        }
    }, []);

    const handlePageChange = (e: React.MouseEvent, newPage: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (newPage >= 1 && newPage <= totalPages) {
            if (isSearchMode && searchTerm.trim()) {
                searchMaterials(searchTerm, newPage);
            } else {
                loadInitialMaterials(newPage);
            }
        }
    };

    const handleMaterialSelect = (material: Material) => {
        setSelectedMaterial(material);
        setError('');
    };

    const clearSelection = () => {
        setSelectedMaterial(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMaterial) {
            setError('Por favor, seleccione un material de la tabla.');
            return;
        }

        // Verificar que el material tenga cantidad disponible
        if (!selectedMaterial.cantidad || selectedMaterial.cantidad <= 0) {
            setError('El material seleccionado no tiene ejemplares disponibles.');
            return;
        }

        if (!userData || !userData.id) {
            setError('Error: No se han cargado los datos del usuario. Por favor, recargue la página.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const requestData = {
                usuario_id: userData.id,
                material_id: selectedMaterial.id,
                observaciones: observaciones.trim() || undefined,
            };

            console.log('🚀 Enviando datos:', requestData);
            console.log('🔗 URL completa:', `${api.defaults.baseURL}/solicitudes`);

            const response = await api.post('/solicitudes', requestData);

            console.log('✅ Respuesta exitosa:', response.data);

            setSuccess(true);
            setSelectedMaterial(null);
            setObservaciones('');

            // Recargar la lista de materiales para mostrar la cantidad actualizada
            if (isSearchMode && searchTerm.trim()) {
                searchMaterials(searchTerm, currentPage);
            } else {
                loadInitialMaterials(currentPage);
            }

            setTimeout(() => {
                navigate('/my-requests');
            }, 2000);
        } catch (err: any) {
            console.error('❌ Error completo:', err);
            console.error('❌ Error response:', err.response?.data);
            console.error('❌ Error status:', err.response?.status);

            if (err.response?.data?.detail) {
                setError(`Error: ${err.response.data.detail}`);
            } else if (err.response?.status === 400) {
                setError('Error: El material no está disponible o no tiene ejemplares suficientes.');
            } else {
                setError('Error al crear la solicitud. Por favor, inténtelo de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };


    if (loading && materials.length === 0) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando materiales disponibles...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-journal-plus me-2"></i>
                                Solicitar Material
                            </h4>
                        </div>
                        <div className="card-body">
                            {success ? (
                                <div className="alert alert-success" role="alert" aria-live="polite">
                                    <i className="bi bi-check-circle me-2"></i>
                                    ¡Su solicitud ha sido enviada correctamente! Será redirigido a sus solicitudes.
                                </div>
                            ) : (
                                <div className="row">
                                    {/* Columna izquierda: Búsqueda y tabla */}
                                    <div className="col-md-8">
                                        {error && (
                                            <div className="alert alert-danger" role="alert" aria-live="assertive">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                {error}
                                            </div>
                                        )}

                                        {/* Búsqueda de material */}
                                        <div className="mb-4">
                                            <label htmlFor="materialSearch" className="form-label">
                                                Buscar material (opcional)
                                            </label>
                                            <div className="position-relative">
                                                <input
                                                    id="materialSearch"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Escriba el título del material para buscar..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                                    {searching && (
                                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                            <span className="visually-hidden">Buscando...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {isSearchMode && (
                                                <small className="text-muted">
                                                    Mostrando resultados de búsqueda ({totalResults} encontrados)
                                                </small>
                                            )}
                                        </div>

                                        {/* Tabla de materiales */}
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0">
                                                    {isSearchMode ? 'Resultados de búsqueda' : 'Materiales disponibles'}
                                                </h6>
                                                {selectedMaterial && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={clearSelection}
                                                    >
                                                        <i className="bi bi-x me-1"></i>
                                                        Limpiar selección
                                                    </button>
                                                )}
                                            </div>

                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th scope="col" style={{ width: '50px' }}>Selec.</th>
                                                            <th scope="col">Título</th>
                                                            <th scope="col">Autor</th>
                                                            <th scope="col" style={{ width: '100px' }}>Disponibles</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {materials.length > 0 ? (
                                                            materials.map((material) => (
                                                                <tr 
                                                                    key={material.id} 
                                                                    className={`${selectedMaterial?.id === material.id ? 'table-success' : ''}`}
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleMaterialSelect(material)}
                                                                >
                                                                    <td className="text-center">
                                                                        <input
                                                                            type="radio"
                                                                            className="form-check-input"
                                                                            name="selectedMaterial"
                                                                            checked={selectedMaterial?.id === material.id}
                                                                            onChange={() => handleMaterialSelect(material)}
                                                                        />
                                                                    </td>
                                                                    <td className='text-truncate' style={{ maxWidth: '200px' }}>
                                                                        <strong>{material.titulo}</strong>
                                                                    </td>
                                                                    <td className='text-truncate' style={{maxWidth:'1vh'}}>{material.autor}</td>
                                                                    <td>
                                                                        <span className="badge bg-success">
                                                                            {material.cantidad}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={4} className="text-center py-4">
                                                                    <div className="text-muted">
                                                                        <i className="bi bi-search me-2"></i>
                                                                        {isSearchMode 
                                                                            ? 'No se encontraron materiales disponibles que coincidan con su búsqueda.'
                                                                            : 'No hay materiales disponibles en este momento.'
                                                                        }
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Paginación */}
                                            {totalPages > 1 && (
                                                <nav aria-label="Paginación de materiales">
                                                    <ul className="pagination justify-content-center">
                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                type="button"
                                                                className="page-link"
                                                                onClick={(e) => handlePageChange(e, currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                            >
                                                                <i className="bi bi-chevron-left"></i>
                                                            </button>
                                                        </li>
                                                        
                                                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                                            const pageNum = Math.max(1, currentPage - 2) + index;
                                                            if (pageNum <= totalPages) {
                                                                return (
                                                                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                                        <button
                                                                            type="button"
                                                                            className="page-link"
                                                                            onClick={(e) => handlePageChange(e, pageNum)}
                                                                        >
                                                                            {pageNum}
                                                                        </button>
                                                                    </li>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                        
                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                type="button"
                                                                className="page-link"
                                                                onClick={(e) => handlePageChange(e, currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                            >
                                                                <i className="bi bi-chevron-right"></i>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            )}
                                        </div>
                                    </div>

                                    {/* Columna derecha: Material seleccionado, observaciones y botones */}
                                    <div className="col-md-4">
                                        <form onSubmit={handleSubmit}>
                                            {/* Material seleccionado - Vista detallada */}
                                            {selectedMaterial && (
                                                <div className="mb-4">
                                                    <label className="form-label">Material seleccionado</label>
                                                    <div className="card border-success">
                                                        <div className="card-body p-3">
                                                            <h6 className="card-title mb-2">{selectedMaterial.titulo}</h6>
                                                            <p className="card-text mb-1">
                                                                <strong>Autor:</strong> {selectedMaterial.autor}
                                                            </p>
                                                            <p className="card-text mb-1">
                                                                <strong>Disponibles:</strong> {selectedMaterial.cantidad}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <label htmlFor="observaciones" className="form-label">
                                                    Observaciones (opcional)
                                                </label>
                                                <textarea
                                                    id="observaciones"
                                                    className="form-control"
                                                    rows={4}
                                                    value={observaciones}
                                                    onChange={(e) => setObservaciones(e.target.value)}
                                                    placeholder="Añada cualquier observación o comentario sobre su solicitud"
                                                />
                                            </div>

                                                <div className="d-grid gap-2">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-lg"
                                                        disabled={submitting || !selectedMaterial || !userData}
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                Enviando solicitud...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-send me-2"></i>
                                                                Enviar Solicitud
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => navigate('/user-dashboard')}
                                                >
                                                    <i className="bi bi-arrow-left me-2"></i>
                                                    Volver al Dashboard
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMaterialRequest;