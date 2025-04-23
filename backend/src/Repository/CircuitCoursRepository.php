<?php

namespace App\Repository;

use App\Entity\CircuitCours;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CircuitCours>
 */
class CircuitCoursRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CircuitCours::class);
    }

    /**
     * Trouver tous les circuits associés à un cours spécifique avec leurs détails
     */
    public function findCircuitsByCours(int $coursId): array
    {
        return $this->createQueryBuilder('cc')
            ->select('c.id, c.libelle, c.description, v.libelle as ville_centre')
            ->leftJoin('cc.circuit', 'c')
            ->leftJoin('c.ville_centre', 'v')
            ->where('cc.cours = :coursId')
            ->setParameter('coursId', $coursId)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Trouver tous les cours associés à un circuit spécifique
     */
    public function findCoursByCircuit(int $circuitId): array
    {
        return $this->createQueryBuilder('cc')
            ->select('c')
            ->leftJoin('cc.cours', 'c')
            ->where('cc.circuit = :circuitId')
            ->setParameter('circuitId', $circuitId)
            ->getQuery()
            ->getResult();
    }
}