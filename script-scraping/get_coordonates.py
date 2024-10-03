import requests
import pandas as pd

# Charger les données filtrées (remplace le chemin par ton fichier)
filtered_data = pd.read_json('../data/auto_ecoles.json')

# Fonction pour obtenir les coordonnées via Nominatim API


def get_coordinates_nominatim(address):
    api_url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': address,
        'format': 'json'
    }

    response = requests.get(api_url, params=params)

    if response.status_code == 200 and response.json():
        data = response.json()[0]
        return data['lat'], data['lon']
    return None, None


# Ajouter les coordonnées latitude et longitude
for index, row in filtered_data.iterrows():
    address = row['Adresse'] + ', ' + row['Commune']
    lat, lon = get_coordinates_nominatim(address)
    filtered_data.at[index, 'Lat'] = lat
    filtered_data.at[index, 'Long'] = lon

# Sauvegarder le fichier mis à jour
filtered_data.to_json('filtered_auto_ecoles_with_coords.json',
                      orient='records', force_ascii=False)

print("Coordonnées ajoutées et fichier JSON mis à jour.")
