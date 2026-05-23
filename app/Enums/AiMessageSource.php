<?php

namespace App\Enums;

enum AiMessageSource: string
{
    case Template = 'template';
    case Llm = 'llm';
}
