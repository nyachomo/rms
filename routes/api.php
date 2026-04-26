<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SchoolCategoryController;
use App\Http\Controllers\SchoolLevelController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SchoolClassController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ProgramEventController;
use App\Http\Controllers\HomePageController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\IntakeController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\IctClubController;
use App\Http\Controllers\CourseCategoryController;
use App\Http\Controllers\CourseLessonController;
use App\Http\Controllers\CourseModuleController;
use App\Http\Controllers\LearningController;

// Public routes
Route::post('/contact',           [ContactController::class, 'send']);
Route::get('/home-content',       [HomePageController::class, 'content']);
Route::get('/courses',            [CourseController::class, 'index']);
Route::get('/courses/{slug}',     [CourseController::class, 'show']);
Route::get('/theme',              [SettingController::class, 'theme']);
Route::get('/active-intakes',     [EnrollmentController::class, 'activeIntakes']);
Route::post('/enroll',            [EnrollmentController::class, 'store']);
Route::post('/ict-club/register',       [IctClubController::class, 'store']);
Route::get('/public-course-categories', [CourseCategoryController::class, 'publicIndex']);
Route::get('/public-school-levels',     [SchoolLevelController::class,   'publicIndex']);
Route::get('/public-classes',           [SchoolClassController::class,   'publicByLevel']);

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me',               [AuthController::class, 'me']);
        Route::put('/profile',          [AuthController::class, 'updateProfile']);
        Route::put('/password',         [AuthController::class, 'updatePassword']);
        Route::post('/logout',          [AuthController::class, 'logout']);
    });
});

