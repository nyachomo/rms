<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_about', function (Blueprint $table) {
            $table->id();
            /* About section */
            $table->string('image_url')->nullable();
            $table->string('years_badge')->default('12+');
            $table->string('years_label')->default('Years of Excellence');
            $table->string('badge_text')->default('Who We Are');
            $table->string('title')->default('Empowering Growth Through');
            $table->string('title_highlight')->default('World-Class Training');
            $table->text('subtitle')->nullable();
            $table->text('quote_text')->nullable();
            $table->string('quote_author')->nullable();
            $table->json('features')->nullable();
            $table->string('cta_label')->default('Start Your Training Journey');
            $table->string('cta_link')->default('/contact');
            /* Core Values section header */
            $table->string('values_badge')->default('Our');
            $table->string('values_title')->default('Core Values');
            $table->string('values_title_highlight')->default('Values');
            $table->text('values_subtitle')->nullable();
            /* Process Steps section header */
            $table->string('steps_badge')->default('Our Methodology');
            $table->string('steps_title')->default('Our Training Process');
            $table->string('steps_title_highlight')->default('Process');
            $table->text('steps_subtitle')->nullable();
            $table->timestamps();
        });

        DB::table('home_about')->insert([
            'image_url'              => 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80',
            'years_badge'            => '12+',
            'years_label'            => 'Years of Excellence',
            'badge_text'             => 'Who We Are',
            'title'                  => 'Empowering Growth Through',
            'title_highlight'        => 'World-Class Training',
            'subtitle'               => 'We deliver transformative training programs that equip professionals, teams, and organizations with the skills needed to thrive in today\'s dynamic world.',
            'quote_text'             => 'Learning is the foundation of progress. We design every program to spark real change — in people, teams, and organizations.',
            'quote_author'           => 'CEO, Techsphere Digital Skills Academy',
            'features'               => json_encode([
                'Industry-Relevant Curriculum', 'Certified Expert Facilitators',
                'Hands-On Practical Learning',  'Flexible Online & In-Person',
                'Recognized Certifications',    'Tailored Corporate Programs',
                'Continuous Skills Development','Measurable Learning Outcomes',
            ]),
            'cta_label'              => 'Start Your Training Journey',
            'cta_link'               => '/contact',
            'values_badge'           => 'Our',
            'values_title'           => 'Core Values',
            'values_title_highlight' => 'Values',
            'values_subtitle'        => 'The principles that shape every course, every facilitator, and every learning experience we create.',
            'steps_badge'            => 'Our Methodology',
            'steps_title'            => 'Our Training Process',
            'steps_title_highlight'  => 'Process',
            'steps_subtitle'         => 'A proven four-step learning journey designed to equip every participant with practical skills and lasting impact.',
            'created_at'             => now(),
            'updated_at'             => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('home_about');
    }
};
