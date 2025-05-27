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

        // Fonction utilitaire de score améliorée
        $computeScore = function(string $haystack, string $needle): int {
            $score = 0;
            $haystack = mb_strtolower($haystack);
            $needle = mb_strtolower($needle);

            if ($needle === '') return 0;

            // Score maximum si correspondance exacte
            if ($haystack === $needle) {
                $score = 100;
            }
            // Score élevé si commence par le terme recherché
            elseif (strpos($haystack, $needle) === 0) {
                $score = 80;
            }
            // Score moyen si contient le terme
            elseif (stripos($haystack, $needle) !== false) {
                $score = 50;
            }
            // Score bonus pour les mots complets
            if (preg_match('/\b' . preg_quote($needle, '/') . '\b/i', $haystack)) {
                $score += 20;
            }

            return $score;
        };

        // Recherche Centres d'examen
        if (empty($categories) || in_array('exam_centers', $categories, true)) {
            $qb = $centreRepo->createQueryBuilder('c')
                ->leftJoin('c.ville', 'v')
                ->where('LOWER(c.libelle) LIKE :q OR LOWER(c.adresse) LIKE :q OR LOWER(v.libelle) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($query).'%')
                ->setMaxResults($limitPerCategory);

            if ($rating) {
                $qb->andWhere('c.rating >= :rating')
                   ->setParameter('rating', $rating);
            }

            foreach ($qb->getQuery()->getResult() as $centre) {
                $villeLibelle = $centre->getVille() ? $centre->getVille()->getLibelle() : '';
                $score = $computeScore($centre->getLibelle(), $query)
                       + $computeScore($centre->getAdresse(), $query)
                       + $computeScore($villeLibelle, $query);
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

            $moniteurs = $qb->getQuery()->getResult();

            foreach ($moniteurs as $moniteur) {
                if ($moniteur->getCompte()) {
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
        }

        // Recherche Cours
        if (empty($categories) || in_array('courses', $categories, true)) {
            $qb = $coursRepo->createQueryBuilder('co')
                ->leftJoin('co.moniteur', 'm')
                ->leftJoin('m.compte', 'u')
                ->where('LOWER(co.libelle) LIKE :q OR LOWER(co.description) LIKE :q OR LOWER(u.nom) LIKE :q OR LOWER(u.prenom) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($query).'%')
                ->setMaxResults($limitPerCategory);

            if ($rating) {
                $qb->andWhere('co.rating >= :rating')
                   ->setParameter('rating', $rating);
            }

            foreach ($qb->getQuery()->getResult() as $cours) {
                $moniteurNom = '';
                $moniteurPrenom = '';
                if ($cours->getMoniteur() && $cours->getMoniteur()->getCompte()) {
                    $moniteurNom = $cours->getMoniteur()->getCompte()->getNom();
                    $moniteurPrenom = $cours->getMoniteur()->getCompte()->getPrenom();
                }

                $score = $computeScore($cours->getLibelle(), $query)
                       + $computeScore($cours->getDescription() ?? '', $query)
                       + $computeScore($moniteurNom, $query)
                       + $computeScore($moniteurPrenom, $query);

                $results[] = [
                    'type'      => 'courses',
                    // On va get l'id du compte et pas du cours car c'est l'id du moniteur qui est utiliser dans les urls
                    'id'        => $cours->getMoniteur()->getCompte()->getId(),
                    'label'     => $cours->getLibelle(),
                    'relevance' => $score,
                ];
            }
        }

        // Recherche Circuits
        if (empty($categories) || in_array('circuits', $categories, true)) {
            $qb = $circuitRepo->createQueryBuilder('ci')
                ->where('LOWER(ci.libelle) LIKE :q OR LOWER(ci.description) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($query).'%')
                ->setMaxResults($limitPerCategory);

            foreach ($qb->getQuery()->getResult() as $circuit) {
                $score = $computeScore($circuit->getLibelle(), $query)
                       + $computeScore($circuit->getDescription() ?? '', $query);
                $results[] = [
                    'type'      => 'circuits',
                    'id'        => $circuit->getId(),
                    'label'     => $circuit->getLibelle(),
                    'relevance' => $score,
                ];
            }
        }

        // Amélioration du tri avec pondération par type
        usort($results, function($a, $b) {
            // Pondération par type pour équilibrer les résultats
            $typeWeights = [
                'exam_centers' => 1.2,  // Priorité élevée
                'monitors' => 1.1,      // Priorité élevée
                'courses' => 1.0,       // Priorité normale
                'circuits' => 0.9       // Priorité plus faible
            ];

            $weightA = $typeWeights[$a['type']] ?? 1.0;
            $weightB = $typeWeights[$b['type']] ?? 1.0;

            $scoreA = $a['relevance'] * $weightA;
            $scoreB = $b['relevance'] * $weightB;

            // Tri par score pondéré décroissant
            if ($scoreB !== $scoreA) {
                return $scoreB <=> $scoreA;
            }

            // En cas d'égalité, tri par pertinence brute
            return $b['relevance'] <=> $a['relevance'];
        });

        $results = array_slice($results, 0, $globalLimit);

        return $this->json($results);
    }
}