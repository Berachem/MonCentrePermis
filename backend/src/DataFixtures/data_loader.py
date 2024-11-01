# data_loader.py
import subprocess
import sys

# Commandes de gestion des données
commands = {
    "Pays": {
        "insert": "php bin/console app:insert-pays-data",
        "delete": "php bin/console app:delete-pays"
    },
    "Ville En": {
        "insert": "php bin/console app:insert-ville-en-data",
    },
    "Ville Fr": {
        "insert": "php bin/console app:insert-ville-fr-data",
        "delete": "php bin/console app:delete-ville"
    },
    "langues": {
        "insert": "php bin/console app:insert-langues",
        "delete": "php bin/console app:delete-langues"
    },
    "Permis": {
        "insert": "php bin/console app:insert-permis",
        "delete": "php bin/console app:delete-permis"
    },
    "CentreExamen": {
        "insert": "php bin/console app:insert-centre-examen",
        "delete": "php bin/console app:delete-centre-examen"
    },
    "AutoEcoles": {
        "insert": "php bin/console app:insert-auto-ecoles",
        "delete": "php bin/console app:delete-auto-ecoles"
    }
}

def execute_command(command):
    try:
        print(f"Exécution : {command}")
        result = subprocess.run(command, shell=True, check=True, text=True, capture_output=True)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de l'exécution de la commande : {command}\n{e.stderr}")

def main(action):
    if action not in ["insert", "delete"]:
        print("Argument invalide. Utilisez 'insert' ou 'delete'.")
        return

    # Déterminer l'ordre de parcours des commandes
    entities = list(commands.items())
    if action == "delete":
        entities = reversed(entities)  # Inverser l'ordre pour les suppressions

    for entity, cmds in entities:
        if action in cmds :
            execute_command(cmds[action])

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage : python data_loader.py <insert|delete>")
        sys.exit(1)
    
    action = sys.argv[1].lower()
    main(action)
