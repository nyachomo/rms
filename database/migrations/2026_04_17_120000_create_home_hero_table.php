<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_hero', function (Blueprint $table) {
            $table->id();
            $table->string('badge_text')->default('New batch starting soon!');
            $table->string('title_part1')->default('Launch Your');
            $table->string('title_highlight1')->default('Tech');
            $table->string('title_part2')->default('Career');
            $table->string('title_highlight2')->default('Today');
            $table->text('subtitle')->nullable();
            $table->string('btn1_label')->default('Explore Courses');
            $table->string('btn1_link')->default('/courses');
            $table->string('btn2_label')->default('Download Brochure');
            $table->string('stat1_value')->default('1,000+');
            $table->string('stat1_label')->default('Graduates');
            $table->string('stat2_value')->default('95%');
            $table->string('stat2_label')->default('Job Placement');
            $table->string('stat3_value')->default('50+');
            $table->string('stat3_label')->default('Industry Partners');
            $table->string('float_title')->default('Live Projects');
            $table->string('float_subtitle')->default('Real-world experience');
            $table->string('slide1_url')->nullable();
            $table->string('slide2_url')->nullable();
            $table->string('slide3_url')->nullable();
            $table->timestamps();
        });

        DB::table('home_hero')->insert([
            'badge_text'       => 'New batch starting soon!',
            'title_part1'      => 'Launch Your',
            'title_highlight1' => 'Tech',
            'title_part2'      => 'Career',
            'title_highlight2' => 'Today',
            'subtitle'         => 'Join Techsphere Digital Skills Academy and master cutting-edge technologies with industry experts. Transform your future with our comprehensive tech programs.',
            'btn1_label'       => 'Explore Courses',
            'btn1_link'        => '/courses',
            'btn2_label'       => 'Download Brochure',
            'stat1_value'      => '1,000+',
            'stat1_label'      => 'Graduates',
            'stat2_value'      => '95%',
            'stat2_label'      => 'Job Placement',
            'stat3_value'      => '50+',
            'stat3_label'      => 'Industry Partners',
            'float_title'      => 'Live Projects',
            'float_subtitle'   => 'Real-world experience',
            'slide1_url'       => 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80',
            'slide2_url'       => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80',
            'slide3_url'       => 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('home_hero');
    }
};
