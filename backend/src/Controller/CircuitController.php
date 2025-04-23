<?php

namespace App\Controller;

use App\Repository\CircuitCoursRepository;
use App\Repository\CircuitRepository;
use App\Repository\CompteRepository;
use App\Repository\MoniteurRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use App\Entity\Circuit;
use App\Entity\CircuitCours;
use App\Entity\Cours;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

#[Route('/api/circuits')]
class CircuitController extends AbstractController
{
    #[Route('/bycours/{coursId}', name: 'api_circuits_by_cours', methods: ['GET'])]
    public function getCircuitsByCours(
        string $coursId,
        CircuitCoursRepository $circuitCoursRepository,
        SerializerInterface $serializer
    ): JsonResponse {
        try {
            $circuits = $circuitCoursRepository->findCircuitsByCours((int)$coursId);

            // Utiliser le sérialiseur pour transformer les entités en JSON
            $json = $serializer->serialize($circuits, 'json', ['groups' => ['default']]);

            return new JsonResponse($json, Response::HTTP_OK, [], true);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['message' => 'Erreur lors de la récupération des circuits: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/bymoniteurs/{compteId}', name: 'api_moniteurs_circuits', methods: ['GET'])]
    public function getCircuitsByMoniteur(
        int $compteId,
        CircuitRepository $circuitRepository,
        CompteRepository $compteRepository,
        MoniteurRepository $moniteurRepository
    ): JsonResponse {
        try {
            // 1. Chercher le compte avec l'ID fourni
            $compte = $compteRepository->find($compteId);

            if (!$compte) {
                return new JsonResponse(
                    ['message' => 'Compte non trouvé'],
                    Response::HTTP_NOT_FOUND
                );
            }

            // 2. Trouver le moniteur associé au compte
            $moniteur = $moniteurRepository->findOneBy(['compte' => $compte]);

            if (!$moniteur) {
                return new JsonResponse(
                    ['message' => 'Aucun moniteur associé à ce compte'],
                    Response::HTTP_NOT_FOUND
                );
            }

            // 3. Obtenir l'ID réel du moniteur
            $moniteurId = $moniteur->getId();

            // 4. Récupérer les circuits du moniteur
            // Option 1: Utiliser directement la collection associée au moniteur
            $circuits = $moniteur->getCircuits()->toArray();

            // Option 2: Si vous préférez utiliser le repository (alternative)
            // $circuits = $circuitRepository->findByMoniteur($moniteur);

            // 5. Formater les résultats pour le frontend
            $formattedCircuits = array_map(function ($circuit) {
                return [
                    'id' => $circuit->getId(),
                    'libelle' => $circuit->getLibelle(),
                    'description' => $circuit->getDescription()
                ];
            }, $circuits);

            return new JsonResponse($formattedCircuits);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['message' => 'Erreur lors de la récupération : ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Route personnalisée pour lier un circuit à un cours
     */
    #[Route('/link-circuit-cours', name: 'api_link_circuit_cours', methods: ['POST'])]
    public function linkCircuitCours(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            // Récupérer les données de la requête
            $data = json_decode($request->getContent(), true);

            if (!isset($data['circuit']) || !isset($data['cours'])) {
                return new JsonResponse(
                    ['message' => 'Les identifiants du circuit et du cours sont requis.'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $circuitId = (int) $data['circuit'];
            $coursId = (int) $data['cours'];

            // Vérifier que le circuit et le cours existent
            $circuit = $entityManager->getRepository(Circuit::class)->find($circuitId);
            $cours = $entityManager->getRepository(Cours::class)->find($coursId);

            if (!$circuit) {
                return new JsonResponse(
                    ['message' => 'Circuit non trouvé.'],
                    Response::HTTP_NOT_FOUND
                );
            }

            if (!$cours) {
                return new JsonResponse(
                    ['message' => 'Cours non trouvé.'],
                    Response::HTTP_NOT_FOUND
                );
            }

            // Vérifier si la liaison existe déjà
            $existingLink = $entityManager->getRepository(CircuitCours::class)->findOneBy([
                'circuit' => $circuit,
                'cours' => $cours
            ]);

            if ($existingLink) {
                return new JsonResponse(
                    ['message' => 'Ce circuit est déjà lié à ce cours.'],
                    Response::HTTP_OK
                );
            }

            // Créer la liaison
            $circuitCours = new CircuitCours();
            $circuitCours->setCircuit($circuit);
            $circuitCours->setCours($cours);

            $entityManager->persist($circuitCours);
            $entityManager->flush();

            return new JsonResponse(
                ['message' => 'Circuit lié au cours avec succès!', 'id' => $circuitCours->getId()],
                Response::HTTP_CREATED
            );
        } catch (\Exception $e) {
            return new JsonResponse(
                ['message' => 'Erreur lors de la liaison: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
