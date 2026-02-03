<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login'])->name('login');
    Route::post('register', [AuthController::class, 'register'])->name('register');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('refresh', [AuthController::class, 'refresh'])->name('refresh');
    Route::post('me', [AuthController::class, 'me'])->name('me');
});


// Public Routes
Broadcast::routes(['middleware' => ['auth:api']]); // Ensure API auth is used for broadcasting

Route::get('posts/public', [App\Http\Controllers\PostController::class, 'index']);
Route::get('documents/public', [App\Http\Controllers\DocumentController::class, 'index']);
Route::get('organization-members/public', [App\Http\Controllers\OrganizationMemberController::class, 'index']);
Route::get('home-data', [App\Http\Controllers\PublicDataController::class, 'getHomeData']);
Route::get('stats', [App\Http\Controllers\PublicDataController::class, 'getStats']);
Route::post('surveys', [App\Http\Controllers\SurveyController::class, 'store']);
Route::get('info-cards', [App\Http\Controllers\InfoCardController::class, 'index']); // Public List
Route::get('info-cards/{slug}', [App\Http\Controllers\InfoCardController::class, 'show']); // Public Detail
Route::get('posts/{id}', [App\Http\Controllers\PostController::class, 'show']);
Route::get('agendas/{agenda}', [App\Http\Controllers\AgendaController::class, 'show']);
Route::get('pages/{type}', [App\Http\Controllers\PageController::class, 'show']);
Route::get('public/menus/{location}', [App\Http\Controllers\MenuController::class, 'show']); // Public access to menus by location

// Public Master Data for Registration Form
Route::get('faculties', [App\Http\Controllers\FacultyController::class, 'index']); // Public access for registration
Route::get('study-programs', [App\Http\Controllers\StudyProgramController::class, 'index']); // Public access for registration

