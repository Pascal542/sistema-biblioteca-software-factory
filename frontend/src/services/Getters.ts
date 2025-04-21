import axios from 'axios';
import { BACKEND } from '../utils/conexion';

export const getMaterials = async () => {
  const response = await axios.get(BACKEND);
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
    const response = await fetch(`${BACKEND}/revistas/solicitudes`);
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching revista requests:', error);
    throw error;
  }
};

export const getUsers = async () => {
  const response = await axios.get(BACKEND);
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await axios.get(`${BACKEND}/${id}`);
  return response.data;
};

export const getMaterialRequests = async (estado?: string) => {
  const url = estado ? `/api/solicitudes?estado=${estado}` : '/api/solicitudes';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const getUserRequests = async (carneIdentidad: string) => {
  const response = await fetch(`/api/solicitudes/cliente/${carneIdentidad}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const createMaterialRequest = async (requestData: {
  nombre_usuario: string;
  carne_identidad: string;
  direccion_usuario: string;
  material_id: number;
  observaciones?: string;
}) => {
  const response = await fetch('/api/solicitudes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const updateRequestStatus = async (
  requestId: number, 
  status: string, 
  observaciones?: string
) => {
  const response = await fetch(`/api/solicitudes/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      estado: status,
      observaciones
    }),
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};