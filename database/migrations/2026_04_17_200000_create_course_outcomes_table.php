<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->text('outcome');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        $seed = [
            'digital-marketing' => [
                'Develop comprehensive digital marketing strategies',
                'Master SEO techniques to improve organic search visibility',
                'Create and manage effective social media campaigns',
                'Run and optimise Google Ads and Facebook Ads campaigns',
                'Analyse marketing data to measure ROI and improve performance',
                'Build and execute email marketing campaigns',
            ],
            'uiux-design' => [
                'Apply design thinking and user-centred design methodologies',
                'Conduct user research and analyse findings',
                'Create wireframes and high-fidelity prototypes in Figma',
                'Design accessible and inclusive digital products',
                'Present and justify design decisions to stakeholders',
            ],
            'web-development' => [
                'Build responsive websites with HTML, CSS, and JavaScript',
                'Develop modern SPAs using React and React Router',
                'Create RESTful APIs with Laravel and PHP',
                'Work with MySQL databases and Eloquent ORM',
                'Deploy applications to cloud platforms',
                'Implement authentication and security best practices',
            ],
            'data-analysis' => [
                'Clean and transform datasets using Python and Excel',
                'Write SQL queries for data extraction and manipulation',
                'Build interactive dashboards in Power BI and Tableau',
                'Apply statistical analysis to business problems',
                'Communicate data insights to non-technical stakeholders',
            ],
            'cybersecurity' => [
                'Perform ethical hacking and penetration testing',
                'Analyse and mitigate network security threats',
                'Implement security frameworks (NIST, ISO 27001)',
                'Conduct digital forensics and incident response',
                'Prepare for CEH and CompTIA Security+ certifications',
            ],
            'ai-ml' => [
                'Implement supervised and unsupervised machine learning algorithms',
                'Build and train deep neural networks with TensorFlow/Keras',
                'Develop NLP applications for text classification and generation',
                'Apply computer vision techniques for image recognition',
                'Deploy ML models to production environments',
            ],
            'digital-transformation' => [
                'Develop and execute a comprehensive digital transformation roadmap',
                'Lead change management initiatives effectively',
                'Identify automation opportunities and implement RPA tools',
                'Build and sustain a digital-first organisational culture',
                'Measure and communicate digital transformation ROI',
            ],
            'data-leadership' => [
                'Interpret data reports and dashboards confidently',
                'Establish data governance and quality frameworks',
                'Build an analytics-driven organisational culture',
                'Make strategic decisions using data insights',
                'Evaluate and procure analytics tools and platforms',
            ],
            'cyber-awareness' => [
                'Identify and report phishing emails and social engineering attempts',
                'Apply strong password and account security practices',
                'Use corporate devices and networks safely',
                'Understand data protection responsibilities (GDPR/Kenya DPA)',
                'Respond appropriately to security incidents',
            ],
        ];

        $courses = DB::table('courses')->pluck('id', 'slug');
        $rows = [];
        foreach ($seed as $slug => $outcomes) {
            $courseId = $courses[$slug] ?? null;
            if (!$courseId) continue;
            foreach ($outcomes as $i => $outcome) {
                $rows[] = [
                    'course_id'  => $courseId,
                    'outcome'    => $outcome,
                    'sort_order' => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('course_outcomes')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('course_outcomes');
    }
};
