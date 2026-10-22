import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "conceptclear.db")
if not os.path.exists(db_path):
    db_path = "conceptclear.db"

print("Connecting to:", db_path)
con = sqlite3.connect(db_path)
cur = con.cursor()

columns = [
    ("concepts", "subject", "TEXT DEFAULT 'Mathematics'"),
    ("questions", "subject", "TEXT DEFAULT 'Mathematics'"),
    ("lessons", "subject", "TEXT DEFAULT 'Mathematics'"),
    ("lessons", "steps_json", "TEXT DEFAULT '[]'"),
    ("tests", "subject", "TEXT DEFAULT 'Mathematics'"),
]

for table, col, col_type in columns:
    try:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type};")
        print(f"Added {col} to {table}")
    except Exception as e:
        print(f"Skip {table}.{col}: {e}")

con.commit()
con.close()
print("Migration done!")
