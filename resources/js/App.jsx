import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

function ThemeLoader() {
    useEffect(() => {
        fetch('/api/theme')
            .then(r => r.json())
            .then(({ theme_primary, theme_navy }) => {
                if (theme_primary) document.documentElement.style.setProperty('--red',  theme_primary);
                if (theme_navy)    document.documentElement.style.setProperty('--navy', theme_navy);
            })
            .catch(() => {});
    }, []);
    return null;
}

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Contact from './pages/Contact';
import IctClub from './pages/IctClub';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import ProgramEvents from './pages/ProgramEvents';
import HomePage from './pages/HomePage';
import AdminCourses from './pages/AdminCourses';
import Intakes from './pages/Intakes';
import Classes from './pages/Classes';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import SchoolCategories from './pages/SchoolCategories';
import SchoolLevels from './pages/SchoolLevels';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Enrol from './pages/Enrol';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminIctClub from './pages/AdminIctClub';
import AdminCourseCategories from './pages/AdminCourseCategories';
import AdminCourseLessons from './pages/AdminCourseLessons';
import Learning from './pages/Learning';
import CourseLearner from './pages/CourseLearner';
import LearnerProfile from './pages/LearnerProfile';
import CodePractice from './pages/CodePractice';

import '../css/app.css';

/* Wrapper that enforces auth for all /dashboard/* children */
function DashboardGuard() {
    return (
        <ProtectedRoute>
            <Outlet />
        </ProtectedRoute>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeLoader />
                <Routes>
                    {/* Auth — no navbar/footer */}
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* All dashboard routes — protected by DashboardGuard */}
                    <Route path="/dashboard" element={<DashboardGuard />}>
                        <Route index                 element={<Students />} />
                        <Route path="teachers"       element={<Teachers />} />
                        <Route path="program-events" element={<ProgramEvents />} />
                        <Route path="homepage"       element={<HomePage />} />
                        <Route path="courses"        element={<AdminCourses />} />
                        <Route path="intakes"        element={<Intakes />} />
                        <Route path="enrollments"    element={<AdminEnrollments />} />
                        <Route path="ict-club"            element={<AdminIctClub />} />
                        <Route path="course-categories"   element={<AdminCourseCategories />} />
                        <Route path="courses/:courseId/lessons" element={<AdminCourseLessons />} />
                        <Route path="classes"        element={<Classes />} />
                        <Route path="profile"        element={<Profile />} />
                        <Route path="schools"        element={<Schools />} />
                        <Route path="school-categories" element={<SchoolCategories />} />
                        <Route path="school-levels"  element={<SchoolLevels />} />
                        <Route path="roles"          element={<Roles />} />
                        <Route path="users"          element={<Users />} />
                        <Route path="settings"       element={<Settings />} />
                    </Route>

                    {/* Learning portal — student-facing, no public navbar */}
                    <Route path="/learn" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
                    <Route path="/learn/profile" element={<ProtectedRoute><LearnerProfile /></ProtectedRoute>} />
                    <Route path="/learn/code-practice" element={<ProtectedRoute><CodePractice /></ProtectedRoute>} />
                    <Route path="/learn/:courseSlug" element={<ProtectedRoute><CourseLearner /></ProtectedRoute>} />

                    {/* Public site — with navbar/footer */}
                    <Route path="/*" element={
                        <>
                            <CookieBanner />
                            <Navbar />
                            <main>
                                <Routes>
                                    <Route path="/"                  element={<Home />} />
                                    <Route path="/courses"           element={<Courses />} />
                                    <Route path="/courses/:courseId" element={<CourseDetail />} />
                                    <Route path="/enroll/:courseSlug" element={<Enrol />} />
                                    <Route path="/contact"           element={<Contact />} />
                                    <Route path="/ict-club"          element={<IctClub />} />
                                    <Route path="*"                  element={<NotFound />} />
                                </Routes>
                            </main>
                            <Footer />
                        </>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

function NotFound() {
    return (
        <div style={{ padding: '180px 20px 80px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '4rem', color: '#fe730c', marginBottom: '24px' }}></i>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', color: '#081f4e', fontSize: '2rem', marginBottom: '12px' }}>Page Not Found</h1>
            <p style={{ color: '#666', marginBottom: '28px', fontSize: '1.05rem' }}>The page you're looking for doesn't exist.</p>
            <a href="/" style={{ background: '#fe730c', color: '#fff', padding: '14px 32px', borderRadius: '50px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                Go Home
            </a>
        </div>
    );
}

createRoot(document.getElementById('root')).render(<App />);
