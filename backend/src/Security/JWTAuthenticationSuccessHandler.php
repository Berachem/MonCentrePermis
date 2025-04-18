<?php
namespace App\Security;

use App\Entity\Compte; // Assure-toi d'importer l'entité Compte
use Doctrine\ORM\EntityManagerInterface; // Importer l'EntityManager
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class JWTAuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    private JWTTokenManagerInterface $jwtManager;
    private EntityManagerInterface $entityManager; // Déclare une propriété pour l'EntityManager

    // Injecter EntityManagerInterface dans le constructeur
    public function __construct(JWTTokenManagerInterface $jwtManager, EntityManagerInterface $entityManager)
    {
        $this->jwtManager = $jwtManager;
        $this->entityManager = $entityManager; // Initialiser EntityManager
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): ?Response
    {
        $response = new Response();
        
        /** @var Compte $user */
        $user = $token->getUser();
        
        // Génération du JWT
        $jwt = $this->jwtManager->create($user);
        
        // Génération du refresh token et de son expiration
        $refreshToken = bin2hex(random_bytes(64));
        $refreshTokenExpiresAt = new \DateTimeImmutable('+30 days');
        
        if ($user instanceof Compte) {
            $user->setRefreshToken($refreshToken);
            $user->setRefreshTokenExpiresAt($refreshTokenExpiresAt);
            $this->entityManager->flush();
        }
    
        // Créer un cookie BEARER pour le JWT
        $response->headers->setCookie(
            new Cookie(
                'BEARER', // Nom du cookie
                $jwt, // La valeur du cookie est le JWT généré
                time() + 3600, // Expiration dans 1 heure
                '/', // Path
                null, // Domaine (null signifie domaine actuel)
                true, // Secure, nécessite une connexion HTTPS
                true, // HttpOnly pour protéger le cookie
                false, // Pas de SameSite strict
                'None' // SameSite=None si tu veux accepter les cookies cross-origin
            )
        );
    
        // Créer un cookie REFRESH_TOKEN pour le refresh token
        $response->headers->setCookie(
            new Cookie(
                'REFRESH_TOKEN', // Nom du cookie
                $refreshToken, // La valeur du cookie est le refresh token
                $refreshTokenExpiresAt->getTimestamp(), // Expiration dans 30 jours
                '/', // Path
                null, // Domaine
                true, // Secure, nécessite une connexion HTTPS
                true, // HttpOnly
                false, // Pas de SameSite strict
                'None' // SameSite=None si tu veux accepter les cookies cross-origin
            )
        );
                    
        return $response;
    }
    
    
}
