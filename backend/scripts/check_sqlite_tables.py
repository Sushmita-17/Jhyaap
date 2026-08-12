import sqlite3

DB_PATH = 'backend/data/jhyaap.db'

def check_sqlite_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print('SQLite tables:')
    for table in tables:
        print(f'  - {table[0]}')
    
    conn.close()

if __name__ == "__main__":
    check_sqlite_tables()
