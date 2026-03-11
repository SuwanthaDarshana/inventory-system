<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cupboard extends Model
{
    protected $fillable = ['name'];

    // Relationships
    public function places()
    {
        return $this->hasMany(Place::class);
    }
}