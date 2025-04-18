<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Mime\MimeTypes;
use App\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface; // Utilisation de l'interface pour le décodeur JWT
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use App\Entity\Cours; // ✅ Correct si `Cours.php` est bien une entité



#[Route('/media')]
class FileController extends AbstractController
{
    private $entityManager;
    private $jwtEncoder;
    
    // Injection de EntityManager et JWTEncoder dans le constructeur
    public function __construct(EntityManagerInterface $entityManager, JWTEncoderInterface $jwtEncoder)
    {
        $this->entityManager = $entityManager;
        $this->jwtEncoder = $jwtEncoder;
    }
    
    #[Route('/{uuid}', name: 'serve_protected_file_by_uuid', methods: ['GET'])]
    public function getProtectedFileByUuid(string $uuid, Request $request): BinaryFileResponse|JsonResponse
    {
        // Récupérer le token depuis les paramètres de l'URL
        //$token = $request->query->get('token');

        $token = $request->cookies->get('BEARER');
        
        if (!$token) {
            return new JsonResponse(['error' => 'Token manquant'], JsonResponse::HTTP_BAD_REQUEST);
        }
    
        // Décoder le JWT pour récupérer les informations
        try {
            // Décoder le token avec l'encodeur JWT injecté
            $decodedToken = $this->jwtEncoder->decode($token);
    
            // Vérifier si le token est valide
            if (!$decodedToken) {
                return new JsonResponse(['error' => 'Token invalide'], JsonResponse::HTTP_UNAUTHORIZED);
            }
    
            // Extraire des informations comme l'ID de l'utilisateur ou son rôle
            $userId = $decodedToken['userId']; // Par exemple, récupérer l'ID de l'utilisateur
            $roles = $decodedToken['roles']; // Récupérer les rôles de l'utilisateur
            $username = $decodedToken['username']; // Récupérer le nom d'utilisateur
    
            // Vérifier si l'utilisateur a les droits nécessaires (par exemple, vérifier les rôles)
            if (!in_array('ROLE_USER', $roles)) {
                return new JsonResponse(['error' => 'Accès refusé'], JsonResponse::HTTP_FORBIDDEN);
            }

        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur lors du décodage du token'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    
        // Recherche du fichier dans la base de données par UUID
        $media = $this->entityManager->getRepository(Media::class)->findOneBy(['nom_fichier' => $uuid]);
    
        if (!$media) {
            return new JsonResponse(['error' => 'Fichier non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        // Déterminer le chemin du fichier
        $filePath = $this->getParameter('kernel.project_dir') . '/uploads/' . $uuid . '.' . $media->getExtension();
    
        if (!file_exists($filePath)) {
            return new JsonResponse(['error' => 'Fichier introuvable sur le serveur'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        // Déterminer le type MIME du fichier
        $mimeTypes = new MimeTypes();
        $mimeType = $mimeTypes->guessMimeType($filePath) ?? 'application/octet-stream';
    
        // Créer une réponse avec le fichier binaire
        $response = new BinaryFileResponse($filePath);
        $response->headers->set('Content-Type', $mimeType);
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE); // Ouvre directement dans le navigateur
    
        return $response;
    }


    #[Route('/cours/{id}', name: 'serve_course_by_id', methods: ['GET'])]
    public function getCourseById(int $id): JsonResponse
    {
        // Récupérer le cours à partir de l'ID
        $cours = $this->entityManager->getRepository(Cours::class)->find($id);
    
        if (!$cours) {
            return new JsonResponse(['error' => 'Cours non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        // Récupérer les fichiers associés au cours (si nécessaire)
        $mediaFiles = [];
        foreach ($cours->getMedias() as $media) {
            $mediaFiles[] = [
                'uuid' => $media->getNomFichier(),
                'extension' => $media->getExtension(),
                'url' => $this->generateUrl('serve_protected_file_by_uuid', ['uuid' => $media->getNomFichier()])
            ];
        }
    
        return new JsonResponse([
            'cours' => [
                'id' => $cours->getId(),
                'libelle' => $cours->getLibelle(),
                'description' => $cours->getDescription(),
                'medias' => $mediaFiles,
            ]
        ]);
    }
}
