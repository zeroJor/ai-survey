<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Copia de tu entrevista</title>
</head>
<body style="font-family: system-ui, sans-serif; color: #1a1a1a; line-height: 1.5; max-width: 36rem;">
    <h1 style="font-size: 1.25rem; color: {{ $primaryColor }};">
        Gracias, {{ $interview->invite->contact_name }}
    </h1>

    <p>
        Aquí tienes una copia de las respuestas que compartiste sobre
        <strong>{{ $interview->invite->business_name }}</strong>.
        Nuestro equipo se pondrá en contacto contigo muy pronto.
    </p>

    @foreach ($questionRows as $row)
        <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid #eee;">
            <p style="margin: 0 0 0.25rem; font-weight: 600;">{{ $row['label'] }}</p>
            <p style="margin: 0; color: #444;">
                @if ($row['skipped'])
                    (Prefiere no contestar)
                @else
                    {{ $row['body'] }}
                @endif
            </p>
        </div>
    @endforeach

    <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">
        {{ $displayName }}
    </p>
</body>
</html>
