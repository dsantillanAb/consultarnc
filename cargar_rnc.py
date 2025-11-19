import psycopg2
import csv
from psycopg2.extras import execute_batch

# Conexión a la base de datos
conn_string = "postgresql://neondb_owner:npg_7ByhGQF5UXKv@ep-solitary-queen-a4r4gifr-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

def crear_tabla(cursor):
    """Crea la tabla si no existe"""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rnc_contribuyentes (
            id SERIAL PRIMARY KEY,
            rnc VARCHAR(20) NOT NULL,
            razon_social VARCHAR(500),
            actividad_economica VARCHAR(500),
            fecha_inicio_operaciones VARCHAR(50),
            estado VARCHAR(50),
            regimen_pago VARCHAR(50),
            fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_rnc ON rnc_contribuyentes(rnc);
        CREATE INDEX IF NOT EXISTS idx_estado ON rnc_contribuyentes(estado);
    """)
    print("✓ Tabla creada/verificada")

def cargar_datos(cursor, archivo_csv):
    """Carga los datos del CSV a la base de datos"""
    # Intentar con diferentes encodings
    encodings = ['latin-1', 'iso-8859-1', 'cp1252', 'utf-8']
    f = None
    
    for encoding in encodings:
        try:
            f = open(archivo_csv, 'r', encoding=encoding)
            f.read()
            f.seek(0)
            print(f"✓ Archivo leído con encoding: {encoding}")
            break
        except UnicodeDecodeError:
            if f:
                f.close()
            continue
    
    if f is None:
        raise Exception("No se pudo determinar el encoding del archivo")
    
    with f:
        reader = csv.DictReader(f, delimiter=';')
        
        # Preparar datos en lotes
        batch = []
        batch_size = 1000
        total = 0
        
        for row in reader:
            batch.append((
                row['RNC'],
                row['RAZÓN SOCIAL'],
                row['ACTIVIDAD ECONÓMICA'],
                row['FECHA DE INICIO OPERACIONES'],
                row['ESTADO'],
                row['RÉGIMEN DE PAGO']
            ))
            
            if len(batch) >= batch_size:
                execute_batch(cursor, """
                    INSERT INTO rnc_contribuyentes 
                    (rnc, razon_social, actividad_economica, fecha_inicio_operaciones, estado, regimen_pago)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, batch)
                total += len(batch)
                print(f"Insertados {total} registros...")
                batch = []
        
        # Insertar el último lote
        if batch:
            execute_batch(cursor, """
                INSERT INTO rnc_contribuyentes 
                (rnc, razon_social, actividad_economica, fecha_inicio_operaciones, estado, regimen_pago)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, batch)
            total += len(batch)
        
        print(f"✓ Total de registros insertados: {total}")

def main():
    try:
        print("Conectando a la base de datos...")
        conn = psycopg2.connect(conn_string)
        cursor = conn.cursor()
        
        print("Creando tabla...")
        crear_tabla(cursor)
        conn.commit()
        
        print("Cargando datos del CSV...")
        cargar_datos(cursor, 'RNC ACTIVOS/RNC_Contribuyentes_Actualizado_15_Nov_2025.csv')
        conn.commit()
        
        # Verificar cantidad de registros
        cursor.execute("SELECT COUNT(*) FROM rnc_contribuyentes")
        count = cursor.fetchone()[0]
        print(f"\n✓ Proceso completado exitosamente!")
        print(f"Total de registros en la base de datos: {count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"✗ Error: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    main()
