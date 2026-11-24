<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ["Admin", "Engineer", "Designer", "Product Manager", "Lead Architect", "QA Analyst"];
        $statuses = ["active", "active", "active", "inactive", "pending"];
        $firstNames = ["Sarah", "Alex", "Elena", "Marcus", "Kaveh", "Roya", "David", "Zara", "Nima", "Chloe", "Liam", "Fatemeh"];
        $lastNames = ["Chen", "Vance", "Rostami", "Sterling", "Tehrani", "Miller", "Rad", "Kim", "Moradi", "Taylor", "Nazari", "Novak"];

        $users = [];
        for ($i = 0; $i < 65; $i++) {
            $id = $i + 1;
            $fn = $firstNames[$i % count($firstNames)];
            $ln = $lastNames[($i * 3) % count($lastNames)];
            $role = $roles[$i % count($roles)];
            $status = $statuses[$i % count($statuses)];
            $score = 40 + (($i * 17) % 60);

            $day = 1 + ($i % 28);
            $month = 1 + ($i % 9);
            $jalaliMonthStr = str_pad((string)$month, 2, '0', STR_PAD_LEFT);
            $jalaliDayStr = str_pad((string)$day, 2, '0', STR_PAD_LEFT);
            $jalali_date = "1403/{$jalaliMonthStr}/{$jalaliDayStr}";

            $gregMonth = 3 + $month;
            $gregMonthStr = str_pad((string)$gregMonth, 2, '0', STR_PAD_LEFT);
            $created_at = "2024-{$gregMonthStr}-{$jalaliDayStr} 12:00:00";

            $users[] = [
                'id' => $id,
                'name' => "{$fn} {$ln}",
                'email' => strtolower("{$fn}.{$ln}{$id}@company.internal"),
                'role' => $role,
                'status' => $status,
                'score' => $score,
                'jalali_date' => $jalali_date,
                'created_at' => $created_at,
                'updated_at' => $created_at,
            ];
        }

        DB::table('users')->insert($users);

        $orders = [];
        for ($i = 0; $i < 50; $i++) {
            $id = 1000 + $i + 1;
            $user = $users[$i % count($users)];
            $amount = 150 + (($i * 83) % 4500);
            $orderStatuses = ["completed", "completed", "processing", "cancelled"];
            $status = $orderStatuses[$i % count($orderStatuses)];

            $day = 1 + (($i * 3) % 28);
            $month = 1 + ($i % 8);
            $monthStr = str_pad((string)$month, 2, '0', STR_PAD_LEFT);
            $dayStr = str_pad((string)$day, 2, '0', STR_PAD_LEFT);
            $order_date = "1403/{$monthStr}/{$dayStr}";

            $orders[] = [
                'id' => $id,
                'order_number' => "ORD-2026-" . (1000 + $i),
                'customer' => $user['name'],
                'amount' => $amount,
                'status' => $status,
                'order_date' => $order_date,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('orders')->insert($orders);
    }
}
