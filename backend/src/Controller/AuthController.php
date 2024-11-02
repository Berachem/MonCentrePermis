<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use App\Entity\Compte;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class AuthController extends AbstractController
{
    private $authenticationUtils;
    private $entityManager;
    private $jwtManager;

    public function __construct(
        AuthenticationUtils $authenticationUtils, 
        EntityManagerInterface $entityManager, 
        JWTTokenManagerInterface $jwtManager
    ) {
        $this->authenticationUtils = $authenticationUtils;
        $this->entityManager = $entityManager; 
        $this->jwtManager = $jwtManager; 
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        // Géré par Symfony, pas besoin de code personnalisé ici.
        return new JsonResponse(['message' => 'Login successful']);
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // Pour une application front-end, il s'agit simplement de demander au client
        // de supprimer le token JWT stocké (localStorage, cookies, etc.)

        // Exemple de réponse pour que le client supprime le token
        return new JsonResponse(['message' => 'Logout successful']);
    }
}
