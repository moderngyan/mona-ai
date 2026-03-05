<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPersonalization extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'user_nickname',
        'nickname',
        'agent_name',
        'agent_nickname',
        'occupation',
        'about_you',
        'custom_instructions',
        'social_handle',
        'location',
        'base_tone',
        'base_style',
        'warmth',
        'enthusiasm',
        'headers_lists',
        'emoji_usage',
        'memory_enabled',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
