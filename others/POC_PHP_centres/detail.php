<?php
// Charger les données JSON
$json = file_get_contents('../../data/centres_examens.json');
$centres = json_decode($json, true);

// Récupérer l'ID du centre
$id = $_GET['id'];
$centre = null;

foreach ($centres['centres_examens'] as $c) {
    if ($c['id'] == $id) {
        $centre = $c;
        break;
    }
}

if (!$centre) {
    echo "Centre non trouvé.";
    exit;
}
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $centre['name']; ?></title>
    <link rel="stylesheet" href="style.css">

    <!-- Inclure les fichiers CSS et JS de Leaflet -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

    <!-- Style pour la carte et les informations -->
    <style>
    #map {
        height: 400px;
        width: 100%;
    }

    .info-section {
        margin-top: 20px;
    }

    .info-box {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    </style>
</head>

<body>
    <div class="container">
        <h1><?php echo $centre['name']; ?></h1>
        <p><strong>Adresse:</strong> <?php echo $centre['formattedAddress']['address']; ?>,
            <?php echo $centre['formattedAddress']['ville']; ?>, <?php echo $centre['formattedAddress']['cp']; ?></p>
        <p><strong>Département:</strong> <?php echo $centre['dep']; ?></p>
        <p><strong>Pays:</strong> <?php echo $centre['country']; ?></p>

        <h3>Localisation sur la carte :</h3>
        <div id="map"></div>

        <div class="info-section">
            <h3>Informations supplémentaires :</h3>
            <div class="info-box">
                <div id="weather-info">Chargement des informations météo...</div>
                <div id="additional-info"></div>
            </div>
        </div>

        <a href="index.php">Retour à l'accueil</a>
    </div>

    <!-- Initialisation de la carte avec Leaflet -->
    <script>
    var map = L.map('map').setView([<?php echo $centre['lat']; ?>, <?php echo $centre['long']; ?>], 14);

    // Charger la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Ajouter un marqueur pour le centre d'examen
    L.marker([<?php echo $centre['lat']; ?>, <?php echo $centre['long']; ?>]).addTo(map)
        .bindPopup(
            "<b><?php echo $centre['name']; ?></b><br><?php echo $centre['formattedAddress']['address']; ?><br><?php echo $centre['formattedAddress']['ville']; ?>"
        ).openPopup();

    // Appel à l'API météo
    const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Remplace avec ta clé API OpenWeatherMap
    const lat = <?php echo $centre['lat']; ?>;
    const lon = <?php echo $centre['long']; ?>;
    const weatherApiUrl =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;

    fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            const temp = data.main.temp;
            const weatherDescription = data.weather[0].description;
            const windSpeed = data.wind.speed;
            const weatherInfoDiv = document.getElementById('weather-info');

            weatherInfoDiv.innerHTML = `
                    <p><strong>Météo:</strong> ${weatherDescription}, ${temp}°C</p>
                    <p><strong>Vitesse du vent:</strong> ${windSpeed} m/s</p>
                `;
        })
        .catch(error => {
            document.getElementById('weather-info').innerHTML = 'Impossible de récupérer les informations météo.';
        });

    // Appel à une autre API pour des informations supplémentaires (ex: fuseau horaire)
    const timezoneApiUrl =
        `https://worldtimeapi.org/api/timezone/Europe/Paris`; // Remplacer par une API dynamique si besoin
    fetch(timezoneApiUrl)
        .then(response => response.json())
        .then(data => {
            const datetime = data.datetime;
            const additionalInfoDiv = document.getElementById('additional-info');

            additionalInfoDiv.innerHTML =
                `<p><strong>Date et heure locale:</strong> ${new Date(datetime).toLocaleString()}</p>`;
        })
        .catch(error => {
            document.getElementById('additional-info').innerHTML =
                'Impossible de récupérer les informations supplémentaires.';
        });
    </script>

</body>

</html>