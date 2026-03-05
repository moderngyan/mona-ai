<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemoryEmbedding;
use App\Models\LearnedKnowledge;
use App\Models\AiChat;
use App\Models\FineTuneDataset;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get system-wide or tenant-specific AI metrics.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        return response()->json([
            'metrics' => [
                'total_memories' => MemoryEmbedding::where('tenant_id', $tenantId)->count(),
                'vector_count' => MemoryEmbedding::where('tenant_id', $tenantId)->whereNotNull('embedding')->count(),
                'knowledge_keys' => LearnedKnowledge::where('tenant_id', $tenantId)->count(),
                'recent_fine_tunes' => FineTuneDataset::where('tenant_id', $tenantId)->latest()->take(5)->get(),
            ],
            'top_knowledge' => LearnedKnowledge::where('tenant_id', $tenantId)
                ->orderBy('confidence_score', 'desc')
                ->take(10)
                ->get(['key', 'value', 'confidence_score']),
            'usage_summary' => AiChat::where('tenant_id', $tenantId)
                ->selectRaw('model, count(*) as count')
                ->groupBy('model')
                ->get()
        ]);
    }
}
