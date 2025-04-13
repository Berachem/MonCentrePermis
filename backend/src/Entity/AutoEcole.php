<?php

namespace App\Entity;

use App\Repository\AutoEcoleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

use ApiPlatform\Metadata\ApiResource; // AJOUTEZ CA
use App\Entity\utils\Timestampable; // AJOUTEZ CA
#[ApiResource] // AJOUTEZ CA

#[ORM\Entity(repositoryClass: AutoEcoleRepository::class)]
class AutoEcole
{
    use Timestampable; // AJOUTEZ CA
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $numero_agrement = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $adresse = null;

    #[ORM\ManyToOne(inversedBy: 'autoEcoles')]
    private ?Ville $ville = null;

    #[ORM\OneToOne(inversedBy: 'autoEcole', cascade: ['persist', 'remove'])]
    private ?Compte $compte = null;

    /**
     * @var Collection<int, Moniteur>
     */
    #[ORM\ManyToMany(targetEntity: Moniteur::class, mappedBy: 'autoEcoles')]
    private Collection $moniteurs;

    /**
     * @var Collection<int, Eleve>
     */
    #[ORM\OneToMany(targetEntity: Eleve::class, mappedBy: 'auto_ecole')]
    private Collection $eleves;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $libelle = null;

    public function __construct()
    {
        $this->moniteurs = new ArrayCollection();
        $this->eleves = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumeroAgrement(): ?string
    {
        return $this->numero_agrement;
    }

    public function setNumeroAgrement(string $numero_agrement): static
    {
        $this->numero_agrement = $numero_agrement;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getVille(): ?Ville
    {
        return $this->ville;
    }

    public function setVille(?Ville $ville): static
    {
        $this->ville = $ville;

        return $this;
    }

    public function getCompte(): ?Compte
    {
        return $this->compte;
    }

    public function setCompte(?Compte $compte): static
    {
        $this->compte = $compte;

        return $this;
    }

    /**
     * @return Collection<int, Moniteur>
     */
    public function getMoniteurs(): Collection
    {
        return $this->moniteurs;
    }

    public function addMoniteur(Moniteur $moniteur): static
    {
        if (!$this->moniteurs->contains($moniteur)) {
            $this->moniteurs->add($moniteur);
            $moniteur->addAutoEcole($this);
        }

        return $this;
    }

    public function removeMoniteur(Moniteur $moniteur): static
    {
        if ($this->moniteurs->removeElement($moniteur)) {
            $moniteur->removeAutoEcole($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, Eleve>
     */
    public function getEleves(): Collection
    {
        return $this->eleves;
    }

    public function addElefe(Eleve $elefe): static
    {
        if (!$this->eleves->contains($elefe)) {
            $this->eleves->add($elefe);
            $elefe->setAutoEcole($this);
        }

        return $this;
    }

    public function removeElefe(Eleve $elefe): static
    {
        if ($this->eleves->removeElement($elefe)) {
            // set the owning side to null (unless already changed)
            if ($elefe->getAutoEcole() === $this) {
                $elefe->setAutoEcole(null);
            }
        }

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
}
