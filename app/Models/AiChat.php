<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class AiChat extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'user_id', 'provider', 'model', 'title'];

    public function messages()
    {
        return $this->hasMany(AiMessage::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
