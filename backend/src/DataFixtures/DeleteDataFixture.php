<?php
namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class DeleteDataFixture extends Fixture
{
    public function load(ObjectManager $manager)
    {

        // Construire le chemin relatif vers data_loader.py
        $scriptPath = __DIR__ . '/data_loader.py';

        $process = new Process(['python', $scriptPath, 'delete']);
        $process->setTimeout(600);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        echo $process->getOutput();
    }
}
