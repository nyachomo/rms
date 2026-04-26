<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_steps', function (Blueprint $table) {
            $table->id();
            $table->string('step_number')->default('01');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        $steps = [
            ['step_number' => '01', 'title' => 'Assess',   'description' => 'We identify your learning needs, skill gaps, and goals through a thorough pre-training needs analysis and consultation.',                              'sort_order' => 1],
            ['step_number' => '02', 'title' => 'Design',   'description' => 'Our facilitators craft a customized, industry-relevant curriculum with hands-on activities tailored to your context and objectives.',                   'sort_order' => 2],
            ['step_number' => '03', 'title' => 'Train',    'description' => 'Participants engage in interactive, practical sessions — online or in-person — guided by certified expert facilitators.',                              'sort_order' => 3],
            ['step_number' => '04', 'title' => 'Evaluate', 'description' => 'We measure learning outcomes, gather feedback, and provide post-training support to ensure skills are applied on the job.',                             'sort_order' => 4],
        ];

        foreach ($steps as $s) {
            DB::table('home_steps')->insert(array_merge($s, ['created_at' => now(), 'updated_at' => now()]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('home_steps');
    }
};
