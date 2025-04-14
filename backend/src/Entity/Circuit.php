<?php

namespace App\Entity;

use App\Repository\CircuitRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

use ApiPlatform\Metadata\ApiResource; // AJOUTEZ CA
use App\Entity\utils\Timestampable; // AJOUTEZ CA
#[ApiResource] // AJOUTEZ CA

#[ORM\Entity(repositoryClass: CircuitRepository::class)]
class Circuit
{
    use Timestampable; // AJOUTEZ CA

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $libelle = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'circuits')]
    private ?Ville $ville_centre = null;


    /**
     * @var Collection<int, Media>
     */
    #[ORM\ManyToMany(targetEntity: Media::class, inversedBy: 'circuits')]
    private Collection $medias;

    /**
     * @var Collection<int, Point>
     */
    #[ORM\OneToMany(targetEntity: Point::class, mappedBy: 'circuit')]
    private Collection $points;

    /**
     * @var Collection<int, Cours>
     */
    #[ORM\ManyToMany(targetEntity: Cours::class, inversedBy: 'circuits')]
    private Collection $cours;

    /**
     * @var Collection<int, Eleve>
     */
    #[ORM\ManyToMany(targetEntity: Eleve::class, mappedBy: 'circuits_favoris')]
    private Collection $eleves;

    // Ajoute la relation ManyToOne avec l'entité Moniteur
    #[ORM\ManyToOne(targetEntity: Moniteur::class, inversedBy: 'circuits')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty]  // Pas besoin de spécifier l'IRI ici, API Platform gère ça automatiquement
    private ?Moniteur $id_moniteur = null;

    

    public function __construct()
    {
        $this->medias = new ArrayCollection();
        $this->points = new ArrayCollection();
        $this->cours = new ArrayCollection();
        $this->eleves = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getVilleCentre(): ?Ville
    {
        return $this->ville_centre;
    }

    public function setVilleCentre(?Ville $ville_centre): static
    {
        $this->ville_centre = $ville_centre;

        return $this;
    }

    /**
     * @return Collection<int, Media>
     */
    public function getMedias(): Collection
    {
        return $this->medias;
    }

    public function addMedia(Media $media): static
    {
        if (!$this->medias->contains($media)) {
            $this->medias->add($media);
        }

        return $this;
    }

    public function removeMedia(Media $media): static
    {
        $this->medias->removeElement($media);

        return $this;
    }

    /**
     * @return Collection<int, Point>
     */
    public function getPoints(): Collection
    {
        return $this->points;
    }

    public function addPoint(Point $point): static
    {
        if (!$this->points->contains($point)) {
            $this->points->add($point);
            $point->setCircuit($this);
        }

        return $this;
    }

    public function removePoint(Point $point): static
    {
        if ($this->points->removeElement($point)) {
            // set the owning side to null (unless already changed)
            if ($point->getCircuit() === $this) {
                $point->setCircuit(null);
            }
        }

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
        }

        return $this;
    }

    public function removeCour(Cours $cour): static
    {
        $this->cours->removeElement($cour);

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
            $elefe->addCircuitsFavori($this);
        }

        return $this;
    }

    public function removeElefe(Eleve $elefe): static
    {
        if ($this->eleves->removeElement($elefe)) {
            $elefe->removeCircuitsFavori($this);
        }

        return $this;
    }

    public function getIdMoniteur(): ?Moniteur
    {
        return $this->id_moniteur;
    }

    public function setIdMoniteur(?Moniteur $id_moniteur): static
    {
        $this->id_moniteur = $id_moniteur;

        return $this;
    }
}
