<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearnedKnowledge extends Model
{
    protected $table = 'learned_knowledge';

    protected $fillable = [
        'tenant_id',
        'key',
        'value',
        'confidence_score',
    ];

    protected $casts = [
        'confidence_score' => 'float',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
