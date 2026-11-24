<?php

namespace Tests\Fakes;

use PDO;

class FakePdo extends PDO
{
    public function __construct()
    {
        // Don't call parent constructor to avoid needing a real connection
    }
}
