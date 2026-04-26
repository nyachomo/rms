<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_instructors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('name');
            $table->string('role')->nullable();
            $table->text('bio')->nullable();
            $table->string('image_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        $seed = [
            'digital-marketing' => [
                ['name' => 'Sarah Kamau', 'role' => 'Digital Marketing Strategist', 'bio' => '8+ years in digital marketing across e-commerce and B2B sectors.', 'image_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'],
            ],
            'uiux-design' => [
                ['name' => 'James Mwangi', 'role' => 'Senior UX Designer', 'bio' => '10+ years designing digital products for fintech and healthcare.', 'image_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'],
            ],
            'web-development' => [
                ['name' => 'Kevin Otieno', 'role' => 'Full-Stack Developer', 'bio' => '12+ years building web applications for startups and enterprises.', 'image_url' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80'],
            ],
            'data-analysis' => [
                ['name' => 'Grace Njeri', 'role' => 'Data Analyst & BI Specialist', 'bio' => '9+ years in data analytics across banking and retail sectors.', 'image_url' => 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80'],
            ],
            'cybersecurity' => [
                ['name' => 'Peter Ndegwa', 'role' => 'Certified Ethical Hacker (CEH)', 'bio' => '15+ years in cybersecurity, former government security consultant.', 'image_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'],
            ],
            'ai-ml' => [
                ['name' => 'Dr. Amina Hassan', 'role' => 'AI Research Scientist', 'bio' => 'PhD in Machine Learning, 10+ years in AI research and industry.', 'image_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80'],
            ],
            'digital-transformation' => [
                ['name' => 'John Kariuki', 'role' => 'Digital Transformation Trainer', 'bio' => '18+ years of experience in digital strategy and corporate technology training.', 'image_url' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80'],
            ],
            'data-leadership' => [
                ['name' => 'Dr. Fatima Ochieng', 'role' => 'Data Leadership Educator', 'bio' => 'PhD in Information Systems with extensive experience training executives in data strategy and governance.', 'image_url' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&q=80'],
            ],
            'cyber-awareness' => [
                ['name' => 'Samuel Waweru', 'role' => 'Cybersecurity Awareness Trainer', 'bio' => 'Delivered awareness training to 50+ organisations across East Africa.', 'image_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80'],
            ],
        ];

        $courses = DB::table('courses')->pluck('id', 'slug');
        $rows = [];
        foreach ($seed as $slug => $instructors) {
            $courseId = $courses[$slug] ?? null;
            if (!$courseId) continue;
            foreach ($instructors as $i => $ins) {
                $rows[] = [
                    'course_id'  => $courseId,
                    'name'       => $ins['name'],
                    'role'       => $ins['role'],
                    'bio'        => $ins['bio'],
                    'image_url'  => $ins['image_url'],
                    'sort_order' => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('course_instructors')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('course_instructors');
    }
};
