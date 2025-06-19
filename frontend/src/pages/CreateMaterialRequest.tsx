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
    const [iconsReady, setIconsReady] = useState(false);
    
    // Estados para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [isSearchMode, setIsSearchMode] = useState(false);

    useEffect(() => {
        // Asegurar que los iconos estén cargados
        const timer = setTimeout(() => {
            setIconsReady(true);
        }, 100);

        fetchUserData();
        loadInitialMaterials();

        return () => clearTimeout(timer);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                size: '6',
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
            console.log(user)
            // Usar la misma lógica de MaterialsManagement
            const params = new URLSearchParams({
                page: page.toString(),
                size: '6',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } catch (err: unknown) {
            console.error('❌ Error completo:', err);
            
            // Type guard to check if err is an axios error
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { detail?: string }; status?: number } };
                console.error('❌ Error response:', axiosError.response?.data);
                console.error('❌ Error status:', axiosError.response?.status);

                if (axiosError.response?.data?.detail) {
                    setError(`Error: ${axiosError.response.data.detail}`);
                } else if (axiosError.response?.status === 400) {
                    setError('Error: El material no está disponible o no tiene ejemplares suficientes.');
                } else {
                    setError('Error al crear la solicitud. Por favor, inténtelo de nuevo.');
                }
            } else {
                setError('Error al crear la solicitud. Por favor, inténtelo de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!iconsReady) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted">Preparando interfaz...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
            {/* Header */}
            <div className="bg-white shadow-sm border-bottom">
                <div className="container py-2">
                    <div className="d-flex align-items-center">
                        <button 
                            className="btn btn-outline-secondary btn-sm me-2" 
                            onClick={() => navigate('/user-dashboard')}
                            title="Volver"
                        >
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div>
                            <h5 className="mb-0">Solicitar Material</h5>
                            <small className="text-muted">Selecciona un material y envía tu solicitud</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-3">
                {success ? (
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="alert alert-success text-center" role="alert">
                                <i className="bi bi-check-circle display-6 text-success mb-3"></i>
                                <h5>¡Solicitud enviada correctamente!</h5>
                                <p className="mb-0">Será redirigido a sus solicitudes en unos segundos.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3">
                        {/* Columna izquierda: Búsqueda y materiales */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-3">
                                    {error && (
                                        <div className="alert alert-danger alert-dismissible" role="alert">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {error}
                                        </div>
                                    )}

                                    {/* Búsqueda */}
                                    <div className="mb-3">
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text">
                                                <i className="bi bi-search"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Buscar material por título..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            {searching && (
                                                <span className="input-group-text">
                                                    <div className="spinner-border spinner-border-sm" role="status">
                                                        <span className="visually-hidden">Buscando...</span>
                                                    </div>
                                                </span>
                                            )}
                                        </div>
                                        {isSearchMode && (
                                            <small className="text-muted">
                                                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                                            </small>
                                        )}
                                    </div>

                                    {/* Encabezado de materiales */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">
                                            <i className="bi bi-collection me-1"></i>
                                            {isSearchMode ? 'Resultados de búsqueda' : 'Materiales disponibles'}
                                        </h6>

                                    </div>

                                    {/* Lista de materiales - Cards para móvil */}
                                    <div className="d-md-none">
                                        {materials.length > 0 ? (
                                            materials.map((material) => (
                                                <div 
                                                    key={material.id} 
                                                    className={`card mb-2 ${selectedMaterial?.id === material.id ? 'border-success bg-success bg-opacity-10' : 'border-light'}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleMaterialSelect(material)}
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div className="flex-grow-1">
                                                                <h6 className="mb-1">{material.titulo}</h6>
                                                                <p className="text-muted small mb-2">{material.autor}</p>
                                                                <span className="badge bg-success">{material.cantidad} disponibles</span>
                                                            </div>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="selectedMaterial"
                                                                    checked={selectedMaterial?.id === material.id}
                                                                    onChange={() => handleMaterialSelect(material)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-muted">
                                                <i className="bi bi-search display-6 mb-2"></i>
                                                <p>{isSearchMode 
                                                    ? 'No se encontraron materiales disponibles'
                                                    : 'No hay materiales disponibles'
                                                }</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tabla para desktop */}
                                    <div className="d-none d-md-block">
                                        <div className="table-responsive">
                                            <table className="table table-hover table-sm align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{width: '40px'}}></th>
                                                        <th style={{width: '40%'}}>Título</th>
                                                        <th style={{width: '35%'}}>Autor</th>
                                                        <th style={{width: '25%'}}>Disponibles</th>
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
                                                                <td>
                                                                    <div className="text-truncate fw-medium" style={{ maxWidth: '250px' }} title={material.titulo}>
                                                                        {material.titulo}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate text-muted" style={{ maxWidth: '200px' }} title={material.autor}>
                                                                        {material.autor}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-success">
                                                                        {material.cantidad}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-center py-4 text-muted">
                                                                <i className="bi bi-search me-2"></i>
                                                                {isSearchMode 
                                                                    ? 'No se encontraron materiales disponibles'
                                                                    : 'No hay materiales disponibles'
                                                                }
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Paginación */}
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-3">
                                            <nav>
                                                <ul className="pagination pagination-sm mb-0">
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha: Formulario de solicitud */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm sticky-top" style={{top: '1rem'}}>
                                <div className="card-body p-3">
                                    <form onSubmit={handleSubmit}>
                                        <h6 className="mb-3">
                                            <i className="bi bi-send me-1"></i>
                                            Enviar Solicitud
                                        </h6>

                                        {/* Material seleccionado */}
                                        {selectedMaterial ? (
                                            <div className="mb-3">
                                                <label className="form-label small fw-medium">Material seleccionado</label>
                                                <div className="border rounded p-2 bg-light">
                                                    <div className="fw-medium small">{selectedMaterial.titulo}</div>
                                                    <div className="text-muted small">
                                                        <i className="bi bi-person me-1"></i>
                                                        {selectedMaterial.autor}
                                                    </div>
                                                    <div className="text-success small">
                                                        <i className="bi bi-check-circle me-1"></i>
                                                        {selectedMaterial.cantidad} disponibles
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-3">
                                                <div className="border rounded p-3 text-center text-muted">
                                                    <i className="bi bi-arrow-left-circle me-2"></i>
                                                    <small>Selecciona un material de la lista</small>
                                                </div>
                                            </div>
                                        )}

                                        {/* Observaciones */}
                                        <div className="mb-3">
                                            <label htmlFor="observaciones" className="form-label small fw-medium">
                                                Observaciones <span className="text-muted">(opcional)</span>
                                            </label>
                                            <textarea
                                                id="observaciones"
                                                className="form-control form-control-sm"
                                                rows={3}
                                                value={observaciones}
                                                onChange={(e) => setObservaciones(e.target.value)}
                                                placeholder="Comentarios adicionales..."
                                            />
                                        </div>

                                        {/* Botones */}
                                        <div className="d-grid gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={submitting || !selectedMaterial || !userData}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Enviando...</span>
                                                        </div>
                                                        Enviando...
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
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => navigate('/user-dashboard')}
                                            >
                                                <i className="bi bi-arrow-left me-1"></i>
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {loading && materials.length === 0 && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="bg-white rounded p-4 text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mb-0">Cargando materiales disponibles...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateMaterialRequest;