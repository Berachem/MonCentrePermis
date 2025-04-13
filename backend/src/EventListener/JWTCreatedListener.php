<?php

namespace App\EventListener;

use App\Entity\Compte;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\Security\Core\User\UserInterface;

class JWTCreatedListener
{
    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        // Récupérer l'utilisateur connecté
        $user = $event->getUser();

        if (!$user instanceof Compte) {
            return;
        }

        // Ajouter des données personnalisées au payload
        $payload = $event->getData();
        $payload['nom'] = $user->getNom(); // Assurez-vous que la méthode getNom() existe
        $payload['prenom'] = $user->getPrenom(); // Assurez-vous que la méthode getPrenom() existe
        $payload['userId'] = $user->getId(); // Assurez-vous que la méthode getId() existe

        $event->setData($payload);
    }
}