// Protected resource routes (no prefix)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/schools',              [SchoolController::class, 'index']);
    Route::post('/schools',             [SchoolController::class, 'store']);

    // Static routes MUST come before the {school} wildcard
    Route::post('/schools/import',      [SchoolController::class, 'import']);
    Route::get('/schools/template',     [SchoolController::class, 'template']);
    Route::get('/schools/export-pdf',   [SchoolController::class, 'exportPdf']);
    Route::get('/schools/locations',    [SchoolController::class, 'locations']);
    Route::delete('/schools/all',       [SchoolController::class, 'destroyAll']);

    Route::put('/schools/{school}',     [SchoolController::class, 'update']);
    Route::delete('/schools/{school}',  [SchoolController::class, 'destroy']);

    // School categories
    Route::get('/school-categories',                    [SchoolCategoryController::class, 'index']);
    Route::post('/school-categories',                   [SchoolCategoryController::class, 'store']);
    Route::put('/school-categories/{schoolCategory}',   [SchoolCategoryController::class, 'update']);
    Route::delete('/school-categories/{schoolCategory}',[SchoolCategoryController::class, 'destroy']);

    // School levels
    Route::get('/school-levels',                  [SchoolLevelController::class, 'index']);
    Route::post('/school-levels',                 [SchoolLevelController::class, 'store']);
    Route::put('/school-levels/{schoolLevel}',    [SchoolLevelController::class, 'update']);
    Route::delete('/school-levels/{schoolLevel}', [SchoolLevelController::class, 'destroy']);

    // Users
    Route::get('/users',           [UserController::class, 'index']);
    Route::post('/users',          [UserController::class, 'store']);
    Route::put('/users/{user}',    [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // Roles
    Route::get('/roles',                        [RoleController::class, 'index']);
    Route::post('/roles',                       [RoleController::class, 'store']);
    Route::put('/roles/{role}',                 [RoleController::class, 'update']);
    Route::delete('/roles/{role}',              [RoleController::class, 'destroy']);
    Route::get('/roles/{role}/permissions',     [RolePermissionController::class, 'show']);
    Route::put('/roles/{role}/permissions',     [RolePermissionController::class, 'sync']);

    // Classes
    Route::get('/classes/all',              [SchoolClassController::class, 'all']);
    Route::get('/classes',                  [SchoolClassController::class, 'index']);
    Route::post('/classes',                 [SchoolClassController::class, 'store']);
    Route::put('/classes/{schoolClass}',    [SchoolClassController::class, 'update']);
    Route::delete('/classes/{schoolClass}', [SchoolClassController::class, 'destroy']);

    // Students
    Route::get('/students',                           [StudentController::class, 'index']);
    Route::post('/students',                          [StudentController::class, 'store']);
    Route::put('/students/{student}',                 [StudentController::class, 'update']);
    Route::post('/students/{student}/reset-password', [StudentController::class, 'resetPassword']);
    Route::delete('/students/{student}',              [StudentController::class, 'destroy']);

    // Teachers
    Route::get('/teachers',                           [TeacherController::class, 'index']);
    Route::post('/teachers',                          [TeacherController::class, 'store']);
    Route::put('/teachers/{teacher}',                 [TeacherController::class, 'update']);
    Route::post('/teachers/{teacher}/reset-password', [TeacherController::class, 'resetPassword']);
    Route::delete('/teachers/{teacher}',              [TeacherController::class, 'destroy']);

    // Program Events
    Route::get('/program-events/all',               [ProgramEventController::class, 'all']);
    Route::get('/program-events',                   [ProgramEventController::class, 'index']);
    Route::post('/program-events',                  [ProgramEventController::class, 'store']);
    Route::put('/program-events/{programEvent}',    [ProgramEventController::class, 'update']);
    Route::delete('/program-events/{programEvent}', [ProgramEventController::class, 'destroy']);

    // Home Page management
    Route::put('/home/hero',                              [HomePageController::class, 'updateHero']);
    Route::post('/home/bg-slides',                        [HomePageController::class, 'storeBgSlide']);
    Route::put('/home/bg-slides/{homeBgSlide}',           [HomePageController::class, 'updateBgSlide']);
    Route::delete('/home/bg-slides/{homeBgSlide}',        [HomePageController::class, 'destroyBgSlide']);
    Route::get('/home/hero-images',                       [HomePageController::class, 'heroImages']);
    Route::post('/home/hero-images',                      [HomePageController::class, 'storeHeroImage']);
    Route::put('/home/hero-images/{homeHeroImage}',       [HomePageController::class, 'updateHeroImage']);
    Route::delete('/home/hero-images/{homeHeroImage}',    [HomePageController::class, 'destroyHeroImage']);
    Route::put('/home/about',                             [HomePageController::class, 'updateAbout']);
    Route::get('/home/values',                            [HomePageController::class, 'indexValues']);
    Route::post('/home/values',                           [HomePageController::class, 'storeValue']);
    Route::put('/home/values/{homeValue}',                [HomePageController::class, 'updateValue']);
    Route::delete('/home/values/{homeValue}',             [HomePageController::class, 'destroyValue']);
    Route::get('/home/steps',                             [HomePageController::class, 'indexSteps']);
    Route::post('/home/steps',                            [HomePageController::class, 'storeStep']);
    Route::put('/home/steps/{homeStep}',                  [HomePageController::class, 'updateStep']);
    Route::delete('/home/steps/{homeStep}',               [HomePageController::class, 'destroyStep']);

    // Course categories
    Route::get('/course-categories',                         [CourseCategoryController::class, 'index']);
    Route::post('/course-categories',                        [CourseCategoryController::class, 'store']);
    Route::put('/course-categories/{courseCategory}',        [CourseCategoryController::class, 'update']);
    Route::delete('/course-categories/{courseCategory}',     [CourseCategoryController::class, 'destroy']);

    // Courses (admin)
    Route::get('/admin/courses',                                              [CourseController::class, 'adminIndex']);
    Route::post('/admin/courses',                                             [CourseController::class, 'store']);
    Route::put('/admin/courses/{course}',                                     [CourseController::class, 'update']);
    Route::delete('/admin/courses/{course}',                                  [CourseController::class, 'destroy']);
    Route::get('/admin/courses/{course}/outcomes',                            [CourseController::class, 'indexOutcomes']);
    Route::post('/admin/courses/{course}/outcomes',                           [CourseController::class, 'storeOutcome']);
    Route::put('/admin/courses/{course}/outcomes/{outcome}',                  [CourseController::class, 'updateOutcome']);
    Route::delete('/admin/courses/{course}/outcomes/{outcome}',               [CourseController::class, 'destroyOutcome']);
    Route::get('/admin/courses/{course}/curriculum',                          [CourseController::class, 'indexCurriculum']);
    Route::post('/admin/courses/{course}/curriculum',                         [CourseController::class, 'storeCurriculum']);
    Route::put('/admin/courses/{course}/curriculum/{item}',                   [CourseController::class, 'updateCurriculum']);
    Route::delete('/admin/courses/{course}/curriculum/{item}',                [CourseController::class, 'destroyCurriculum']);
    Route::get('/admin/courses/{course}/instructors',                         [CourseController::class, 'indexInstructors']);
    Route::post('/admin/courses/{course}/instructors',                        [CourseController::class, 'storeInstructor']);
    Route::put('/admin/courses/{course}/instructors/{instructor}',            [CourseController::class, 'updateInstructor']);
    Route::delete('/admin/courses/{course}/instructors/{instructor}',         [CourseController::class, 'destroyInstructor']);

    // Course modules (admin)
    Route::get('/admin/courses/{course}/modules',                              [CourseModuleController::class, 'index']);
    Route::post('/admin/courses/{course}/modules',                             [CourseModuleController::class, 'store']);
    Route::post('/admin/courses/{course}/modules/reorder',                     [CourseModuleController::class, 'reorder']);
    Route::put('/admin/courses/{course}/modules/{module}',                     [CourseModuleController::class, 'update']);
    Route::delete('/admin/courses/{course}/modules/{module}',                  [CourseModuleController::class, 'destroy']);

    // Course lessons nested under modules (admin)
    Route::get('/admin/courses/{course}/modules/{module}/lessons',             [CourseLessonController::class, 'index']);
    Route::post('/admin/courses/{course}/modules/{module}/lessons',            [CourseLessonController::class, 'store']);
    Route::post('/admin/courses/{course}/modules/{module}/lessons/reorder',    [CourseLessonController::class, 'reorder']);
    Route::put('/admin/courses/{course}/modules/{module}/lessons/{lesson}',    [CourseLessonController::class, 'update']);
    Route::delete('/admin/courses/{course}/modules/{module}/lessons/{lesson}', [CourseLessonController::class, 'destroy']);

    // Learning portal (student)
    Route::get('/learning/my-courses',                               [LearningController::class, 'myCourses']);
    Route::get('/learning/courses/{slug}',                           [LearningController::class, 'courseLessons']);
    Route::post('/learning/lessons/{lesson}/complete',               [LearningController::class, 'markComplete']);
    Route::delete('/learning/lessons/{lesson}/complete',             [LearningController::class, 'unmarkComplete']);

    // Intakes
    Route::get('/intakes',                          [IntakeController::class, 'index']);
    Route::post('/intakes',                         [IntakeController::class, 'store']);
    Route::put('/intakes/{intake}',                 [IntakeController::class, 'update']);
    Route::delete('/intakes/{intake}',              [IntakeController::class, 'destroy']);

    // Enrollments (admin)
    Route::get('/enrollments',                      [EnrollmentController::class, 'index']);
    Route::patch('/enrollments/{enrollment}/status',[EnrollmentController::class, 'updateStatus']);
    Route::delete('/enrollments/{enrollment}',      [EnrollmentController::class, 'destroy']);

    // ICT Club registrations (admin)
    Route::get('/ict-club/registrations',                                    [IctClubController::class, 'index']);
    Route::patch('/ict-club/registrations/{ictClubRegistration}/status',     [IctClubController::class, 'updateStatus']);
    Route::delete('/ict-club/registrations/{ictClubRegistration}',           [IctClubController::class, 'destroy']);

    // Company settings
    Route::get('/settings',             [SettingController::class, 'show']);
    Route::post('/settings',            [SettingController::class, 'update']);
    Route::delete('/settings/logo',     [SettingController::class, 'removeLogo']);
});
