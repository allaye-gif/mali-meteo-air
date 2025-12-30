import sys
import json
import subprocess
import shutil
import os
from datetime import datetime, timedelta

# --- 0. CORRECTION ENCODAGE WINDOWS (CRUCIAL) ---
# Force la sortie standard en UTF-8 pour que Node.js lise bien les données
sys.stdout.reconfigure(encoding='utf-8')

# --- CONFIGURATION ---
EMAIL = "prevision"
MOT_DE_PASSE = "Meteo2024"

def log(msg):
    """Envoie les messages d'erreur/info vers stderr pour ne pas polluer le CSV"""
    sys.stderr.write(f"{msg}\n")

def main():
    # 1. Récupération de la date depuis les arguments Node.js
    # L'argument 1 sera la date cible (ex: "2025-12-30" ou "AUTO")
    try:
        if len(sys.argv) > 1:
            date_arg = sys.argv[1]
        else:
            date_arg = "AUTO"
    except IndexError:
        date_arg = "AUTO"

    # 2. Calcul des dates (Logique 8h-8h)
    if date_arg == "AUTO" or date_arg == "" or date_arg == "undefined":
        # Par défaut : Aujourd'hui (donc données finissant ce matin à 08h00)
        date_ref = datetime.now()
        log(f"🚀 Mode AUTO activé : Cible {date_ref.strftime('%Y-%m-%d')}")
    else:
        try:
            # Mode MANUEL : Date choisie par l'utilisateur
            date_ref = datetime.strptime(date_arg, "%Y-%m-%d")
            log(f"🎯 Mode MANUEL activé : Cible {date_arg}")
        except ValueError:
            log(f"❌ Erreur format date ({date_arg}), retour au mode AUTO")
            date_ref = datetime.now()

    # Définition de la plage horaire (J à 08:00 jusqu'à J-1 à 08:00)
    date_fin_dt = date_ref.replace(hour=8, minute=0, second=0, microsecond=0)
    date_debut_dt = date_fin_dt - timedelta(days=1)
    
    # Formatage ISO requis par l'API Pulsonic
    date_from_api = date_debut_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    date_to_api = date_fin_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    log(f"📅 Période demandée : Du {date_debut_dt} au {date_fin_dt}")

    # Fichiers temporaires uniques (pour éviter les conflits si plusieurs personnes cliquent)
    timestamp = datetime.now().strftime('%H%M%S%f')
    fichier_cookies = f"cookies_{timestamp}.txt"
    fichier_login = f"login_{timestamp}.json"
    fichier_config = f"config_{timestamp}.json"
    nom_fichier_csv = f"output_{timestamp}.csv"

    # 3. LOGIN
    login_data = json.dumps({"mail": EMAIL, "password": MOT_DE_PASSE, "remember_me": True})
    
    # Commande CURL pour le login
    cmd_login = [
        "curl", "https://app.pulsonic.com/api/login/", "-X", "POST",
        "--ssl-no-revoke", "-k", "-s", # -s pour silencieux, -k pour ignorer SSL
        "-H", "content-type: application/json",
        "-H", "user-agent: Mozilla/5.0",
        "--data-raw", login_data,
        "-c", fichier_cookies,
        "--output", fichier_login
    ]

    subprocess.run(cmd_login)

    # Vérification du Token
    token = None
    try:
        if os.path.exists(fichier_login):
            with open(fichier_login, "r", encoding="utf-8") as f:
                content = f.read()
                if content:
                    resp = json.loads(content)
                    token = resp.get("token") or resp.get("access_token")
        
        if not token: 
            raise Exception("Token non trouvé dans la réponse login")
            
    except Exception as e:
        log(f"❌ Erreur login/token : {e}")
        # Nettoyage d'urgence
        for f in [fichier_cookies, fichier_login]:
            if os.path.exists(f): os.remove(f)
        sys.exit(1)

    # 4. TÉLÉCHARGEMENT
    config_export = {
        "stations": [269, 1008, 982, 1006],
        "observations": [
            {"code": "32031", "aux": 0}, {"code": "32032", "aux": 0},
            {"code": "32033", "aux": 0}, {"code": "32034", "aux": 0},
            {"code": "32035", "aux": 0}, {"code": "32036", "aux": 0}
        ],
        "timezone": "Europe/Paris",
        "date_range": {"from": date_from_api, "to": date_to_api},
        "configuration": {
            "format": "CSV", "delimiter": ",", "compression": "none",
            "date_format": "DD/MM/YYYY HH:MM", "headers": True, "language": "en",
            "date_sorter": "desc", "default_values": False,
            "missing_value_placeholder": "", "decimal": ".", 
            "missing_values": False, "timezone": "Europe/Paris"
        },
        "limit_rows": 0
    }

    # Écriture de la config JSON
    with open(fichier_config, "w", encoding="utf-8") as f:
        json.dump(config_export, f)

    # Commande CURL pour l'export
    cmd_export = [
        "curl", "https://app.pulsonic.com/api/export_data/", "-X", "POST",
        "--ssl-no-revoke", "-k", "-s",
        "-H", "content-type: application/json",
        "-H", f"access-token: {token}",
        "-H", "user-agent: Mozilla/5.0",
        "-b", fichier_cookies,
        "-d", f"@{fichier_config}",
        "--output", nom_fichier_csv
    ]

    subprocess.run(cmd_export)

    # 5. SORTIE DES DONNÉES (Vers Node.js)
    if os.path.exists(nom_fichier_csv):
        try:
            # On lit le fichier CSV téléchargé
            with open(nom_fichier_csv, "r", encoding="utf-8") as f:
                csv_content = f.read()
                
            # On vérifie qu'on a bien reçu des données (plus que juste des headers)
            if len(csv_content) > 50:
                print(csv_content) # <--- Envoi vers Node.js
            else:
                log("⚠️ Le fichier CSV téléchargé semble vide ou trop court.")
                
        except Exception as e:
            log(f"❌ Erreur lecture CSV final: {e}")
    else:
        log("❌ Fichier CSV non généré par CURL.")

    # 6. NETTOYAGE
    for f in [fichier_cookies, fichier_login, fichier_config, nom_fichier_csv]:
        try: 
            if os.path.exists(f): os.remove(f)
        except: pass

if __name__ == "__main__":
    main()