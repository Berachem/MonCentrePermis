<?php

namespace App\Repository;

use App\Entity\Circuit;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Circuit>
 */
class CircuitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Circuit::class);
    }

    /**
     * Trouver tous les circuits associés à un cours spécifique
     */
    public function findByCoursId(int $coursId): array
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('App\Entity\CircuitCours', 'cc', 'WITH', 'cc.circuit = c.id')
            ->where('cc.cours = :coursId')
            ->setParameter('coursId', $coursId)
            ->getQuery()
            ->getResult();
    }
}
