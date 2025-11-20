from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List

app = FastAPI(title="API RNC Dominicana", version="1.0.0")

# CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión a la base de datos
#CONN_STRING = ""

def get_db_connection():
    return psycopg2.connect(CONN_STRING, cursor_factory=RealDictCursor)

class Contribuyente(BaseModel):
    id: int
    rnc: str
    razon_social: Optional[str]
    actividad_economica: Optional[str]
    fecha_inicio_operaciones: Optional[str]
    estado: Optional[str]
    regimen_pago: Optional[str]

@app.get("/")
def root():
    return {
        "mensaje": "API RNC Dominicana",
        "version": "1.0.0",
        "endpoints": {
            "/rnc/{numero}": "Buscar por RNC",
            "/buscar": "Buscar por razón social",
            "/stats": "Estadísticas generales"
        }
    }

@app.get("/rnc/{numero}", response_model=Contribuyente)
def buscar_por_rnc(numero: str):
    """Buscar contribuyente por número de RNC"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM rnc_contribuyentes WHERE rnc = %s LIMIT 1",
        (numero,)
    )
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="RNC no encontrado")
    
    return result

@app.get("/buscar", response_model=List[Contribuyente])
def buscar_por_razon_social(q: str, limit: int = 10):
    """Buscar contribuyentes por razón social"""
    if len(q) < 3:
        raise HTTPException(status_code=400, detail="La búsqueda debe tener al menos 3 caracteres")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        """SELECT * FROM rnc_contribuyentes 
           WHERE razon_social ILIKE %s 
           ORDER BY razon_social
           LIMIT %s""",
        (f"%{q}%", limit)
    )
    results = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return results

@app.get("/stats")
def estadisticas():
    """Obtener estadísticas generales"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM rnc_contribuyentes")
    total = cursor.fetchone()['total']
    
    cursor.execute("""
        SELECT estado, COUNT(*) as cantidad 
        FROM rnc_contribuyentes 
        GROUP BY estado
    """)
    por_estado = cursor.fetchall()
    
    cursor.execute("""
        SELECT regimen_pago, COUNT(*) as cantidad 
        FROM rnc_contribuyentes 
        GROUP BY regimen_pago
        ORDER BY cantidad DESC
    """)
    por_regimen = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return {
        "total_contribuyentes": total,
        "por_estado": por_estado,
        "por_regimen": por_regimen
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
