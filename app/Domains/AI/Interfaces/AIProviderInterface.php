<?php

namespace App\Domains\AI\Interfaces;

interface AIProviderInterface
{
    public function generateResponse(array $messages, array $options = []): array;
    public function generateStreamingResponse(array $messages, array $options = []): iterable;
    public function getModels(): array;
}
