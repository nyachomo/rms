<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@rms.local'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('SuperAdmin@2026'),
                'role_id'  => null,
                'status'   => 'active',
            ]
        );
    }
}
