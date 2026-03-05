<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\AI\Services\ProviderManager;
use Illuminate\Http\Request;
use App\Models\AiChat;
use App\Models\AiMessage;
use App\Domains\Billing\Services\UsageTracker;

class ChatController extends Controller
{
    public function sendMessage(Request $request, ProviderManager $manager, \App\Domains\AI\Services\LearningService $learningService)
    {
        $request->validate([
            'chat_id' => 'nullable|exists:ai_chats,id',
            'message' => 'required|string',
            'model' => 'required',
            'provider' => 'required|in:openai,ollama'
        ]);

        $user = $request->user();
        $tenant = $user->tenant;
        
        // Check billing limits first
        if (!app(UsageTracker::class)->checkLimits($tenant->id)) {
            return response()->json(['error' => 'Monthly quota exceeded. Please upgrade your plan.'], 403);
        }

        if ($request->chat_id) {
            $chat = AiChat::where('id', $request->chat_id)
                ->where('tenant_id', $tenant->id)
                ->firstOrFail();
        } else {
            $chat = AiChat::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'provider' => $request->provider,
                'model' => $request->model,
            ]);
        }

        // Persist message
        AiMessage::create([
            'ai_chat_id' => $chat->id,
            'role' => 'user',
            'content' => $request->message,
            'attachments' => $request->attachments ?? null
        ]);

        // FETCH SEMANTIC MEMORY & STRUCTURED KNOWLEDGE
        $adaptivePrompt = $learningService->getEnhancedSystemPrompt($tenant->id, $user->id, $request->message);

        // Fetch User Personalization for context
        $personalization = $user->personalization;
        if ($personalization) {
            $userName = $personalization->user_name ?? $user->name;
            $userNick = $personalization->user_nickname ?? $personalization->nickname ?? 'Commander';
            $agentName = $personalization->agent_name ?? 'Mona AI';
            $agentNick = $personalization->agent_nickname ?? 'Mona';
            $job = $personalization->occupation ?? 'authorized user';
            $location = $personalization->location ?? 'Unknown';
            $social = $personalization->social_handle ?? 'N/A';

            $systemMsg = "You are {$agentName} (also known as {$agentNick}), a highly advanced SaaS Intelligence platform built for efficiency. ";
            $systemMsg .= "The user identifies as {$userName} (Nickname: {$userNick}), who is a {$job}. ";
            $systemMsg .= "User Location: {$location}. Social Handle: {$social}. ";
            
            // Advanced Custom Instructions
            $systemMsg .= "Response Style: {$personalization->base_style}. ";
            $systemMsg .= "Personalization Characteristics: Warmth={$personalization->warmth}, Enthusiasm={$personalization->enthusiasm}, Formatting Preference (Headers/Lists)={$personalization->headers_lists}, Emoji Usage={$personalization->emoji_usage}. ";
            
            if ($personalization->about_you) $systemMsg .= "Contextual knowledge about the user: {$personalization->about_you}. ";
            $systemMsg .= "Instructional Tone: {$personalization->base_tone}. ";
            if ($personalization->custom_instructions) $systemMsg .= "Strict Behavioral Directives: {$personalization->custom_instructions}. ";
        } else {
            $systemMsg = "You are Mona AI, a highly advanced SaaS Intelligence platform built for efficiency. ";
        }

        // Prepend Adaptive Learning Knowledge to System Message
        $systemMsg .= "\n" . $adaptivePrompt;

        // Context compression: fetch last 10 messages only to manage context window
        $history = $chat->messages()
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->reverse()
            ->map(fn($m) => [
                'role' => $m->role,
                'content' => $m->content
            ])->toArray();

        // Prepend System Instructions
        array_unshift($history, ['role' => 'system', 'content' => $systemMsg]);

        $provider = $manager->driver($request->provider);

        // WEB SEARCH REASONING
        $searchData = null;
        $searchTriggers = ['search', 'latest', 'news', 'weather', 'price', 'today', 'current', 'who is', 'what is'];
        $isSearchRequest = str_contains(strtolower($request->message), 'search the web for:') || 
                           \Illuminate\Support\Str::contains(strtolower($request->message), $searchTriggers);

        if ($isSearchRequest) {
            $searchService = app(\App\Domains\AI\Services\WebSearchService::class);
            $query = str_replace('Search the web for:', '', $request->message);
            $searchData = $searchService->search(trim($query) ?: $request->message);
            $systemMsg .= "\n\n" . $searchData['context'];
            $systemMsg .= "\nInstruction: Use the SEARCH RESULTS provided above to answer the user's request accurately with real-time data. Mention your sources if helpful.";
            
            // Re-unshift system message with search results
            $history[0]['content'] = $systemMsg;
        }

        return new \Symfony\Component\HttpFoundation\StreamedResponse(function () use ($provider, $history, $request, $chat, $learningService, $tenant, $user, $searchData) {
            
            // Signal search start if metadata exists
            if ($searchData) {
                echo "data: " . json_encode(['searching' => true, 'query' => $request->message]) . "\n\n";
                echo "data: " . json_encode(['sources' => $searchData['sources']]) . "\n\n";
                ob_flush(); flush();
                usleep(500000); // Tiny pause for UI effect
            }

            $stream = $provider->generateStreamingResponse($history, [
                'model' => $request->model,
                'temperature' => $request->temperature ?? 0.7
            ]);
            
            $fullText = '';
            foreach ($stream as $chunk) {
                if (str_starts_with($chunk, 'System Error')) {
                    echo "data: " . json_encode(['error' => $chunk]) . "\n\n";
                    ob_flush(); flush();
                    break;
                }
                $fullText .= $chunk;
                echo "data: " . json_encode(['chunk' => $chunk]) . "\n\n";
                ob_flush(); flush();
            }

            // Save to DB
            $aiMsg = AiMessage::create([
                'ai_chat_id' => $chat->id,
                'role' => 'assistant',
                'content' => $fullText,
                'tokens_used' => 0
            ]);

            // TRIGGER ASYNC LEARNING PROCESS
            $learningService->learn($tenant->id, $user->id, $chat->id, $request->message);

            // Track usage approx
            $usage = (int)(str_word_count($fullText) * 1.5);
            app(UsageTracker::class)->log($tenant->id, 'tokens', $usage);

            echo "data: " . json_encode(['done' => true, 'chat_id' => $chat->id, 'usage' => $usage]) . "\n\n";
            ob_flush(); flush();

        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    public function getHistory(Request $request)
    {
        $chats = AiChat::where('user_id', $request->user()->id)
            ->with(['messages' => fn($q) => $q->orderBy('created_at', 'asc')->take(50)])
            ->latest()
            ->get();

        return response()->json($chats);
    }

    public function deleteChat(Request $request, $id)
    {
        $chat = AiChat::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Optional: delete associated messages if not cascading in DB
        $chat->messages()->delete();
        $chat->delete();

        return response()->json(['success' => true]);
    }

    public function getOllamaModels(ProviderManager $manager)
    {
        try {
            $models = $manager->driver('ollama')->getModels();
            if (empty($models)) {
                return response()->json([['name' => 'tinyllama']], 200);
            }
            return response()->json($models);
        } catch (\Exception $e) {
            return response()->json([['name' => 'tinyllama']], 200);
        }
    }
}
