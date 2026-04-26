<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Find or create the canonical 'student' role
        $general = DB::table('roles')->whereRaw('LOWER(name) = ?', ['general-student'])->first();
        $ict     = DB::table('roles')->whereRaw('LOWER(name) = ?', ['ict-club-student'])->first();
        $student = DB::table('roles')->whereRaw('LOWER(name) = ?', ['student'])->first();

        if ($student) {
            $studentId = $student->id;
        } elseif ($general) {
            // Rename general-student → student
            DB::table('roles')->where('id', $general->id)->update([
                'name'        => 'student',
                'description' => 'Student',
                'updated_at'  => now(),
            ]);
            $studentId = $general->id;
        } else {
            $studentId = DB::table('roles')->insertGetId([
                'name'        => 'student',
                'description' => 'Student',
                'status'      => 'active',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // 2. Move users from old student roles to the canonical student role
        $oldIds = [];
        if ($general && $general->id !== $studentId) $oldIds[] = $general->id;
        if ($ict) $oldIds[] = $ict->id;

        if (!empty($oldIds)) {
            DB::table('users')->whereIn('role_id', $oldIds)->update(['role_id' => $studentId]);

            // Migrate any permissions from old roles (avoid duplicates)
            foreach ($oldIds as $oldId) {
                $oldPerms = DB::table('role_permissions')->where('role_id', $oldId)->get();
                foreach ($oldPerms as $perm) {
                    $exists = DB::table('role_permissions')
                        ->where('role_id', $studentId)
                        ->where('module',  $perm->module)
                        ->where('action',  $perm->action)
                        ->exists();
                    if (!$exists) {
                        DB::table('role_permissions')->insert([
                            'role_id'    => $studentId,
                            'module'     => $perm->module,
                            'action'     => $perm->action,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
                DB::table('role_permissions')->where('role_id', $oldId)->delete();
                DB::table('roles')->where('id', $oldId)->delete();
            }
        }

        // 3. Ensure the student role has learning.view permission
        $hasLearningView = DB::table('role_permissions')
            ->where('role_id', $studentId)
            ->where('module',  'learning')
            ->where('action',  'view')
            ->exists();

        if (!$hasLearningView) {
            DB::table('role_permissions')->insert([
                'role_id'    => $studentId,
                'module'     => 'learning',
                'action'     => 'view',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Reversing this migration is non-trivial; it is a one-way consolidation.
    }
};
