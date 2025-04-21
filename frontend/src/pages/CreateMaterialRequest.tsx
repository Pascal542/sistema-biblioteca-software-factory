import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


interface Material {
    id: number;
    titulo: string;
    autor: string;
    tipo: string;
    cantidad_disponible?: number;
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
    const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([fetchUserData(), fetchAvailableMaterials()]);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error al cargar los datos iniciales.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserData(response.data);
        } catch (err: unknown) {
            console.error('Error fetching user data:', err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.');
            } else {
                console.log(user);
                setError('Error al obtener los datos del usuario. Intente nuevamente.');
            }
        }
    };

    const fetchAvailableMaterials = async () => {
        try {
            const response = await axios.get('/api/materiales/disponibles');
            const availableMaterials = response.data.filter(
                (material: Material) => material.cantidad_disponible && material.cantidad_disponible > 0
            );
            setMaterials(availableMaterials);
        } catch (err) {
            console.error('Error fetching materials:', err);
            setError('Error al cargar los materiales disponibles.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedMaterial === null) {
            setError('Por favor, seleccione un material.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await axios.post('/api/solicitudes', {
                id: userData?.id,
                nombre_usuario: userData?.nombre,
                carne_identidad: userData?.carne_identidad,
                direccion_usuario: userData?.direccion,
                material_id: selectedMaterial,
                observaciones: observaciones || undefined,
            });

            setSuccess(true);
            setSelectedMaterial(null);
            setObservaciones('');

            setTimeout(() => {
                navigate('/my-requests');
            }, 2000);
        } catch (err) {
            console.error('Error creating request:', err);
            setError('Error al crear la solicitud. Por favor, inténtelo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
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
                <div className="col-md-8 mx-auto">
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
                                <form onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="alert alert-danger" role="alert" aria-live="assertive">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {error}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="materialSelect" className="form-label">
                                            Material a solicitar
                                        </label>
                                        <select
                                            id="materialSelect"
                                            className="form-select"
                                            value={selectedMaterial !== null ? String(selectedMaterial) : ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                console.log("Selected value:", value);
                                                setSelectedMaterial(value !== '' ? Number(value) : null);
                                            }}
                                            required
                                        >
                                            <option value="">-- Seleccione un material --</option>
                                            {materials.map((material, index) => {
                                                console.log("Material in render:", material);
                                                return (
                                                    <option
                                                        key={`material-index-${index}`}
                                                        value={material.id !== undefined ? String(material.id) : `${index}`}
                                                    >
                                                        {material.titulo || 'Sin título'} - {material.autor || 'Autor desconocido'} ({material.tipo || 'Sin tipo'})
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="observaciones" className="form-label">
                                            Observaciones (opcional)
                                        </label>
                                        <textarea
                                            id="observaciones"
                                            className="form-control"
                                            rows={3}
                                            value={observaciones}
                                            onChange={(e) => setObservaciones(e.target.value)}
                                            placeholder="Añada cualquier observación o comentario sobre su solicitud"
                                        />
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                                            {submitting ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
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
                                            className="btn btn-outline-secondary"
                                            onClick={() => navigate('/user-dashboard')}
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Volver
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMaterialRequest;