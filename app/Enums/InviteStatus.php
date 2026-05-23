<?php

namespace App\Enums;

enum InviteStatus: string
{
    case Active = 'active';
    case Revoked = 'revoked';
}
