import json
import requests
import time

# Charger le fichier JSON existant
input_file = '../data/auto_ecoles.json'
output_file = 'auto_ecoles_with_coords.json'

with open(input_file, 'r', encoding='utf-8') as file:
    auto_ecoles = json.load(file)

# URL de l'API Nominatim pour le géocodage
nominatim_url = "https://nominatim.openstreetmap.org/search"

# Fonction pour obtenir les coordonnées à partir d'une adresse
def get_coordinates(address):
    params = {
        'q': address,
        'format': 'json',
        'addressdetails': 1,
        'limit': 1
    }
    
    response = requests.get(nominatim_url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if len(data) > 0:
            # Retourner les coordonnées (latitude et longitude)
            return data[0]['lat'], data[0]['lon']
    return None, None

# Boucle sur chaque auto-école pour mettre à jour les coordonnées
for auto_ecole in auto_ecoles:
    # Construire l'adresse complète à partir des champs
    full_address = f"{auto_ecole['Adresse']}, {auto_ecole['Commune']}"
    print(f"Recherche des coordonnées pour : {full_address}")
    
    lat, lon = get_coordinates(full_address)
    
    if lat and lon:
        print(f"Coordonnées trouvées : {lat}, {lon}")
        auto_ecole['Lat'] = lat
        auto_ecole['Long'] = lon
    else:
        print("Coordonnées non trouvées.")
        
    # Commune, Adresse
    auto_ecole['Commune'] = auto_ecole['Commune'].title()
    auto_ecole['Adresse'] = auto_ecole['Adresse'].title()
    
    
    # Attendre un peu pour éviter de surcharger l'API Nominatim
    time.sleep(1)

# Sauvegarder le fichier JSON mis à jour avec les coordonnées
with open(output_file, 'w', encoding='utf-8') as file:
    json.dump(auto_ecoles, file, indent=4)

print(f"Les coordonnées ont été ajoutées et sauvegardées dans le fichier {output_file}")
