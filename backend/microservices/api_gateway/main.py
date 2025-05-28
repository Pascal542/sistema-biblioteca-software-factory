from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="API Gateway")

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URLs de los servicios
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
MATERIAL_SERVICE_URL = os.getenv("MATERIAL_SERVICE_URL", "http://localhost:8002")
LOAN_SERVICE_URL = os.getenv("LOAN_SERVICE_URL", "http://localhost:8003")
REQUEST_SERVICE_URL = os.getenv("REQUEST_SERVICE_URL", "http://localhost:8004")

@app.get("/")
async def read_root():
    logger.info("Root endpoint del API Gateway accedido")
    return {"message": "Welcome to the Library API Gateway"}

# Proxy para autenticación y usuarios - agregando prefijo /api
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_proxy(request: Request, path: str):
    target_url = f"{AUTH_SERVICE_URL}/{path}"
    logger.info(f"Redirigiendo auth request: {request.method} /api/auth/{path} -> {target_url}")
    return await proxy_request(request, target_url)

@app.api_route("/api/usuarios/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def usuarios_proxy(request: Request, path: str):
    return await proxy_request(request, f"{AUTH_SERVICE_URL}/usuarios/{path}")

# Ruta adicional para usuarios sin path
@app.api_route("/api/usuarios", methods=["GET", "POST", "PUT", "DELETE"])
async def usuarios_proxy_root(request: Request):
    return await proxy_request(request, f"{AUTH_SERVICE_URL}/usuarios")

# Proxy para materiales
@app.api_route("/api/materiales/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def materiales_proxy(request: Request, path: str):
    return await proxy_request(request, f"{MATERIAL_SERVICE_URL}/materiales/{path}")

@app.api_route("/api/materiales", methods=["GET", "POST", "PUT", "DELETE"])
async def materiales_proxy_root(request: Request):
    return await proxy_request(request, f"{MATERIAL_SERVICE_URL}/materiales")

# Proxy para préstamos
@app.api_route("/api/prestamos/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def prestamos_proxy(request: Request, path: str):
    return await proxy_request(request, f"{LOAN_SERVICE_URL}/prestamos/{path}")

@app.api_route("/api/prestamos", methods=["GET", "POST", "PUT", "DELETE"])
async def prestamos_proxy_root(request: Request):
    return await proxy_request(request, f"{LOAN_SERVICE_URL}/prestamos")

# Proxy para solicitudes de préstamo
@app.api_route("/api/solicitudes/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def solicitudes_proxy(request: Request, path: str):
    return await proxy_request(request, f"{REQUEST_SERVICE_URL}/solicitudes/{path}")

@app.api_route("/api/solicitudes", methods=["GET", "POST", "PUT", "DELETE"])
async def solicitudes_proxy_root(request: Request):
    return await proxy_request(request, f"{REQUEST_SERVICE_URL}/solicitudes")

# Función para reenviar solicitudes
async def proxy_request(request: Request, url: str):
    method = request.method
    headers = {key: value for key, value in request.headers.items() if key.lower() != 'host'}
    params = dict(request.query_params)
    body = await request.body()
    
    logger.info(f"📡 Proxying request:")
    logger.info(f"   Method: {method}")
    logger.info(f"   URL: {url}")
    logger.info(f"   Headers: {list(headers.keys())}")
    logger.info(f"   Body size: {len(body)} bytes")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method,
                url,
                headers=headers,
                params=params,
                content=body,
                timeout=30.0
            )
            
            logger.info(f" rpta:")
            logger.info(f"   Status: {response.status_code}")
            logger.info(f"   Content-Type: {response.headers.get('content-type')}")
            logger.info(f"   Content size: {len(response.content)} bytes")
            
            content = response.content
            
            return Response(
                content=content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get('content-type')
            )
        except httpx.RequestError as exc:
            logger.error(f"Error al comunicarse con el servicio: {str(exc)}")
            raise HTTPException(status_code=503, detail=f"Error al comunicarse con el servicio: {str(exc)}")