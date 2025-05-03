<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\CentreExamenRepository;
use App\Repository\MoniteurRepository;
use App\Repository\CoursRepository;
use App\Repository\CircuitRepository;

class SearchController extends AbstractController
{
    /**
     * Recherche optimisée avec score de pertinence et limites.
     *
     * @param Request $request
     * @param CentreExamenRepository $centreRepo
     * @param MoniteurRepository     $moniteurRepo
     * @param CoursRepository        $coursRepo
     * @param CircuitRepository      $circuitRepo
     *
     * @return JsonResponse
     */
    #[Route('/api/search', name: 'api_search', methods: ['GET'])]
    public function search(
        Request $request,
        CentreExamenRepository $centreRepo,
        MoniteurRepository $moniteurRepo,
        CoursRepository $coursRepo,
        CircuitRepository $circuitRepo
    ): JsonResponse {
        // Paramètres de recherche
        $query = trim((string) $request->query->get('query', ''));
        $rating = $request->query->get('rating', null);
        $categories = (array) $request->query->get('categories');
        // Limites
        $limitPerCategory = max(1, (int) $request->query->get('limit_per_category', 30));
        $globalLimit       = max(1, (int) $request->query->get('limit', 90));

        $results = [];

        // Fonction utilitaire de score simple
        $computeScore = function(string $haystack, string $needle): int {
            $score = 0;
            if ($needle !== '' && stripos($haystack, $needle) !== false) {
                $score = 2;
            }
            return $score;
        };

        // Recherche Centres d'examen
        if (empty($categories) || in_array('exam_centers', $categories, true)) {
            $qb = $centreRepo->createQueryBuilder('c')
                ->where('LOWER(c.libelle) LIKE :q OR LOWER(c.adresse) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($query).'%')
                ->setMaxResults($limitPerCategory);

            if ($rating) {
                $qb->andWhere('c.rating >= :rating')
                   ->setParameter('rating', $rating);
            }

            foreach ($qb->getQuery()->getResult() as $centre) {
                $score = $computeScore($centre->getLibelle(), $query) + $computeScore($centre->getAdresse(), $query);
                $results[] = [
                    'type'      => 'exam_centers',
                    'id'        => $centre->getId(),
                    'label'     => $centre->getLibelle(),
                    'address'   => $centre->getAdresse(),
                    'relevance' => $score,
                ];
            }
        }

        // Recherche Moniteurs
        if (empty($categories) || in_array('monitors', $categories, true)) {
            $qb = $moniteurRepo->createQueryBuilder('m')
                ->join('m.compte', 'u')
                ->where('LOWER(u.nom) LIKE :q OR LOWER(u.prenom) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($query).'%')
                ->setMaxResults($limitPerCategory);

            if ($rating) {
                $qb->andWhere('m.rating >= :rating')
                   ->setParameter('rating', $rating);
            }

            foreach ($qb->getQuery()->getResult() as $moniteur) {
                $fullName = $moniteur->getCompte()->getPrenom().' '.$moniteur->getCompte()->getNom();
                $score = $computeScore($moniteur->getCompte()->getPrenom(), $query)
                       + $computeScore($moniteur->getCompte()->getNom(), $query);
                $results[] = [
                    'type'      => 'monitors',
                    // get l'id du compte et pas du moniteur car c'est l'id du compte qui est utiliser dans les urls
                    'id'        => $moniteur->getCompte()->getId(),
                    'label'     => $fullName,
                    'relevance' => $score,
                ];
            }
        }

        // Recherche Cours
        if (empty($categories) || in_array('courses', $categories, true)) {
            $qb = $coursRepo->createQueryBuilder('co')
                ->where('LOWER(co.libelle) LIKE :q OR LOWER(co.description) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($query).'%')
                ->setMaxResults($limitPerCategory);

            if ($rating) {
                $qb->andWhere('co.rating >= :rating')
                   ->setParameter('rating', $rating);
            }

            foreach ($qb->getQuery()->getResult() as $cours) {
                $score = $computeScore($cours->getLibelle(), $query)
                       + $computeScore($cours->getDescription() ?? '', $query);
                $results[] = [
                    'type'      => 'courses',
                    // On va get l'id du compte et pas du cours car c'est l'id du moniteur qui est utiliser dans les urls
                    'id'        => $cours->getMoniteur()->getCompte()->getId(),
                    'label'     => $cours->getLibelle(),
                    'relevance' => $score,
                ];
            }
        }

        // Tri global par pertinence et limitation
        usort($results, fn($a, $b) => $b['relevance'] <=> $a['relevance']);
        $results = array_slice($results, 0, $globalLimit);

        return $this->json($results);
    }
}
