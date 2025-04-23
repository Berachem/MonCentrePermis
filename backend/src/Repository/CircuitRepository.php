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

    /**
     * Trouve tous les circuits créés par un moniteur spécifique
     *
     * @return Circuit[]
     */
    public function findByMoniteurId(int $moniteurId): array
    {
        $qb = $this->createQueryBuilder('c');
        
        // 1. Si vous voulez voir tous les circuits sans filtrer, retirez le where
        // return $qb->getQuery()->getResult();
        
        // 2. Vérifiez le nom exact de la relation entre Circuit et Moniteur
        return $qb
            ->where('c.id_moniteur = :moniteur')
            ->setParameter('moniteur', $moniteurId)
            ->getQuery()
            ->getResult();
    }
}
