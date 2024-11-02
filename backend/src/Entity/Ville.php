<?php

namespace App\Entity;

use App\Repository\VilleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

use ApiPlatform\Metadata\ApiResource; // AJOUTEZ CA
use App\Entity\utils\Timestampable; // AJOUTEZ CA
#[ApiResource] // AJOUTEZ CA

#[ORM\Entity(repositoryClass: VilleRepository::class)]
class Ville
{
    use Timestampable; // AJOUTEZ CA

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $code = null;

    #[ORM\Column(length: 255)]
    private ?string $libelle = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $region = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $departement = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 8)]
    private ?string $latitude = null;
    
    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 8)]
    private ?string $longitude = null;    

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $code_postal = null;

    #[ORM\ManyToOne(inversedBy: 'villes')]
    private ?Pays $pays = null;

    /**
     * @var Collection<int, AutoEcole>
     */
    #[ORM\OneToMany(targetEntity: AutoEcole::class, mappedBy: 'ville')]
    private Collection $autoEcoles;

    /**
     * @var Collection<int, CentreExamen>
     */
    #[ORM\OneToMany(targetEntity: CentreExamen::class, mappedBy: 'ville')]
    private Collection $centreExamens;

    /**
     * @var Collection<int, Circuit>
     */
    #[ORM\OneToMany(targetEntity: Circuit::class, mappedBy: 'ville_centre')]
    private Collection $circuits;

    public function __construct()
    {
        $this->autoEcoles = new ArrayCollection();
        $this->centreExamens = new ArrayCollection();
        $this->circuits = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;

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

    public function getRegion(): ?string
    {
        return $this->region;
    }

    public function setRegion(?string $region): static
    {
        $this->region = $region;

        return $this;
    }

    public function getDepartement(): ?string
    {
        return $this->departement;
    }

    public function setDepartement(?string $departement): static
    {
        $this->departement = $departement;

        return $this;
    }

    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    public function setLatitude(string $latitude): static
    {
        $this->latitude = $latitude;

        return $this;
    }

    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    public function setLongitude(string $longitude): static
    {
        $this->longitude = $longitude;

        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->code_postal;
    }

    public function setCodePostal(?string $code_postal): static
    {
        $this->code_postal = $code_postal;

        return $this;
    }

    public function getPays(): ?Pays
    {
        return $this->pays;
    }

    public function setPays(?Pays $pays): static
    {
        $this->pays = $pays;

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
            $autoEcole->setVille($this);
        }

        return $this;
    }

    public function removeAutoEcole(AutoEcole $autoEcole): static
    {
        if ($this->autoEcoles->removeElement($autoEcole)) {
            // set the owning side to null (unless already changed)
            if ($autoEcole->getVille() === $this) {
                $autoEcole->setVille(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, CentreExamen>
     */
    public function getCentreExamens(): Collection
    {
        return $this->centreExamens;
    }

    public function addCentreExamen(CentreExamen $centreExamen): static
    {
        if (!$this->centreExamens->contains($centreExamen)) {
            $this->centreExamens->add($centreExamen);
            $centreExamen->setVille($this);
        }

        return $this;
    }

    public function removeCentreExamen(CentreExamen $centreExamen): static
    {
        if ($this->centreExamens->removeElement($centreExamen)) {
            // set the owning side to null (unless already changed)
            if ($centreExamen->getVille() === $this) {
                $centreExamen->setVille(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Circuit>
     */
    public function getCircuits(): Collection
    {
        return $this->circuits;
    }

    public function addCircuit(Circuit $circuit): static
    {
        if (!$this->circuits->contains($circuit)) {
            $this->circuits->add($circuit);
            $circuit->setVilleCentre($this);
        }

        return $this;
    }

    public function removeCircuit(Circuit $circuit): static
    {
        if ($this->circuits->removeElement($circuit)) {
            // set the owning side to null (unless already changed)
            if ($circuit->getVilleCentre() === $this) {
                $circuit->setVilleCentre(null);
            }
        }

        return $this;
    }
}
