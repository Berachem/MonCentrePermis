<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateCompteDTO
{
    /**
     * @Assert\NotBlank(message="L'email est requis")
     * @Assert\Email(message="L'email doit être valide")
     */
    public ?string $email = null;

    /**
     * @Assert\NotBlank(message="Le mot de passe est requis")
     */
    public ?string $password = null;

    public ?string $raisonSociale = null;

    /**
     * @Assert\NotBlank(message="Le nom est requis")
     */
    public ?string $nom = null;

    /**
     * @Assert\NotBlank(message="Le prénom est requis")
     */
    public ?string $prenom = null;

    public ?string $telephone = null;

    public ?string $biographie = null;

    public ?string $photoProfil = null;

    public ?string $genre = null;

    /**
     * @Assert\NotBlank(message="La date de naissance est requise")
     * @Assert\Date(message="La date de naissance doit être valide")
     */
    public ?string $dateNaissance = null;

    public ?float $noteMoyenne = null;

    /**
     * @Assert\NotBlank(message="Le rôle est requis")
     * @Assert\Choice(choices={"eleve", "moniteur", "autoEcole"}, message="Le rôle doit être 'eleve', 'moniteur' ou 'autoEcole'")
     */
    public ?string $role = null;

    public ?int $moniteurId = null;

    public ?int $eleveId = null;

    public ?int $autoEcoleId = null;


    /**
     * @Assert\Type("bool")
     */
    public bool $compteValide; 

    /**
     * @Assert\Type("\DateTime")
     * @Assert\GreaterThan("today")
     */
    public ?\DateTime $dateExamen; 


        /**
     * @Assert\NotBlank()
     * @Assert\Type("\DateTime")
     */
    public $dateDebutCarriere;

    /**
     * @Assert\NotBlank()
     * @Assert\Type("string")
     */
    public $numeroCertification;

    /**
     * @Assert\NotBlank()
     * @Assert\Type("string")
     */
    public $statusActivite;


    /**
     * @Assert\NotBlank()
     * @Assert\Type("string")
     */
    public $NumeroCertification;



    

}
