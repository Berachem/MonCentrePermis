<?php

namespace App\Entity;

use App\Repository\PermisRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

use ApiPlatform\Metadata\ApiResource; // AJOUTEZ CA
use App\Entity\utils\Timestampable; // AJOUTEZ CA
#[ApiResource] // AJOUTEZ CA

#[ORM\Entity(repositoryClass: PermisRepository::class)]
class Permis
{
    use Timestampable; // AJOUTEZ CA

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $code_permis = null;

    #[ORM\Column(length: 255)]
    private ?string $libelle = null;

    /**
     * @var Collection<int, Compte>
     */
    #[ORM\ManyToMany(targetEntity: Compte::class, mappedBy: 'permis')]
    private Collection $comptes;

    public function __construct()
    {
        $this->comptes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCodePermis(): ?string
    {
        return $this->code_permis;
    }

    public function setCodePermis(string $code_permis): static
    {
        $this->code_permis = $code_permis;

        return $this;
    }

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(string $libelle): static
    {
        $this->libelle = $libelle;

        return $this;
    }

    /**
     * @return Collection<int, Compte>
     */
    public function getComptes(): Collection
    {
        return $this->comptes;
    }

    public function addCompte(Compte $compte): static
    {
        if (!$this->comptes->contains($compte)) {
            $this->comptes->add($compte);
            $compte->addPermi($this);
        }

        return $this;
    }

    public function removeCompte(Compte $compte): static
    {
        if ($this->comptes->removeElement($compte)) {
            $compte->removePermi($this);
        }

        return $this;
    }
}
