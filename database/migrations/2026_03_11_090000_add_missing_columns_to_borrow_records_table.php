<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrow_records', function (Blueprint $table) {
            if (!Schema::hasColumn('borrow_records', 'return_date')) {
                $table->date('return_date')->nullable()->after('expected_return_date');
            }
            if (!Schema::hasColumn('borrow_records', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('item_id')->constrained();
            }
        });
    }

    public function down(): void
    {
        Schema::table('borrow_records', function (Blueprint $table) {
            $table->dropColumn(['return_date', 'user_id']);
        });
    }
};
