import api from './axiosInstance';

export const getMaterials = async () => {
  const response = await api.get('/materiales');
  return response.data;
};

interface RevistaRequest {
  id: number;
  title: string;
  requestDate: string;
  status: string;
}

export const getRevistaRequests = async (): Promise<RevistaRequest[]> => {
  try {
    const response = await api.get('/materiales/revistas/solicitudes');
    return response.data;
  } catch (error) {
    console.error('Error fetching revista requests:', error);
    throw error;
  }
};

export const getUsers = async () => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

export const getMaterialRequests = async (estado?: string) => {
  const url = estado ? `/solicitudes?estado=${estado}` : '/solicitudes';
  const response = await api.get(url);
  return response.data;
};

export const getUserRequests = async (carneIdentidad: string) => {
  const response = await api.get(`/solicitudes/cliente/${carneIdentidad}`);
  return response.data;
};

export const createMaterialRequest = async (requestData: {
  nombre_usuario: string;
  carne_identidad: string;
  direccion_usuario: string;
  material_id: number;
  observaciones?: string;
}) => {
  const response = await api.post('/solicitudes', requestData);
  return response.data;
};

export const updateRequestStatus = async (
  requestId: number, 
  status: string, 
  observaciones?: string
) => {
  const response = await api.put(`/solicitudes/${requestId}`, { 
    estado: status,
    observaciones
  });
  return response.data;
};