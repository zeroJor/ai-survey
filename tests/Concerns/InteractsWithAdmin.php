<?php

namespace Tests\Concerns;

use App\Models\User;

trait InteractsWithAdmin
{
    protected function adminUser(): User
    {
        return User::factory()->idwasoft()->create();
    }

    protected function actingAsAdmin(): static
    {
        return $this->actingAs($this->adminUser());
    }
}
