<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'name',
        'code',
        'quantity',
        'serial_number',
        'image_path',
        'description',
        'place_id',
        'status',
    ];

    // Status constants
    const STATUS_IN_STORE = 'IN_STORE';
    const STATUS_BORROWED = 'BORROWED';
    const STATUS_DAMAGED = 'DAMAGED';
    const STATUS_MISSING = 'MISSING';

    // Relationships
    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function borrowRecords()
    {
        return $this->hasMany(BorrowRecord::class);
    }
}