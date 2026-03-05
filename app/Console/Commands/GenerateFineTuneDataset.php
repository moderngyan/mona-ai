<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AiChat;
use App\Models\Tenant;
use Illuminate\Support\Facades\Storage;

class GenerateFineTuneDataset extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:generate-dataset {tenant}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a fine-tuning dataset in JSONL format for a given tenant.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantId = $this->argument('tenant');
        $tenant = Tenant::findOrFail($tenantId);

        $this->info("Extracting high-confidence conversations for Tenant: {$tenant->name}");

        $chats = AiChat::where('tenant_id', $tenantId)
            ->with(['messages' => fn($q) => $q->orderBy('created_at', 'asc')])
            ->get();

        $dataset = [];

        foreach ($chats as $chat) {
            $messages = $chat->messages->map(fn($m) => [
                'role' => $m->role,
                'content' => $m->content,
            ])->toArray();

            // We only need conversations where the assistant responded
            if (count($messages) >= 2) {
                $dataset[] = ['messages' => $messages];
            }
        }

        if (empty($dataset)) {
            $this->error("No valid conversations found for this tenant.");
            return;
        }

        $fileName = "fine-tune/tenant_{$tenantId}_" . now()->format('Y-m-d_H-i-s') . ".jsonl";
        
        $jsonl = "";
        foreach ($dataset as $entry) {
            $jsonl .= json_encode($entry) . "\n";
        }

        Storage::disk('local')->put($fileName, $jsonl);

        $this->info("Dataset generated successfully at: " . Storage::path($fileName));

        // Create recording in fine_tune_datasets table
        \DB::table('fine_tune_datasets')->insert([
            'tenant_id' => $tenantId,
            'dataset_path' => $fileName,
            'model_base' => 'llama3.2', // default or config
            'status' => 'completed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
