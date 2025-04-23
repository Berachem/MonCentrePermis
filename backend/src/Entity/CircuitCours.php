<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\CircuitCoursRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CircuitCoursRepository::class)]
#[ORM\Table(name: "circuit_cours")]
#[ORM\UniqueConstraint(name: "unique_circuit_cours", columns: ["circuit_id", "cours_id"])]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Delete(),
        new Patch(),
    ],
    normalizationContext: ['groups' => ['circuitCours:read']],
    denormalizationContext: ['groups' => ['circuitCours:write']]
)]
class CircuitCours
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    #[ORM\Column]
    #[Groups(['circuitCours:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Circuit::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['circuitCours:read', 'circuitCours:write'])]
    #[Assert\NotNull]
    private ?Circuit $circuit = null;

    #[ORM\ManyToOne(targetEntity: Cours::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['circuitCours:read', 'circuitCours:write'])]
    #[Assert\NotNull]
    private ?Cours $cours = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCircuit(): ?Circuit
    {
        return $this->circuit;
    }

    public function setCircuit(?Circuit $circuit): self
    {
        $this->circuit = $circuit;
        return $this;
    }

    public function getCours(): ?Cours
    {
        return $this->cours;
    }

    public function setCours(?Cours $cours): self
    {
        $this->cours = $cours;
        return $this;
    }
}