Route::middleware(['auth:api'])->group(function () {
    Route::get('fiscal-years/active', [App\Http\Controllers\FiscalYearController::class, 'active']);
    Route::apiResource('fiscal-years', App\Http\Controllers\FiscalYearController::class);
    Route::apiResource('agendas', App\Http\Controllers\AgendaController::class)->except(['show']); 
    
    // Master Data
    Route::get('faculties/template', [App\Http\Controllers\FacultyController::class, 'downloadTemplate']);
    Route::post('faculties/import', [App\Http\Controllers\FacultyController::class, 'import']);
    // index is public (defined outside middleware), only protected routes here
    Route::post('faculties', [App\Http\Controllers\FacultyController::class, 'store']);
    Route::get('faculties/{faculty}', [App\Http\Controllers\FacultyController::class, 'show']);
    Route::put('faculties/{faculty}', [App\Http\Controllers\FacultyController::class, 'update']);
    Route::patch('faculties/{faculty}', [App\Http\Controllers\FacultyController::class, 'update']);
    Route::delete('faculties/{faculty}', [App\Http\Controllers\FacultyController::class, 'destroy']);

    Route::get('study-programs/template', [App\Http\Controllers\StudyProgramController::class, 'downloadTemplate']);
    Route::post('study-programs/import', [App\Http\Controllers\StudyProgramController::class, 'import']);
    // index is public (defined outside middleware), only protected routes here
    Route::post('study-programs', [App\Http\Controllers\StudyProgramController::class, 'store']);
    Route::get('study-programs/{study_program}', [App\Http\Controllers\StudyProgramController::class, 'show']);
    Route::put('study-programs/{study_program}', [App\Http\Controllers\StudyProgramController::class, 'update']);
    Route::patch('study-programs/{study_program}', [App\Http\Controllers\StudyProgramController::class, 'update']);
    Route::delete('study-programs/{study_program}', [App\Http\Controllers\StudyProgramController::class, 'destroy']);
    
    Route::apiResource('schemes', App\Http\Controllers\SchemeController::class);
    
    Route::get('users/template', [App\Http\Controllers\UserController::class, 'downloadTemplate']);
    Route::post('users/import', [App\Http\Controllers\UserController::class, 'import']);
    Route::apiResource('users', App\Http\Controllers\UserController::class); // Staff & Dosen
    Route::apiResource('students', App\Http\Controllers\StudentController::class); // Mahasiswa Only
    Route::apiResource('permissions', App\Http\Controllers\PermissionController::class);
    Route::apiResource('roles', App\Http\Controllers\RoleController::class);
    
    Route::apiResource('proposals', App\Http\Controllers\ProposalController::class);
    Route::get('reviews/proposals', [App\Http\Controllers\ReviewController::class, 'index']); // Special route list proposals for review
    Route::post('reviews', [App\Http\Controllers\ReviewController::class, 'store']);

    Route::apiResource('posts', App\Http\Controllers\PostController::class)->except(['show']);
    Route::apiResource('documents', App\Http\Controllers\DocumentController::class);
    
    Route::get('profile/me', [App\Http\Controllers\ProfileController::class, 'me']);
    Route::post('profile/update', [App\Http\Controllers\ProfileController::class, 'update']);
    Route::post('profile/stats', [App\Http\Controllers\ProfileController::class, 'updateStats']);

    // Notifications
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::patch('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);

    // KKN Module
    Route::get('kkn-locations/template', [App\Http\Controllers\KknLocationController::class, 'downloadTemplate']);
    Route::post('kkn-locations/import', [App\Http\Controllers\KknLocationController::class, 'import']);
    Route::apiResource('kkn-locations', App\Http\Controllers\KknLocationController::class);
    Route::apiResource('kkn-registrations', App\Http\Controllers\KknRegistrationController::class);
    
    // KKN Posko Management (Admin)
    Route::prefix('kkn/postos')->group(function () {
        Route::get('/template', [App\Http\Controllers\KknPostoController::class, 'downloadTemplate']);
        Route::post('/import', [App\Http\Controllers\KknPostoController::class, 'import']);
        Route::get('/', [App\Http\Controllers\KknPostoController::class, 'index']);
        Route::post('/', [App\Http\Controllers\KknPostoController::class, 'store']);
        Route::get('/available-students', [App\Http\Controllers\KknPostoController::class, 'availableStudents']);
        Route::get('/{id}', [App\Http\Controllers\KknPostoController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\KknPostoController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\KknPostoController::class, 'destroy']);
        Route::patch('/{id}/status', [App\Http\Controllers\KknPostoController::class, 'updateStatus']);
        
        // Member Management
        Route::get('/{id}/members', [App\Http\Controllers\KknPostoController::class, 'members']);
        Route::post('/{id}/members', [App\Http\Controllers\KknPostoController::class, 'addMember']);
        Route::put('/{id}/members/{memberId}', [App\Http\Controllers\KknPostoController::class, 'updateMember']);
        Route::delete('/{id}/members/{memberId}', [App\Http\Controllers\KknPostoController::class, 'removeMember']);
        
        // Bulk Operations
        Route::post('/{id}/assign-students', [App\Http\Controllers\KknPostoController::class, 'bulkAssignStudents']);
    });
    
    // Admin KKN Registration Management
    Route::prefix('admin/kkn-registrations')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\KknRegistrationController::class, 'index']);
        Route::get('/statistics', [App\Http\Controllers\Admin\KknRegistrationController::class, 'statistics']);
        Route::get('/{id}', [App\Http\Controllers\Admin\KknRegistrationController::class, 'show']);
        Route::post('/{id}/approve', [App\Http\Controllers\Admin\KknRegistrationController::class, 'approve']);
        Route::post('/{id}/reject', [App\Http\Controllers\Admin\KknRegistrationController::class, 'reject']);
        Route::post('/{id}/revise', [App\Http\Controllers\Admin\KknRegistrationController::class, 'requestRevision']);
        Route::post('/{id}/note', [App\Http\Controllers\Admin\KknRegistrationController::class, 'addNote']);
    });
    
    // KKN Reporting & Guidance
    Route::apiResource('kkn-reports', App\Http\Controllers\KknReportController::class);
    Route::put('kkn-reports/{id}/status', [App\Http\Controllers\KknReportController::class, 'updateStatus']); // Review

    Route::prefix('kkn-guidance')->group(function () {
        Route::get('/', [App\Http\Controllers\KknGuidanceController::class, 'index']);
        Route::post('/', [App\Http\Controllers\KknGuidanceController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\KknGuidanceController::class, 'show']);
        Route::post('/{id}/messages', [App\Http\Controllers\KknGuidanceController::class, 'storeMessage']);
    });
    
    // Student KKN Dashboard
    Route::prefix('dashboard/kkn')->group(function () {
        Route::get('/my-posto', [App\Http\Controllers\KknPostoController::class, 'myPosto']);
        Route::get('/my-posto/members', [App\Http\Controllers\KknPostoController::class, 'myPostoMembers']);
    });
    
    // Student KKN Registration (Legacy - kept for compatibility)
    Route::prefix('student/kkn')->group(function () {
        Route::get('/status', [App\Http\Controllers\Student\KknController::class, 'status']);
        Route::get('/profile', [App\Http\Controllers\Student\KknController::class, 'profile']);
        Route::post('/reupload', [App\Http\Controllers\Student\KknController::class, 'reupload']);
    });

    // KKN Assessment (Grading & Certificate)
    Route::prefix('kkn-grades')->group(function () {
        Route::get('/export', [App\Http\Controllers\KknGradeController::class, 'exportPdf']); // Admin Export
        Route::get('/', [App\Http\Controllers\KknGradeController::class, 'index']); // Staff Index
        Route::post('/', [App\Http\Controllers\KknGradeController::class, 'store']); // Staff Grade
        Route::get('/my-grade', [App\Http\Controllers\KknGradeController::class, 'myGrade']); // Student View
        Route::get('/certificate/download', [App\Http\Controllers\KknGradeController::class, 'downloadCertificate']); // Student Download
    });

    // Architecture Refinements
    Route::apiResource('reports', App\Http\Controllers\ReportController::class);
    Route::apiResource('galleries', App\Http\Controllers\GalleryController::class);
    Route::apiResource('organization-members', App\Http\Controllers\OrganizationMemberController::class);
    Route::get('surveys', [App\Http\Controllers\SurveyController::class, 'index']);

    // Menu Management
    Route::get('menus', [App\Http\Controllers\MenuController::class, 'index']);
    Route::get('menus/{id}', [App\Http\Controllers\MenuController::class, 'show']);
    Route::post('menus', [App\Http\Controllers\MenuController::class, 'store']);
    Route::post('menus/{id}/items', [App\Http\Controllers\MenuController::class, 'storeItem']);
    Route::put('menu-items/{id}', [App\Http\Controllers\MenuController::class, 'updateItem']);
    Route::delete('menu-items/{id}', [App\Http\Controllers\MenuController::class, 'destroyItem']);
    Route::post('menus/{id}/structure', [App\Http\Controllers\MenuController::class, 'updateStructure']);

    // Indonesia Regions
    Route::get('indonesia/provinces', [App\Http\Controllers\RegionController::class, 'provinces']);
    Route::get('indonesia/cities', [App\Http\Controllers\RegionController::class, 'cities']);
    Route::get('indonesia/districts', [App\Http\Controllers\RegionController::class, 'districts']);
    Route::get('indonesia/villages', [App\Http\Controllers\RegionController::class, 'villages']);
    
    // Master Data (Public Access for Registration)
    // Route::get('faculties', [App\Http\Controllers\FacultyController::class, 'index']);
    // Route::get('study-programs', [App\Http\Controllers\StudyProgramController::class, 'index']);
});


Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});
