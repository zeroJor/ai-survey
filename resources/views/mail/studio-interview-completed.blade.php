<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Entrevista completada</title>
</head>
<body style="font-family: system-ui, sans-serif; color: #1a1a1a; line-height: 1.5;">
    <h1 style="font-size: 1.25rem; color: #0077ff;">Entrevista completada</h1>

    <p><strong>Negocio:</strong> {{ $interview->invite->business_name }}</p>
    <p><strong>Contacto:</strong> {{ $interview->invite->contact_name }}</p>

    @if ($interview->completed_at)
        <p><strong>Completada:</strong> {{ $interview->completed_at->timezone(config('app.timezone'))->format('d/m/Y H:i') }}</p>
    @endif

    <p><strong>Progreso:</strong> {{ $answered }}/{{ $total }} preguntas</p>

    <p style="margin-top: 1.5rem;">
        <a href="{{ $adminUrl }}" style="color: #0077ff;">Ver en el panel de administración</a>
    </p>

    <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">
        Idwasoft — notificación automática
    </p>
</body>
</html>
