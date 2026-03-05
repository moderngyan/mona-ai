<?php

namespace App\Domains\AI\Services;

use App\Domains\AI\Interfaces\AIProviderInterface;
use InvalidArgumentException;

class ProviderManager
{
    protected $providers = [];

    public function registerProvider(string $name, AIProviderInterface $provider)
    {
        $this->providers[$name] = $provider;
    }

    public function driver(string $name): AIProviderInterface
    {
        if (!isset($this->providers[$name])) {
            throw new InvalidArgumentException("Bridge driver [{$name}] not defined.");
        }
        return $this->providers[$name];
    }
}
