<?php
// Charger les données JSON
$json = file_get_contents('data/centres_examens.json');
$centres = json_decode($json, true);

// Récupérer la liste unique des pays pour le filtre
$pays_disponibles = array_unique(array_column($centres['centres_examens'], 'country'));
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MonCentrePermis</title>
    <link rel="stylesheet" href="style.css">

    <!-- Inclure les fichiers CSS et JS de Leaflet -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

    <!-- Style pour la carte -->
    <style>
    #map {
        height: 500px;
        width: 100%;
    }
    </style>
</head>

<body>
    <div class="container">
        <h1>Bienvenue sur MonCentrePermis</h1>

        <!-- Formulaire de recherche avec filtre par pays -->
        <form action="index.php" method="GET">
            <input type="text" name="search" placeholder="Rechercher un centre d'examen...">

            <!-- Menu déroulant pour filtrer par pays -->
            <select name="country">
                <option value="">Tous les pays</option>
                <?php foreach ($pays_disponibles as $pays) { ?>
                <option value="<?php echo $pays; ?>"><?php echo $pays; ?></option>
                <?php } ?>
            </select>

            <button type="submit">Rechercher</button>
        </form>

        <!-- Section pour la carte -->
        <h3>Carte des centres d'examen</h3>
        <div id="map"></div>

        <div class="resultats">
            <?php
            // Vérifier si une recherche ou un filtre est appliqué
            if (isset($_GET['search']) || isset($_GET['country'])) {
                $search = isset($_GET['search']) ? strtolower($_GET['search']) : '';
                $country = isset($_GET['country']) ? $_GET['country'] : '';

                foreach ($centres['centres_examens'] as $centre) {
                    // Vérifier si le centre correspond à la recherche par nom/ville et au filtre par pays
                    $nomCorrespond = strpos(strtolower($centre['name']), $search) !== false ||
                        strpos(strtolower($centre['formattedAddress']['ville']), $search) !== false;
                    $paysCorrespond = empty($country) || $centre['country'] == $country;

                    if ($nomCorrespond && $paysCorrespond) {
                        echo "<div class='centre'>
                                <h2>{$centre['name']}</h2>
                                <p>{$centre['formattedAddress']['ville']}, {$centre['dep']}</p>
                                <a href='detail.php?id={$centre['id']}'>Voir plus</a>
                              </div>";
                    }
                }
            } else {
                // Afficher tous les centres si aucune recherche ou filtre n'est appliqué
                foreach ($centres['centres_examens'] as $centre) {
                    echo "<div class='centre'>
                            <h2>{$centre['name']}</h2>
                            <p>{$centre['formattedAddress']['ville']}, {$centre['dep']}</p>
                            <a href='detail.php?id={$centre['id']}'>Voir plus</a>
                          </div>";
                }
            }
            ?>
        </div>
    </div>

    <!-- Script pour afficher la carte avec tous les centres -->
    <script>
    // Initialisation de la carte centrée sur la France
    var map = L.map('map').setView([46.603354, 1.888334], 6); // Coordonées centrées sur la France

    // Charger la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Ajouter un marqueur pour chaque centre d'examen
    <?php foreach ($centres['centres_examens'] as $centre) { ?>
    L.marker([<?php echo $centre['lat']; ?>, <?php echo $centre['long']; ?>])
        .addTo(map)
        .bindPopup(
            "<b><?php echo $centre['name']; ?></b><br><?php echo $centre['formattedAddress']['address']; ?><br><?php echo $centre['formattedAddress']['ville']; ?>"
        );
    <?php } ?>
    </script>

</body>

</html>