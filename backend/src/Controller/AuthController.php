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
use Symfony\Component\HttpFoundation\Cookie; 

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
    public function logout(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Récupérer le refresh token depuis les cookies
        $refreshToken = $request->cookies->get('REFRESH_TOKEN');
    
        if ($refreshToken) {
            // Récupérer l'utilisateur correspondant à ce refresh token
            $compte = $em->getRepository(Compte::class)->findOneBy(['refreshToken' => $refreshToken]);
    
            if ($compte) {
                // Invalider le refresh token
                $compte->setRefreshToken(null);
                $compte->setRefreshTokenExpiresAt(null);
                $em->flush();
            }
        }
    
        // Préparer la réponse
        $response = new JsonResponse(['message' => 'Logout successful']);
    
        // Supprimer les cookies
        // Supprimer les cookies
        // Supprimer les cookies avec l'attribut secure défini à true
        // Supprimer les cookies avec les mêmes paramètres que ceux utilisés pour les créer
        $response->headers->setCookie(
            new Cookie(
                'BEARER',       // Nom du cookie
                '',             // Valeur vide pour supprimer
                time() - 3600,  // Date d'expiration dans le passé
                '/',            // Même path
                null,           // Même domaine
                true,           // Même secure
                true,           // Même httpOnly
                false,          // Même raw
                'None'          // Même SameSite
            )
        );

        $response->headers->setCookie(
            new Cookie(
                'REFRESH_TOKEN', // Nom du cookie
                '',              // Valeur vide
                time() - 3600,   // Date d'expiration dans le passé
                '/',             // Même path
                null,            // Même domaine
                true,            // Même secure
                true,            // Même httpOnly
                false,           // Même raw
                'None'           // Même SameSite
            )
        );
    
        return $response;
    }
    


    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(Request $request, JWTTokenManagerInterface $jwtManager): JsonResponse
    {
        // Récupérer l'utilisateur actuel depuis le token JWT
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        // Créer un JWT valide pour cet utilisateur
        $token = $jwtManager->create($user);
        
        return new JsonResponse(['token' => $token]);
    }


    #[Route('/api/token/refresh', name: 'api_token_refresh', methods: ['POST'])]
    public function refreshToken(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Vérifier le refresh token dans la requête (par exemple dans le cookie)
        $refreshToken = $request->cookies->get('REFRESH_TOKEN');
        
        if (!$refreshToken) {
            return new JsonResponse(['message' => 'Refresh token missing'], 401);
        }
    
        // Vérifier si le refresh token est valide et non expiré
        $compte = $em->getRepository(Compte::class)->findOneBy(['refreshToken' => $refreshToken]);
    
        if (!$compte || $compte->getRefreshTokenExpiresAt() < new \DateTimeImmutable()) {
            // Si le refresh token est absent ou expiré, on force un logout
            return $this->logoute($request, $em);
        }
    
        // Créer un nouveau JWT pour l'utilisateur
        $jwt = $this->jwtManager->create($compte);
    
        // Créer une réponse vide pour ajouter le cookie
        $response = new JsonResponse(['message' => 'Token refreshed']);
        
        // Ajouter le nouveau token dans un cookie
        $response->headers->setCookie(
            new \Symfony\Component\HttpFoundation\Cookie(
                'BEARER', 
                $jwt, 
                time() + 3 * 86400,  // Le token est valide pour 3 jours
                '/',
                null,
                false,      // secure = false en dev
                true,       // httpOnly
                false,
                false
            )
        );
    
        return $response;
    }
    
    public function logoute(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Récupérer le refresh token depuis les cookies
        $refreshToken = $request->cookies->get('REFRESH_TOKEN');
    
        if ($refreshToken) {
            // Récupérer l'utilisateur correspondant à ce refresh token
            $compte = $em->getRepository(Compte::class)->findOneBy(['refreshToken' => $refreshToken]);
    
            if ($compte) {
                // Invalider le refresh token
                $compte->setRefreshToken(null);
                $compte->setRefreshTokenExpiresAt(null);
                $em->flush();
            }
        }
    
        // Préparer la réponse
        $response = new JsonResponse(['message' => 'Logout successful refresh']);
    
        // Supprimer les cookies
        $response->headers->clearCookie('BEARER', '/', null, false, true, null, 'Strict');
        $response->headers->clearCookie('REFRESH_TOKEN', '/', null, false, true, null, 'Strict');        
    
        return $response;
    }
    
    

}
