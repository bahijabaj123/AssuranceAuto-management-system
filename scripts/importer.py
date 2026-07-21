# import_clean_fixed.py
import pandas as pd
import pymysql
import os
import warnings
warnings.filterwarnings('ignore')

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'carte_gestion_dossiers',
    'charset': 'utf8mb4'
}

INPUT_FOLDER = r'C:\Users\benab\Desktop\fichiers_excel'

# ============================================
# FONCTIONS DE BASE
# ============================================

def clean_date(val):
    if pd.isna(val) or str(val).strip() == '':
        return None
    if '/' in str(val) and len(str(val)) == 10:
        parts = str(val).split('/')
        if len(parts) == 3 and parts[2].isdigit():
            try:
                return f"{parts[2]}-{parts[1]}-{parts[0]}"
            except:
                pass
    return str(val) if not pd.isna(val) else None

def safe_float(val):
    if pd.isna(val) or str(val).strip() == '':
        return None
    try:
        return float(str(val).replace(',', '.'))
    except:
        return None

def safe_int(val):
    if pd.isna(val) or str(val).strip() == '':
        return None
    try:
        return int(float(str(val).replace(',', '.')))
    except:
        return None

def is_empty_row(vals):
    for v in vals:
        if str(v).strip() not in ['', 'nan', 'NaN', 'None', 'NULL']:
            return False
    return True

def safe_str(val):
    if pd.isna(val) or str(val).strip() == '':
        return None
    return str(val).strip()

# ============================================
# PROCESSORS AVEC NOM_TIERS
# ============================================

def process_donnees_sinistres(df, id_utilisateur=1):
    """
    Import des données sinistres avec nom_tiers
    Les colonnes attendues : SIN, NBR JR, IPP, REG_*, etc.
    """
    result = []
    
    # Identifier les colonnes (basé sur le fichier CSV)
    cols = df.columns.tolist()
    
    for _, row in df.iterrows():
        vals = row.values
        if is_empty_row(vals):
            continue
            
        sin = safe_str(vals[0]) if len(vals) > 0 else None
        if not sin:
            continue
            
        # Extraire les données
        sinistre = {
            'sin': sin,
            'nom_tiers': None,  # ✅ NULL pour les anciennes données
            'annee': safe_int(vals[1]) if len(vals) > 1 else None,
            'nbr_jrs': safe_str(vals[2]) if len(vals) > 2 else None,
            'ipp': safe_str(vals[3]) if len(vals) > 3 else None,
            'rcc': safe_float(vals[4]) if len(vals) > 4 else None,
            'rcm': safe_float(vals[5]) if len(vals) > 5 else None,
            'dommages_vehicules': safe_float(vals[6]) if len(vals) > 6 else None,
            'bris_glaces': safe_float(vals[7]) if len(vals) > 7 else None,
            'dom_collision': safe_float(vals[8]) if len(vals) > 8 else None,
            'dommage': safe_float(vals[9]) if len(vals) > 9 else None,
            'vol': safe_float(vals[10]) if len(vals) > 10 else None,
            'inc': safe_float(vals[11]) if len(vals) > 11 else None,
            'afp': safe_float(vals[12]) if len(vals) > 12 else None,
            'aux': safe_float(vals[13]) if len(vals) > 13 else None,
            'reg_rcc': safe_float(vals[14]) if len(vals) > 14 else None,
            'reg_rcm': safe_float(vals[15]) if len(vals) > 15 else None,
            'reg_dommages_vehicules': safe_float(vals[16]) if len(vals) > 16 else None,
            'reg_bris_glaces': safe_float(vals[17]) if len(vals) > 17 else None,
            'reg_dom_collision': safe_float(vals[18]) if len(vals) > 18 else None,
            'reg_dommage': safe_float(vals[19]) if len(vals) > 19 else None,
            'reg_vol': safe_float(vals[20]) if len(vals) > 20 else None,
            'reg_inc': safe_float(vals[21]) if len(vals) > 21 else None,
            'reg_afp': safe_float(vals[22]) if len(vals) > 22 else None,
            'reg_aux': safe_float(vals[23]) if len(vals) > 23 else None,
        }
        result.append(sinistre)
    
    return pd.DataFrame(result)


