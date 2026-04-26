<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_curriculum', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('week_label');
            $table->string('title');
            $table->json('topics')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        $seed = [
            'digital-marketing' => [
                ['week' => 'Week 1–2', 'title' => 'Digital Marketing Foundations', 'topics' => ['Overview of digital marketing channels', 'Setting SMART goals and KPIs', 'Understanding your target audience', 'Digital marketing tools overview']],
                ['week' => 'Week 3–4', 'title' => 'SEO & Content Marketing', 'topics' => ['On-page and off-page SEO', 'Keyword research and strategy', 'Content creation and blogging', 'Link building fundamentals']],
                ['week' => 'Week 5–6', 'title' => 'Social Media & Paid Advertising', 'topics' => ['Social media strategy and management', 'Facebook and Instagram Ads', 'Google Ads (Search & Display)', 'Campaign optimisation and A/B testing']],
                ['week' => 'Week 7–8', 'title' => 'Analytics & Capstone Project', 'topics' => ['Google Analytics 4 deep-dive', 'Data interpretation and reporting', 'Email marketing campaigns', 'Capstone: Full digital marketing campaign']],
            ],
            'uiux-design' => [
                ['week' => 'Week 1–2', 'title' => 'Design Thinking & Research', 'topics' => ['Design thinking process', 'User interviews and surveys', 'Competitive analysis', 'Personas and journey maps']],
                ['week' => 'Week 3–5', 'title' => 'Visual Design Principles', 'topics' => ['Colour theory and typography', 'Layout and grid systems', 'Iconography and imagery', 'Design systems and components']],
                ['week' => 'Week 6–8', 'title' => 'Figma & Prototyping', 'topics' => ['Figma fundamentals', 'Component libraries', 'Interactive prototyping', 'Motion and micro-interactions']],
                ['week' => 'Week 9–10', 'title' => 'Usability Testing & Portfolio', 'topics' => ['Usability testing methods', 'Analysing test results', 'Iterating on designs', 'Portfolio project presentation']],
            ],
            'web-development' => [
                ['week' => 'Week 1–4', 'title' => 'Frontend Fundamentals', 'topics' => ['HTML5 semantic markup', 'CSS3, Flexbox & Grid', 'JavaScript ES6+', 'Responsive design & mobile-first']],
                ['week' => 'Week 5–8', 'title' => 'React & Modern Frontend', 'topics' => ['React components and hooks', 'State management with Context API', 'React Router for SPA navigation', 'API integration with Axios']],
                ['week' => 'Week 9–12', 'title' => 'Laravel Backend Development', 'topics' => ['PHP fundamentals', 'Laravel MVC architecture', 'RESTful API design', 'Database design and Eloquent ORM']],
                ['week' => 'Week 13–16', 'title' => 'Full-Stack Integration & Deployment', 'topics' => ['Authentication (Sanctum/Passport)', 'File uploads and storage', 'CI/CD pipelines', 'Capstone: Full-stack application']],
            ],
            'data-analysis' => [
                ['week' => 'Week 1–3', 'title' => 'Data Fundamentals & Excel', 'topics' => ['Data types and structures', 'Advanced Excel functions', 'Pivot tables and charts', 'Data cleaning techniques']],
                ['week' => 'Week 4–6', 'title' => 'SQL & Databases', 'topics' => ['SQL syntax and queries', 'Joins, aggregations, and subqueries', 'Database design basics', 'Working with real datasets']],
                ['week' => 'Week 7–9', 'title' => 'Python for Data Analysis', 'topics' => ['Python basics for analysts', 'Pandas and NumPy', 'Data visualisation with Matplotlib/Seaborn', 'Exploratory Data Analysis (EDA)']],
                ['week' => 'Week 10–12', 'title' => 'BI Tools & Capstone', 'topics' => ['Power BI from scratch', 'DAX formulas', 'Tableau visualisations', 'Capstone: end-to-end data project']],
            ],
            'cybersecurity' => [
                ['week' => 'Week 1–4', 'title' => 'Security Foundations & Networking', 'topics' => ['TCP/IP and network protocols', 'Cryptography fundamentals', 'Security architecture', 'Threat landscape overview']],
                ['week' => 'Week 5–10', 'title' => 'Ethical Hacking', 'topics' => ['Reconnaissance and scanning', 'Exploitation techniques', 'Web application security (OWASP)', 'Wireless network attacks']],
                ['week' => 'Week 11–16', 'title' => 'Defence, SIEM & Compliance', 'topics' => ['Firewall and IDS/IPS configuration', 'SIEM tools (Splunk)', 'Security frameworks and auditing', 'Incident response procedures']],
                ['week' => 'Week 17–20', 'title' => 'Forensics & Capstone', 'topics' => ['Digital forensics methodology', 'Malware analysis basics', 'Security operations centre (SOC)', 'Capstone: full security assessment']],
            ],
            'ai-ml' => [
                ['week' => 'Week 1–6', 'title' => 'ML Foundations', 'topics' => ['Python for ML (NumPy, Pandas)', 'Supervised learning (regression, classification)', 'Model evaluation and validation', 'Feature engineering']],
                ['week' => 'Week 7–12', 'title' => 'Deep Learning', 'topics' => ['Neural network architectures', 'TensorFlow and Keras', 'CNNs for computer vision', 'Transfer learning']],
                ['week' => 'Week 13–18', 'title' => 'NLP & Advanced Topics', 'topics' => ['Text preprocessing', 'Transformers and BERT', 'Generative AI fundamentals', 'Reinforcement learning basics']],
                ['week' => 'Week 19–24', 'title' => 'MLOps & Capstone', 'topics' => ['Model deployment with Flask/FastAPI', 'MLflow for experiment tracking', 'Cloud ML (AWS/GCP)', 'Capstone: production AI application']],
            ],
            'digital-transformation' => [
                ['week' => 'Module 1', 'title' => 'Digital Strategy', 'topics' => ['Digital maturity assessment', 'Building the transformation business case', 'Technology landscape overview', 'Setting transformation goals']],
                ['week' => 'Module 2', 'title' => 'Change Management', 'topics' => ['Leading change frameworks (Kotter, ADKAR)', 'Stakeholder engagement', 'Communication strategies', 'Managing resistance']],
                ['week' => 'Module 3', 'title' => 'Technology & Automation', 'topics' => ['Cloud computing overview', 'Process automation and RPA', 'Data-driven decision making', 'Emerging technologies (AI, IoT, Blockchain)']],
                ['week' => 'Module 4', 'title' => 'Culture & Sustainability', 'topics' => ['Building digital culture', 'Agile ways of working', 'Measuring transformation success', 'Sustaining digital initiatives']],
            ],
            'data-leadership' => [
                ['week' => 'Module 1', 'title' => 'Data Literacy for Leaders', 'topics' => ['Understanding data types and sources', 'Reading dashboards and reports', 'Common data pitfalls', 'Asking the right questions of data']],
                ['week' => 'Module 2', 'title' => 'Data Strategy & Governance', 'topics' => ['Data strategy frameworks', 'Data governance structures', 'Data quality and integrity', 'Privacy and compliance (GDPR/Kenya DPA)']],
                ['week' => 'Module 3', 'title' => 'Analytics & Decision Making', 'topics' => ['Descriptive vs predictive analytics', 'Business intelligence tools overview', 'Building a data-driven culture', 'ROI of data investments']],
            ],
            'cyber-awareness' => [
                ['week' => 'Day 1', 'title' => 'Cyber Threat Landscape', 'topics' => ['Types of cyber attacks', 'Phishing simulations and recognition', 'Social engineering tactics', 'Real-world case studies']],
                ['week' => 'Day 2', 'title' => 'Safe Practices & Compliance', 'topics' => ['Password hygiene and 2FA', 'Safe internet and email use', 'Data protection regulations', 'Incident reporting procedures']],
            ],
        ];

        $courses = DB::table('courses')->pluck('id', 'slug');
        $rows = [];
        foreach ($seed as $slug => $sections) {
            $courseId = $courses[$slug] ?? null;
            if (!$courseId) continue;
            foreach ($sections as $i => $s) {
                $rows[] = [
                    'course_id'  => $courseId,
                    'week_label' => $s['week'],
                    'title'      => $s['title'],
                    'topics'     => json_encode($s['topics']),
                    'sort_order' => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('course_curriculum')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('course_curriculum');
    }
};
