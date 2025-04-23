<?php

namespace App\Controller;

use App\Repository\CircuitCoursRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

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
}