def process_donnees_sinistres_avec_tiers(df):
    """
    Import des données sinistres AVEC nom_tiers (nouveau format)
    Les colonnes attendues : SIN, NOM_TIERS, NBR JR, IPP, REG_*, etc.
    """
    result = []
    
    for _, row in df.iterrows():
        vals = row.values
        if is_empty_row(vals):
            continue
            
        sin = safe_str(vals[0]) if len(vals) > 0 else None
        if not sin:
            continue
            
        # ✅ Extraire le nom du tiers (colonne 1)
        nom_tiers = safe_str(vals[1]) if len(vals) > 1 else None
        
        sinistre = {
            'sin': sin,
            'nom_tiers': nom_tiers,  # ✅ Nom du tiers
            'annee': safe_int(vals[2]) if len(vals) > 2 else None,
            'nbr_jrs': safe_str(vals[3]) if len(vals) > 3 else None,
            'ipp': safe_str(vals[4]) if len(vals) > 4 else None,
            'rcc': safe_float(vals[5]) if len(vals) > 5 else None,
            'rcm': safe_float(vals[6]) if len(vals) > 6 else None,
            'dommages_vehicules': safe_float(vals[7]) if len(vals) > 7 else None,
            'bris_glaces': safe_float(vals[8]) if len(vals) > 8 else None,
            'dom_collision': safe_float(vals[9]) if len(vals) > 9 else None,
            'dommage': safe_float(vals[10]) if len(vals) > 10 else None,
            'vol': safe_float(vals[11]) if len(vals) > 11 else None,
            'inc': safe_float(vals[12]) if len(vals) > 12 else None,
            'afp': safe_float(vals[13]) if len(vals) > 13 else None,
            'aux': safe_float(vals[14]) if len(vals) > 14 else None,
            'reg_rcc': safe_float(vals[15]) if len(vals) > 15 else None,
            'reg_rcm': safe_float(vals[16]) if len(vals) > 16 else None,
            'reg_dommages_vehicules': safe_float(vals[17]) if len(vals) > 17 else None,
            'reg_bris_glaces': safe_float(vals[18]) if len(vals) > 18 else None,
            'reg_dom_collision': safe_float(vals[19]) if len(vals) > 19 else None,
            'reg_dommage': safe_float(vals[20]) if len(vals) > 20 else None,
            'reg_vol': safe_float(vals[21]) if len(vals) > 21 else None,
            'reg_inc': safe_float(vals[22]) if len(vals) > 22 else None,
            'reg_afp': safe_float(vals[23]) if len(vals) > 23 else None,
            'reg_aux': safe_float(vals[24]) if len(vals) > 24 else None,
        }
        result.append(sinistre)
    
    return pd.DataFrame(result)


def clear_table(table_name):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f"DELETE FROM {table_name}")
        conn.commit()
        print(f"   🗑️ Table {table_name} vidée")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


def get_connection():
    return pymysql.connect(**DB_CONFIG)


def read_file(filepath, skip_rows=0):
    encodings = ['utf-8-sig', 'utf-8', 'latin1', 'iso-8859-1', 'windows-1252']
    for enc in encodings:
        try:
            df = pd.read_csv(
                filepath,
                sep=';',
                encoding=enc,
                dtype=str,
                keep_default_na=False,
                engine='python',
                skiprows=skip_rows,
                on_bad_lines='skip'
            )
            if len(df) > 0:
                print(f"   📝 Encodage: {enc}")
                return df
        except:
            continue
    raise Exception("Impossible de lire le fichier")


def import_to_mysql(df, table_name):
    if len(df) == 0:
        print(f"   ⚠️ Aucune donnée")
        return 0
    
    df = df.replace({pd.NA: None, '': None, 'NULL': None})
    
    columns = df.columns.tolist()
    print(f"   📊 {len(df)} lignes")
    print(f"   📝 Colonnes: {columns}")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    placeholders = ', '.join(['%s'] * len(columns))
    columns_str = ', '.join(columns)
    insert_query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"
    
    data = [tuple(row) for row in df.values]
    
    total = 0
    for i in range(0, len(data), 100):
        batch = data[i:i+100]
        try:
            cursor.executemany(insert_query, batch)
            conn.commit()
            total += len(batch)
        except Exception as e:
            print(f"   ⚠️ Erreur batch: {e}")
            for row in batch:
                try:
                    cursor.execute(insert_query, row)
                    conn.commit()
                    total += 1
                except Exception as e2:
                    print(f"   ❌ Erreur ligne: {e2}")
                    pass
    
    cursor.close()
    conn.close()
    print(f"   ✅ {total} lignes importées")
    return total


# ============================================
# MAIN
# ============================================

def main():
    print("=" * 70)
    print("🚀 IMPORT DES DONNÉES SINISTRES AVEC NOM_TIERS")
    print("=" * 70)
    print()
    
    # Configuration : (filename, skip_rows, processor, use_old_data)
    files = [
        ('donnees_sinistres_2022.csv', 0, process_donnees_sinistres, True),
        ('donnees_sinistres_2023.csv', 0, process_donnees_sinistres, True),
        ('donnees_sinistres_2024.csv', 0, process_donnees_sinistres, True),
        ('donnees_sinistres_2025.csv', 0, process_donnees_sinistres, True),
        ('donnees_sinistres_2026.csv', 0, process_donnees_sinistres, True),
        # ✅ Nouveaux fichiers avec nom_tiers
        ('donnees_sinistres_2026_tiers.csv', 0, process_donnees_sinistres_avec_tiers, False),
    ]
    
    total_global = 0
    
    # Vider la table avant import
    print("🔄 Vidage de la table donnees_sinistres...")
    clear_table('donnees_sinistres')
    print()
    
    for filename, skip, processor, is_old in files:
        filepath = os.path.join(INPUT_FOLDER, filename)
        
        if not os.path.exists(filepath):
            print(f"⚠️ Fichier introuvable: {filename}")
            continue
        
        print(f"\n📁 {filename}")
        print(f"   Type: {'Ancien (sans tiers)' if is_old else 'Nouveau (avec tiers)'}")
        
        try:
            df = read_file(filepath, skip)
            print(f"   📊 {len(df)} lignes lues")
            
            processed_df = processor(df)
            count = import_to_mysql(processed_df, 'donnees_sinistres')
            total_global += count
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
    
    print("\n" + "=" * 70)
    print(f"✅ TOTAL: {total_global} lignes importées")
    print("=" * 70)

if __name__ == "__main__":
    main()