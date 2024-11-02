import json
import os

def format_cp_centre_examen():
    # Définir le chemin du fichier JSON de manière relative
    script_dir = os.path.dirname(os.path.abspath(__file__))  # Chemin du répertoire où se trouve le script
    input_file_path = os.path.join(script_dir, '..', 'centres_examens.json')
    output_file_path = os.path.join(script_dir, '..', 'centres_examens_updated.json')

    # Vérifier si le fichier existe
    if not os.path.exists(input_file_path):
        raise FileNotFoundError(f"Le fichier d'entrée est introuvable : {input_file_path}")

    # Charger le fichier JSON
    with open(input_file_path, 'r') as file:
        data = json.load(file)

    # Parcourir chaque centre et ajuster le code postal
    for centre in data["centres_examens"]:
        cp = str(centre["formattedAddress"]["cp"])
        centre["formattedAddress"]["cp"] = cp
        if len(cp) == 4:
            centre["formattedAddress"]["cp"] = f'0{cp}'

    # Sauvegarder le fichier avec les modifications
    with open(output_file_path, 'w') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)

    print("Mise à jour terminée. Le fichier est enregistré sous 'centres_examens_updated.json'.")


def format_cp_auto_ecoles():
    # Définir le chemin du fichier JSON de manière relative
    script_dir = os.path.dirname(os.path.abspath(__file__))  # Chemin du répertoire où se trouve le script
    input_file_path = os.path.join(script_dir, '..', 'auto_ecoles.json')
    output_file_path = os.path.join(script_dir, '..', 'auto_ecoles_updated.json')

    # Vérifier si le fichier existe
    if not os.path.exists(input_file_path):
        raise FileNotFoundError(f"Le fichier d'entrée est introuvable : {input_file_path}")

    # Charger le fichier JSON
    with open(input_file_path, 'r') as file:
        data = json.load(file)

    # Parcourir chaque centre et ajuster le code postal
    for auto_ecole in data:
        cp = str(auto_ecole["cp"])
        auto_ecole["cp"] = cp
        if len(cp) == 4:
            auto_ecole["cp"] = f'0{cp}'

    # Sauvegarder le fichier avec les modifications
    with open(output_file_path, 'w') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)

    print("Mise à jour terminée. Le fichier est enregistré sous 'auto_ecoles_updated.json'.")


# Exécuter les fonctions
format_cp_centre_examen()
format_cp_auto_ecoles()
