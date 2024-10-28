<?php

namespace App\Entity;

use App\Repository\MoniteurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

use ApiPlatform\Metadata\ApiResource; // AJOUTEZ CA
use App\Entity\utils\Timestampable; // AJOUTEZ CA
#[ApiResource] // AJOUTEZ CA

#[ORM\Entity(repositoryClass: MoniteurRepository::class)]
class Moniteur
{

    use Timestampable; // AJOUTEZ CA

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $date_debut_carriere = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $numero_certification = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $status_activite = null;

    #[ORM\Column(options: ['default' => false])]
    private ?bool $compte_valide = null;

    #[ORM\OneToOne(inversedBy: 'moniteur', cascade: ['persist', 'remove'])]
    private ?Compte $compte = null;

    /**
     * @var Collection<int, AutoEcole>
     */
    #[ORM\ManyToMany(targetEntity: AutoEcole::class, inversedBy: 'moniteurs')]
    private Collection $autoEcoles;

    /**
     * @var Collection<int, Cours>
     */
    #[ORM\OneToMany(targetEntity: Cours::class, mappedBy: 'moniteur')]
    private Collection $cours;

    public function __construct()
    {
        $this->autoEcoles = new ArrayCollection();
        $this->cours = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateDebutCarriere(): ?\DateTimeInterface
    {
        return $this->date_debut_carriere;
    }

    public function setDateDebutCarriere(?\DateTimeInterface $date_debut_carriere): static
    {
        $this->date_debut_carriere = $date_debut_carriere;

        return $this;
    }

    public function getNumeroCertification(): ?string
    {
        return $this->numero_certification;
    }

    public function setNumeroCertification(?string $numero_certification): static
    {
        $this->numero_certification = $numero_certification;

        return $this;
    }

    public function getStatusActivite(): ?string
    {
        return $this->status_activite;
    }

    public function setStatusActivite(?string $status_activite): static
    {
        $this->status_activite = $status_activite;

        return $this;
    }

    public function isCompteValide(): ?bool
    {
        return $this->compte_valide;
    }

    public function setCompteValide(bool $compte_valide): static
    {
        $this->compte_valide = $compte_valide;

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
     * @return Collection<int, AutoEcole>
     */
    public function getAutoEcoles(): Collection
    {
        return $this->autoEcoles;
    }

    public function addAutoEcole(AutoEcole $autoEcole): static
    {
        if (!$this->autoEcoles->contains($autoEcole)) {
            $this->autoEcoles->add($autoEcole);
        }

        return $this;
    }

    public function removeAutoEcole(AutoEcole $autoEcole): static
    {
        $this->autoEcoles->removeElement($autoEcole);

        return $this;
    }

    /**
     * @return Collection<int, Cours>
     */
    public function getCours(): Collection
    {
        return $this->cours;
    }

    public function addCour(Cours $cour): static
    {
        if (!$this->cours->contains($cour)) {
            $this->cours->add($cour);
            $cour->setMoniteur($this);
        }

        return $this;
    }

    public function removeCour(Cours $cour): static
    {
        if ($this->cours->removeElement($cour)) {
            // set the owning side to null (unless already changed)
            if ($cour->getMoniteur() === $this) {
                $cour->setMoniteur(null);
            }
        }

        return $this;
    }
}
