<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemoryEmbedding extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'content',
        'embedding',
        'importance_score',
        'source_conversation_id',
    ];

    protected $casts = [
        'embedding' => 'array',
        'importance_score' => 'float',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
