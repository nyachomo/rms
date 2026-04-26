<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    /** Human-readable module names */
    public const MODULES = [
        'classes'           => 'Classes',
        'students'          => 'Students',
        'teachers'          => 'Teachers',
        'program_events'    => 'Program Events',
        'schools'           => 'Schools',
        'school_categories' => 'School Categories',
        'school_levels'     => 'School Levels',
        'roles'             => 'Roles',
        'users'             => 'Users',
        'homepage'          => 'Home Page',
        'courses'           => 'Courses',
        'course_categories' => 'Course Categories',
        'intakes'           => 'Intakes',
        'enrollments'       => 'Enrollments',
        'ict_club'          => 'ICT Club',
        'settings'          => 'Settings',
        'learning'          => 'Learning Portal',
    ];

    /** Per-module allowed actions — mirrors what the UI actually supports */
    public const MODULE_ACTIONS = [
        'classes'           => ['view', 'create', 'update', 'delete', 'view_stats'],
        'students'          => ['view', 'create', 'update', 'delete', 'view_stats'],
        'teachers'          => ['view', 'create', 'update', 'delete', 'view_stats'],
        'program_events'    => ['view', 'create', 'update', 'delete', 'view_stats'],
        'schools'           => ['view', 'create', 'update', 'delete', 'export', 'import', 'clear_all', 'view_stats'],
        'school_categories' => ['view', 'create', 'update', 'delete', 'view_stats'],
        'school_levels'     => ['view', 'create', 'update', 'delete', 'view_stats'],
        'roles'             => ['view', 'create', 'update', 'delete', 'manage_permissions', 'view_stats'],
        'users'             => ['view', 'create', 'update', 'delete', 'view_stats'],
        'homepage'          => ['view', 'update'],
        'courses'           => ['view', 'create', 'update', 'delete'],
        'course_categories' => ['view', 'create', 'update', 'delete'],
        'intakes'           => ['view', 'create', 'update', 'delete'],
        'enrollments'       => ['view', 'update', 'delete'],
        'ict_club'          => ['view', 'update', 'delete'],
        'settings'          => ['view', 'update'],
        'learning'          => ['view', 'manage'],
    ];

    /**
     * Return the permissions for a role as a nested map:
     * { schools: { view: true, export: false, ... }, ... }
     */
    public function show(Role $role): JsonResponse
    {
        $rows = RolePermission::where('role_id', $role->id)->get();

        $map = [];
        foreach (self::MODULE_ACTIONS as $module => $actions) {
            foreach ($actions as $action) {
                $map[$module][$action] = false;
            }
        }

        foreach ($rows as $row) {
            if (isset($map[$row->module][$row->action])) {
                $map[$row->module][$row->action] = true;
            }
        }

        return response()->json([
            'permissions'    => $map,
            'modules'        => self::MODULES,
            'module_actions' => self::MODULE_ACTIONS,
        ]);
    }

    /**
     * Sync permissions for a role.
     * Expects: { permissions: { schools: { view: true, export: false, ... }, ... } }
     */
    public function sync(Request $request, Role $role): JsonResponse
    {
        // Delete existing and re-insert granted ones
        RolePermission::where('role_id', $role->id)->delete();

        $rows = [];
        $now  = now();

        foreach ($request->input('permissions', []) as $module => $actions) {
            if (!array_key_exists($module, self::MODULE_ACTIONS)) continue;
            foreach ((array) $actions as $action => $granted) {
                if (!in_array($action, self::MODULE_ACTIONS[$module])) continue;
                if ($granted) {
                    $rows[] = [
                        'role_id'    => $role->id,
                        'module'     => $module,
                        'action'     => $action,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        if (!empty($rows)) {
            RolePermission::insert($rows);
        }

        return response()->json(['message' => 'Permissions saved successfully.']);
    }
}
