<?php

namespace App\Entity;

use App\Repository\EleveRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;


use ApiPlatform\Metadata\ApiResource; // AJOUTEZ CA
use App\Entity\utils\Timestampable; // AJOUTEZ CA
#[ApiResource] // AJOUTEZ CA

#[ORM\Entity(repositoryClass: EleveRepository::class)]
class Eleve
{
    use Timestampable; // AJOUTEZ CA

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $date_examen_pratique = null;

    #[ORM\OneToOne(inversedBy: 'eleve', cascade: ['persist', 'remove'])]
    private ?Compte $compte = null;

    #[ORM\ManyToOne(inversedBy: 'eleves')]
    private ?AutoEcole $auto_ecole = null;

    /**
     * @var Collection<int, CentreExamen>
     */
    #[ORM\ManyToMany(targetEntity: CentreExamen::class, inversedBy: 'eleves')]
    private Collection $centres_exemen_favoris;

    /**
     * @var Collection<int, Cours>
     */
    #[ORM\ManyToMany(targetEntity: Cours::class, inversedBy: 'eleves')]
    private Collection $cours_favoris;

    /**
     * @var Collection<int, Circuit>
     */
    #[ORM\ManyToMany(targetEntity: Circuit::class, inversedBy: 'eleves')]
    private Collection $circuits_favoris;

    public function __construct()
    {
        $this->centres_exemen_favoris = new ArrayCollection();
        $this->cours_favoris = new ArrayCollection();
        $this->circuits_favoris = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateExamenPratique(): ?\DateTimeInterface
    {
        return $this->date_examen_pratique;
    }

    public function setDateExamenPratique(?\DateTimeInterface $date_examen_pratique): static
    {
        $this->date_examen_pratique = $date_examen_pratique;

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

    public function getAutoEcole(): ?AutoEcole
    {
        return $this->auto_ecole;
    }

    public function setAutoEcole(?AutoEcole $auto_ecole): static
    {
        $this->auto_ecole = $auto_ecole;

        return $this;
    }

    /**
     * @return Collection<int, CentreExamen>
     */
    public function getCentresExemenFavoris(): Collection
    {
        return $this->centres_exemen_favoris;
    }

    public function addCentresExemenFavori(CentreExamen $centresExemenFavori): static
    {
        if (!$this->centres_exemen_favoris->contains($centresExemenFavori)) {
            $this->centres_exemen_favoris->add($centresExemenFavori);
        }

        return $this;
    }

    public function removeCentresExemenFavori(CentreExamen $centresExemenFavori): static
    {
        $this->centres_exemen_favoris->removeElement($centresExemenFavori);

        return $this;
    }

    /**
     * @return Collection<int, Cours>
     */
    public function getCoursFavoris(): Collection
    {
        return $this->cours_favoris;
    }

    public function addCoursFavori(Cours $coursFavori): static
    {
        if (!$this->cours_favoris->contains($coursFavori)) {
            $this->cours_favoris->add($coursFavori);
        }

        return $this;
    }

    public function removeCoursFavori(Cours $coursFavori): static
    {
        $this->cours_favoris->removeElement($coursFavori);

        return $this;
    }

    /**
     * @return Collection<int, Circuit>
     */
    public function getCircuitsFavoris(): Collection
    {
        return $this->circuits_favoris;
    }

    public function addCircuitsFavori(Circuit $circuitsFavori): static
    {
        if (!$this->circuits_favoris->contains($circuitsFavori)) {
            $this->circuits_favoris->add($circuitsFavori);
        }

        return $this;
    }

    public function removeCircuitsFavori(Circuit $circuitsFavori): static
    {
        $this->circuits_favoris->removeElement($circuitsFavori);

        return $this;
    }
}
