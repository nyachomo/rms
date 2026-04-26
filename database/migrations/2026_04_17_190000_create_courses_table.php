<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('category'); // foundational, proficiency, mastery, corporate
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('icon_class')->nullable();
            $table->string('level')->nullable();
            $table->string('level_class')->nullable();
            $table->string('duration')->nullable();
            $table->integer('students_count')->default(0);
            $table->decimal('rating', 3, 1)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->string('price')->nullable();
            $table->json('tags')->nullable();
            $table->string('image_url')->nullable();
            $table->text('overview')->nullable();
            $table->string('badge')->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('status')->default('active');
            $table->timestamps();
        });

        $courses = [
            [
                'slug'          => 'digital-marketing',
                'category'      => 'foundational',
                'title'         => 'Digital Marketing',
                'subtitle'      => 'Master the Digital Marketing Ecosystem',
                'description'   => 'Master SEO, social media marketing, content strategy, and paid advertising to drive business growth in the digital landscape.',
                'icon'          => 'fas fa-bullhorn',
                'icon_class'    => 'orange',
                'level'         => 'Beginner',
                'level_class'   => 'level-beginner',
                'duration'      => '8 Weeks',
                'students_count'=> 245,
                'rating'        => 4.8,
                'reviews_count' => 89,
                'price'         => 'KES 25,000',
                'tags'          => json_encode(['SEO', 'Social Media', 'Content']),
                'image_url'     => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
                'overview'      => "This comprehensive Digital Marketing course equips you with the skills to plan, execute, and analyse effective digital marketing campaigns across multiple channels. From SEO and content marketing to paid advertising and social media strategy, you'll gain the practical tools needed to grow any business online.",
                'badge'         => 'Popular',
                'sort_order'    => 1,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'slug'          => 'uiux-design',
                'category'      => 'foundational',
                'title'         => 'UI/UX Design',
                'subtitle'      => 'Design Exceptional Digital Experiences',
                'description'   => 'Learn user-centred design principles, wireframing, prototyping, and usability testing to create exceptional digital experiences.',
                'icon'          => 'fas fa-pencil-ruler',
                'icon_class'    => 'teal',
                'level'         => 'Beginner',
                'level_class'   => 'level-beginner',
                'duration'      => '10 Weeks',
                'students_count'=> 198,
                'rating'        => 4.9,
                'reviews_count' => 72,
                'price'         => 'KES 28,000',
                'tags'          => json_encode(['Figma', 'Prototyping', 'UX Research']),
                'image_url'     => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
                'overview'      => "Dive into the world of user-centred design. This course takes you from the fundamentals of design thinking to advanced prototyping with Figma. You'll learn to research users, create wireframes, build prototypes, and conduct usability tests.",
                'badge'         => 'New',
                'sort_order'    => 2,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'slug'          => 'web-development',
                'category'      => 'proficiency',
                'title'         => 'Web Development',
                'subtitle'      => 'Build Modern, Full-Stack Web Applications',
                'description'   => 'Build modern, responsive websites and web applications using HTML, CSS, JavaScript, React, and backend technologies.',
                'icon'          => 'fas fa-code',
                'icon_class'    => 'purple',
                'level'         => 'Intermediate',
                'level_class'   => 'level-intermediate',
                'duration'      => '16 Weeks',
                'students_count'=> 312,
                'rating'        => 4.9,
                'reviews_count' => 134,
                'price'         => 'KES 45,000',
                'tags'          => json_encode(['React', 'Node.js', 'Laravel']),
                'image_url'     => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
                'overview'      => "A comprehensive full-stack web development course that takes you from HTML/CSS fundamentals to building production-ready applications with React and Laravel. You'll work on real projects and build a professional portfolio.",
                'badge'         => 'Bestseller',
                'sort_order'    => 3,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'slug'          => 'data-analysis',
                'category'      => 'proficiency',
                'title'         => 'Data Analysis',
                'subtitle'      => 'Turn Data into Actionable Business Insights',
                'description'   => 'Transform raw data into actionable insights using Excel, Python, SQL, and visualization tools like Power BI and Tableau.',
                'icon'          => 'fas fa-chart-bar',
                'icon_class'    => 'green',
                'level'         => 'Intermediate',
                'level_class'   => 'level-intermediate',
                'duration'      => '12 Weeks',
                'students_count'=> 276,
                'rating'        => 4.7,
                'reviews_count' => 98,
                'price'         => 'KES 38,000',
                'tags'          => json_encode(['Python', 'Power BI', 'SQL']),
                'image_url'     => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
                'overview'      => 'Learn to collect, clean, analyse, and visualise data to drive business decisions. This course covers Excel, SQL, Python (Pandas), and business intelligence tools including Power BI and Tableau.',
                'badge'         => 'Hot',
                'sort_order'    => 4,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'slug'          => 'cybersecurity',
                'category'      => 'mastery',
                'title'         => 'Cybersecurity',
                'subtitle'      => 'Defend, Detect, and Respond to Cyber Threats',
                'description'   => 'Gain expertise in network security, ethical hacking, threat analysis, and compliance frameworks to protect digital assets.',
                'icon'          => 'fas fa-shield-alt',
                'icon_class'    => 'red',
                'level'         => 'Advanced',
                'level_class'   => 'level-advanced',
                'duration'      => '20 Weeks',
                'students_count'=> 189,
                'rating'        => 4.8,
                'reviews_count' => 67,
                'price'         => 'KES 65,000',
                'tags'          => json_encode(['Ethical Hacking', 'CISSP', 'Network Security']),
                'image_url'     => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
                'overview'      => 'This advanced cybersecurity program prepares you for a career in information security. Covering ethical hacking, network defence, incident response, and compliance frameworks, this course aligns with industry certifications like CEH and CompTIA Security+.',
                'badge'         => 'Advanced',
                'sort_order'    => 5,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'slug'          => 'ai-ml',
                'category'      => 'mastery',
                'title'         => 'AI & Machine Learning',
                'subtitle'      => 'Build Intelligent Systems from Scratch',
                'description'   => 'Explore artificial intelligence, machine learning algorithms, deep learning, and NLP to build intelligent applications.',
                'icon'          => 'fas fa-robot',
                'icon_class'    => 'purple',
                'level'         => 'Advanced',
                'level_class'   => 'level-advanced',
                'duration'      => '24 Weeks',
                'students_count'=> 156,
                'rating'        => 4.9,
                'reviews_count' => 54,
                'price'         => 'KES 75,000',
                'tags'          => json_encode(['Python', 'TensorFlow', 'Deep Learning']),
                'image_url'     => 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
                'overview'      => "A deep dive into AI and machine learning covering supervised/unsupervised learning, deep neural networks, NLP, and computer vision. You'll build real-world AI applications using Python, TensorFlow, and scikit-learn.",
                'badge'         => 'Premium',
                'sort_order'    => 6,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'slug'          => 'digital-transformation',
                'category'      => 'corporate',
                'title'         => 'Digital Transformation',
                'subtitle'      => 'Lead Organisational Change in the Digital Age',
                'description'   => 'Lead organisational change through digital strategy, technology adoption, process automation, and change management.',
                'icon'          => 'fas fa-sync-alt',
                'icon_class'    => 'navy',
                'level'         => 'Advanced',
                'level_class'   => 'level-advanced',
                'duration'      => 'Customisable',
                'students_count'=> 423,
                'rating'        => 4.8,
                'reviews_count' => 112,
                'price'         => 'Contact Us',
                'tags'          => json_encode(['Strategy', 'Change Management', 'Automation']),
                'image_url'     => 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
                'overview'      => 'Equip your leadership team with the strategies and tools to drive digital transformation. This customisable corporate program covers technology adoption, change management, process automation, and building a digital-first culture.',
                'badge'         => 'Corporate',
                'sort_order'    => 7,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'slug'          => 'data-leadership',
                'category'      => 'corporate',
                'title'         => 'Data Leadership',
                'subtitle'      => 'Lead with Data — From Strategy to Execution',
                'description'   => 'Equip executives and managers with data literacy, governance frameworks, and analytics strategies for informed decision-making.',
                'icon'          => 'fas fa-user-tie',
                'icon_class'    => 'navy',
                'level'         => 'Advanced',
                'level_class'   => 'level-advanced',
                'duration'      => 'Customisable',
                'students_count'=> 198,
                'rating'        => 4.7,
                'reviews_count' => 61,
                'price'         => 'Contact Us',
                'tags'          => json_encode(['Data Strategy', 'Governance', 'Analytics']),
                'image_url'     => 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
                'overview'      => 'Designed for executives and senior managers, this program builds data literacy and analytical thinking skills. Participants learn to interpret data, build governance frameworks, and drive data-informed decisions across the organisation.',
                'badge'         => 'Executive',
                'sort_order'    => 8,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'slug'          => 'cyber-awareness',
                'category'      => 'corporate',
                'title'         => 'Cyber Awareness',
                'subtitle'      => 'Build a Security-First Organisational Culture',
                'description'   => 'Build a security-first culture across your organisation with practical training on phishing, social engineering, and compliance.',
                'icon'          => 'fas fa-eye',
                'icon_class'    => 'red',
                'level'         => 'Beginner',
                'level_class'   => 'level-beginner',
                'duration'      => '2 Days',
                'students_count'=> 867,
                'rating'        => 4.6,
                'reviews_count' => 203,
                'price'         => 'Contact Us',
                'tags'          => json_encode(['Phishing', 'Compliance', 'Security Culture']),
                'image_url'     => 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=80',
                'overview'      => 'A highly practical 2-day workshop designed to train all staff — regardless of technical background — on cyber threats and safe practices. Covers phishing, social engineering, password hygiene, and regulatory compliance.',
                'badge'         => 'Corporate',
                'sort_order'    => 9,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ];

        DB::table('courses')->insert($courses);
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
