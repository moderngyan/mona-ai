<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Invoice;
use App\Domains\AI\Services\ProviderManager;
use Illuminate\Support\Facades\Storage;

class ProcessInvoiceParsing implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected Invoice $invoice) {}

    public function handle(ProviderManager $manager): void
    {
        $this->invoice->update(['status' => 'processing']);

        $imagePath = Storage::path($this->invoice->file_path);
        // Simplified: In production, use OCR here or pass binary to Vision models
        $prompt = "Extract structured JSON from this invoice text: " . Storage::get($this->invoice->file_path);

        $provider = $manager->driver('ollama'); // Or tenant default
        $response = $provider->generateResponse([
            ['role' => 'user', 'content' => $prompt]
        ], [
            'model' => 'llama3.2', // Or model that supports extraction
            'format' => 'json'
        ]);

        $this->invoice->update([
            'status' => 'completed',
            'parsed_data' => json_decode($response['content'], true)
        ]);
    }
}
