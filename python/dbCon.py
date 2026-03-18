import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', 5432)
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def test_connection():
    conn = get_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM athletes")
        count = cursor.fetchone()[0]
        print(f"✅ Connected! Found {count} athletes in database")
        
        cursor.close()
        conn.close()
        return True
    else:
        print("❌ Connection failed!")
        return False

if __name__ == "__main__":
    test_connection()