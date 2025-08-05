import sqlite3
import pymysql

# urações do SQLite (substitua pelo seu arquivo .sqlite)
sqlite_db = 'database.sqlite'  # Nome do seu arquivo SQLite

# urações do MySQL (substitua com os dados do Hostinger)
mysql_ = {
    'host': 'localhost',       # Geralmente é "localhost" no Hostinger
    'user': 'u530864919_leocompasso',     # Ex.: "u123456789_user"
    'password': '',   # Senha do banco de dados
    'database': 'u530864919_mandalaraiz',  # Ex.: "u123456789_meubanco"
}

# Conectar ao SQLite
sqlite_conn = sqlite3.connect(sqlite_db)
sqlite_cursor = sqlite_conn.cursor()

# Conectar ao MySQL
try:
    mysql_conn = pymysql.connect(**mysql_)
    mysql_cursor = mysql_conn.cursor()
    print("✅ Conexão com MySQL estabelecida!")
except Exception as e:
    print(f"❌ Erro ao conectar ao MySQL: {e}")
    exit()

# Listar todas as tabelas do SQLite
sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = sqlite_cursor.fetchall()

# Migrar cada tabela para o MySQL
for table in tables:
    table_name = table[0]
    print(f"🔄 Migrando tabela: {table_name}...")

    # Obter estrutura da tabela (schema)
    sqlite_cursor.execute(f"PRAGMA table_info({table_name})")
    columns = sqlite_cursor.fetchall()
    
    # Criar comando SQL para MySQL (ajustando tipos de dados)
    create_table_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ("
    for col in columns:
        col_name = col[1]
        col_type = col[2].upper()
        
        # Ajustar tipos de dados para MySQL
        if 'INT' in col_type:
            mysql_type = 'INT'
        elif 'TEXT' in col_type or 'CHAR' in col_type:
            mysql_type = 'VARCHAR(255)'
        elif 'REAL' in col_type or 'FLOAT' in col_type:
            mysql_type = 'FLOAT'
        else:
            mysql_type = 'TEXT'  # Padrão
        
        create_table_sql += f"{col_name} {mysql_type}, "
    
    create_table_sql = create_table_sql.rstrip(', ') + ")"
    
    # Criar tabela no MySQL
    try:
        mysql_cursor.execute(f"DROP TABLE IF EXISTS {table_name}")  # Remove se já existir
        mysql_cursor.execute(create_table_sql)
        print(f"✅ Tabela {table_name} criada no MySQL!")
    except Exception as e:
        print(f"❌ Erro ao criar tabela {table_name}: {e}")
        continue

    # Inserir dados da tabela SQLite no MySQL
    sqlite_cursor.execute(f"SELECT * FROM {table_name}")
    rows = sqlite_cursor.fetchall()
    
    for row in rows:
        placeholders = ', '.join(['%s'] * len(row))
        insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders})"
        try:
            mysql_cursor.execute(insert_sql, row)
        except Exception as e:
            print(f"❌ Erro ao inserir dados em {table_name}: {e}")
    
    mysql_conn.commit()
    print(f"✅ Dados da tabela {table_name} migrados com sucesso!")

# Fechar conexões
mysql_conn.close()
sqlite_conn.close()
print("🎉 Migração concluída!")