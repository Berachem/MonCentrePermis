<?php

namespace App\Controller;

use App\Entity\Moniteur;
use App\Entity\Compte;
use App\Entity\Cours;
use App\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Mime\MimeTypes;
use Psr\Log\LoggerInterface;

#[Route('/api/moniteurs')]
class MoniteurController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(
        EntityManagerInterface $entityManager
    ) {
        $this->entityManager = $entityManager;
    }

    #[Route('/mycourses', name: 'moniteur_courses', methods: ['POST'])]
    public function getMyCourses(Request $request): JsonResponse
    {
        // Récupérer le contenu de la requête
        $data = json_decode($request->getContent(), true);
        $requestedUserId = $data['userId'] ?? null;
        $viewMode = $data['viewMode'] ?? 'owner';

        // Si aucun ID n'a été fourni, utiliser celui de l'utilisateur connecté
        if (!$requestedUserId) {
            // Récupérer l'utilisateur connecté
            $compte = $this->getUser();

            if (!$compte) {
                return new JsonResponse(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $requestedUserId = $compte->getId();
        } else {
            // Vérifier si l'utilisateur connecté a le droit de consulter ces cours
            $compte = $this->getUser();

            // Si ce n'est pas l'utilisateur lui-même et que le mode est 'owner' (pas lecture seule)
            if ($compte && $compte->getId() != $requestedUserId && $viewMode === 'owner') {
                // Vérifier si l'utilisateur connecté a un rôle qui lui permet de voir les cours d'un autre utilisateur
                $roles = $compte->getRoles();
            }
        }

        // Trouver le compte correspondant à l'ID demandé
        $compteRepository = $this->entityManager->getRepository(Compte::class);
        $requestedCompte = $compteRepository->find($requestedUserId);

        if (!$requestedCompte) {
            return new JsonResponse(['error' => 'Compte non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Récupérer le moniteur associé au compte demandé
        $moniteur = $requestedCompte->getMoniteur();

        if (!$moniteur) {
            return new JsonResponse(['error' => 'Moniteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Récupérer la liste des cours du moniteur
        $coursList = $moniteur->getCours();

        // Si aucun cours n'est trouvé, retourner une réponse vide
        if (empty($coursList)) {
            return new JsonResponse([], JsonResponse::HTTP_OK);
        }

        // Structurer les données des cours
        $coursData = [];
        foreach ($coursList as $cours) {
            $coursData[] = [
                'id' => $cours->getId(),
                'libelle' => $cours->getLibelle(),
                'description' => $cours->getDescription(),
                'updatedAt' => $cours->getUpdatedAt() ? $cours->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            ];
        }

        // Retourner la réponse JSON avec les données des cours
        return new JsonResponse($coursData, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/info', name: 'moniteur_info', methods: ['GET'])]
    public function getMoniteurInfo(int $id): JsonResponse
    {
        $moniteur = $this->entityManager->getRepository(Moniteur::class)->findOneBy(['compte' => $id]);

        if (!$moniteur) {
            return new JsonResponse(['error' => 'Moniteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $compte = $moniteur->getCompte();

        // Récupérer le nombre de circuits
        $circuitsCount = count($moniteur->getCircuits());

        $moniteurInfo = [
            // Infos
            'nom' => $compte->getNom(),
            'prenom' => $compte->getPrenom(),
            'genre' => $compte->getGenre(), // Assure-toi que la méthode existe
            'dateNaissance' => $compte->getDateNaissance()?->format('Y-m-d'),
            'email' => $compte->getEmail(),
            'telephone' => $compte->getTelephone(),
            'dateDebutCarriere' => $moniteur->getDateDebutCarriere()?->format('Y-m-d'),
            'status' => $moniteur->getStatusActivite(),

            // Stats (à adapter selon la logique métier que tu mettras plus tard)
            'coursesCount' => (string)count($moniteur->getCours()),
            'circuitsCount' => (string)$circuitsCount,
            'studentCount' => '0',
            'viewCount' => '0',
            'rating' => '0.0',
        ];

        return new JsonResponse($moniteurInfo, JsonResponse::HTTP_OK);
    }


    #[Route('/UpdateInfo', name: 'moniteur_update_info', methods: ['POST'])]
    public function updateMoniteurInfo(Request $request): JsonResponse
    {
        /** @var Compte|null $compte */
        $compte = $this->getUser();

        if (!$compte) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $moniteur = $compte->getMoniteur();

        if (!$moniteur) {
            return new JsonResponse(['error' => 'Moniteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        // Mise à jour des infos Compte
        $compte->setNom($data['nom'] ?? $compte->getNom());
        $compte->setPrenom($data['prenom'] ?? $compte->getPrenom());
        $compte->setGenre($data['genre'] ?? $compte->getGenre());
        $compte->setTelephone($data['telephone'] ?? $compte->getTelephone());

        if (!empty($data['dateNaissance'])) {
            $compte->setDateNaissance(new \DateTime($data['dateNaissance']));
        }

        // Mise à jour des infos Moniteur
        if (!empty($data['dateDebutCarriere'])) {
            $moniteur->setDateDebutCarriere(new \DateTime($data['dateDebutCarriere']));
        }

        $moniteur->setStatusActivite($data['status'] ?? $moniteur->getStatusActivite());

        $this->entityManager->flush();

        return new JsonResponse(['success' => true, 'message' => 'Informations mises à jour avec succès'], JsonResponse::HTTP_OK);
    }

    #[Route('/addMycourses', name: 'moniteur_add_courses', methods: ['POST'])]
    public function postMyCourses(Request $request): JsonResponse
    {
        $compte = $this->getUser();

        if (!$compte) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $moniteur = $compte->getMoniteur();

        if (!$moniteur) {
            return new JsonResponse(['error' => 'Moniteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['libelle']) || empty($data['libelle'])) {
            return new JsonResponse(['error' => 'Libellé du cours manquant'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $description = $data['description'] ?? '';

        // Créer le cours
        $cours = new Cours();
        $cours->setLibelle($data['libelle']);

        // Nettoyer la description pour enlever les tokens dans les URLs des images
        $pattern = '/<img src="http:\/\/localhost:8000\/media\/([a-f0-9\-]+)\?token=[^"]+">/';
        $replacement = '<img src="http://localhost:8000/media/$1">';

        // Remplacer l'URL avec token par celle sans token
        $descriptionNettoyee = preg_replace($pattern, $replacement, $description);

        // Sauvegarder la description nettoyée
        $cours->setDescription($descriptionNettoyee);

        $cours->setMoniteur($moniteur);

        // Recherche et association des médias
        preg_match_all('/media\/([a-f0-9\-]{36})/', $descriptionNettoyee, $matches);
        $fichiers = $matches[1] ?? [];

        foreach ($fichiers as $uuid) {
            $media = $this->entityManager->getRepository(Media::class)->findOneBy(['nom_fichier' => $uuid]);
            if ($media) {
                $media->setCours($cours);
            }
        }

        // Persister et flusher le cours
        $this->entityManager->persist($cours);
        $this->entityManager->flush();

        return new JsonResponse(['success' => true, 'message' => 'Cours ajouté avec succès'], JsonResponse::HTTP_CREATED);
    }

    #[Route('/addMycourses/upload', name: 'moniteur_upload_file', methods: ['POST'])]
    public function uploadCourseFile(Request $request): JsonResponse
    {
        // Vérifie si le fichier a été envoyé
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['error' => 'Aucun fichier fourni'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Générer un UUID unique pour le fichier
        $uuid = Uuid::v4()->toRfc4122();

        // Récupérer le type MIME et l'extension du fichier
        $mimeType = $file->getMimeType();
        $extension = $file->getClientOriginalExtension();

        // Créer une nouvelle entité Media et remplir les informations
        $media = new Media();
        $media->setNomFichier($uuid);
        $media->setExtension($extension);
        $media->setType($mimeType);
        $media->setTitre($file->getClientOriginalName());

        // Récupérer l'utilisateur connecté (Moniteur)
        $compte = $this->getUser();

        if (!$compte) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $moniteur = $compte->getMoniteur();

        if (!$moniteur) {
            return new JsonResponse(['error' => 'Moniteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Associer le media au moniteur
        $media->setMoniteur($moniteur);

        // Déplacer le fichier vers le répertoire 'uploads'
        try {
            $uploadDirectory = $this->getParameter('upload_directory');
            $filePath = $uploadDirectory . '/' . $uuid . '.' . $extension;
            $file->move($uploadDirectory, $filePath);

            // Enregistrer l'entité Media dans la base de données
            $this->entityManager->persist($media);
            $this->entityManager->flush();

            return new JsonResponse([
                'success' => true,
                'message' => 'Fichier téléchargé et ajouté à la base de données avec succès',
                'url' => $uuid
            ], JsonResponse::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur lors du déplacement du fichier: ' . $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/course/{id}', name: 'get_course', methods: ['GET'])]
    public function getCourse(string $id): JsonResponse
    {
        $cours = $this->entityManager->getRepository(Cours::class)->find($id);

        if (!$cours) {
            return new JsonResponse(['error' => 'Cours non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Vérifier l'accès (si l'utilisateur est le propriétaire du cours ou un admin)
        $compte = $this->getUser();
        if (!$compte || ($compte->getMoniteur() !== $cours->getMoniteur() && !in_array('ROLE_ADMIN', $compte->getRoles()))) {
            return new JsonResponse(['error' => 'Accès non autorisé'], JsonResponse::HTTP_FORBIDDEN);
        }

        $courseData = [
            'id' => $cours->getId(),
            'libelle' => $cours->getLibelle(),
            'description' => $cours->getDescription(),
            'updatedAt' => $cours->getUpdatedAt() ? $cours->getUpdatedAt()->format('Y-m-d H:i:s') : null,
        ];

        return new JsonResponse($courseData, JsonResponse::HTTP_OK);
    }

    #[Route('/course/{id}/update', name: 'update_course', methods: ['PUT', 'POST'])]
    public function updateCourse(Request $request, string $id): JsonResponse
    {
        $cours = $this->entityManager->getRepository(Cours::class)->find($id);

        if (!$cours) {
            return new JsonResponse(['error' => 'Cours non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Vérifier l'accès (si l'utilisateur est le propriétaire du cours ou un admin)
        $compte = $this->getUser();
        if (!$compte || ($compte->getMoniteur() !== $cours->getMoniteur() && !in_array('ROLE_ADMIN', $compte->getRoles()))) {
            return new JsonResponse(['error' => 'Accès non autorisé'], JsonResponse::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['libelle']) && !empty($data['libelle'])) {
            $cours->setLibelle($data['libelle']);
        }

        if (isset($data['description'])) {
            // Nettoyer la description pour enlever les tokens dans les URLs des images
            $pattern = '/<img src="http:\/\/localhost:8000\/media\/([a-f0-9\-]+)\?token=[^"]+">/';
            $replacement = '<img src="http://localhost:8000/media/$1">';

            // Remplacer l'URL avec token par celle sans token
            $descriptionNettoyee = preg_replace($pattern, $replacement, $data['description']);

            $cours->setDescription($descriptionNettoyee);

            // Mise à jour de la date de modification
            //$cours->setUpdatedAt(new \DateTime());

            // Recherche et association des nouveaux médias
            preg_match_all('/media\/([a-f0-9\-]{36})/', $descriptionNettoyee, $matches);
            $fichiers = $matches[1] ?? [];

            foreach ($fichiers as $uuid) {
                $media = $this->entityManager->getRepository(Media::class)->findOneBy(['nom_fichier' => $uuid]);
                if ($media && $media->getCours() === null) {
                    $media->setCours($cours);
                }
            }
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Cours mis à jour avec succès',
            'updatedAt' => $cours->getUpdatedAt()->format('Y-m-d H:i:s')
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/course/{id}/delete', name: 'delete_course', methods: ['DELETE', 'POST'])]
    public function deleteCourse(string $id): JsonResponse
    {
        $cours = $this->entityManager->getRepository(Cours::class)->find($id);

        if (!$cours) {
            return new JsonResponse(['error' => 'Cours non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Vérifier l'accès (si l'utilisateur est le propriétaire du cours ou un admin)
        $compte = $this->getUser();
        if (!$compte || ($compte->getMoniteur() !== $cours->getMoniteur() && !in_array('ROLE_ADMIN', $compte->getRoles()))) {
            return new JsonResponse(['error' => 'Accès non autorisé'], JsonResponse::HTTP_FORBIDDEN);
        }

        // Gestion des médias associés
        foreach ($cours->getMedias() as $media) {
            $media->setCours(null); // Dissocier le média du cours plutôt que de le supprimer
        }

        // Supprimer le cours
        $this->entityManager->remove($cours);
        $this->entityManager->flush();

        return new JsonResponse(['success' => true, 'message' => 'Cours supprimé avec succès'], JsonResponse::HTTP_OK);
    }
}
