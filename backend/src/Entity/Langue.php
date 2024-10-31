<?php

namespace App\Entity;

use App\Repository\LangueRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

use ApiPlatform\Metadata\ApiResource; // AJOUTEZ CA
use App\Entity\utils\Timestampable; // AJOUTEZ CA
#[ApiResource] // AJOUTEZ CA

#[ORM\Entity(repositoryClass: LangueRepository::class)]
class Langue
{

    use Timestampable; // AJOUTEZ CA
    
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $code_iso = null;

    #[ORM\Column(length: 255)]
    private ?string $libelle = null;

    /**
     * @var Collection<int, Compte>
     */
    #[ORM\ManyToMany(targetEntity: Compte::class, mappedBy: 'langues')]
    private Collection $comptes;

    public function __construct()
    {
        $this->comptes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCodeIso(): ?string
    {
        return $this->code_iso;
    }

    public function setCodeIso(string $code_iso): static
    {
        $this->code_iso = $code_iso;

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
            $compte->addLangue($this);
        }

        return $this;
    }

    public function removeCompte(Compte $compte): static
    {
        if ($this->comptes->removeElement($compte)) {
            $compte->removeLangue($this);
        }

        return $this;
    }
}
