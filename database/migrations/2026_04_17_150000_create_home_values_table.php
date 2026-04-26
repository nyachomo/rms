<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_values', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->default('📚');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        $values = [
            ['icon' => '📚', 'title' => 'Learner-Centred',         'description' => "Every program is designed around the learner's needs, pace, and real-world context for maximum impact.",                         'sort_order' => 1],
            ['icon' => '🎓', 'title' => 'Academic Rigour',          'description' => 'Our curricula are built on proven methodologies, current research, and industry best practices.',                                 'sort_order' => 2],
            ['icon' => '💡', 'title' => 'Practical Application',    'description' => 'We bridge theory and practice through hands-on exercises, case studies, and real-world simulations.',                            'sort_order' => 3],
            ['icon' => '🌍', 'title' => 'Inclusivity',              'description' => 'We create welcoming, accessible learning environments where every participant can grow and thrive.',                               'sort_order' => 4],
            ['icon' => '🔄', 'title' => 'Continuous Improvement',   'description' => 'We constantly update our programs to reflect evolving industry trends, technologies, and learner feedback.',                      'sort_order' => 5],
            ['icon' => '🤝', 'title' => 'Collaboration',            'description' => 'Learning thrives in community — we foster peer interaction, group work, and knowledge sharing.',                                  'sort_order' => 6],
            ['icon' => '🎯', 'title' => 'Outcome Focus',            'description' => 'Success is measured by what learners can do after training — skills gained, certifications earned, careers advanced.',            'sort_order' => 7],
            ['icon' => '🌱', 'title' => 'Lifelong Growth',          'description' => 'We inspire a culture of continuous learning that extends far beyond the classroom or course completion.',                         'sort_order' => 8],
        ];

        foreach ($values as $v) {
            DB::table('home_values')->insert(array_merge($v, ['created_at' => now(), 'updated_at' => now()]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('home_values');
    }
};
