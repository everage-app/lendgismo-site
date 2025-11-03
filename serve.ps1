$port = 5100
$publicDir = Join-Path $PSScriptRoot "public"

Write-Host "Starting server on http://localhost:$port"
Write-Host "Serving: $publicDir"
Write-Host "Press Ctrl+C to stop"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "Server running at:"
Write-Host "  http://localhost:$port/"
Write-Host "  http://127.0.0.1:$port/"

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $path = $request.Url.LocalPath
            if ($path -eq "/") { $path = "/index.html" }
            
            $filePath = Join-Path $publicDir $path.TrimStart('/')
            
            Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] GET $path"
            
            if (Test-Path $filePath -PathType Leaf) {
                # Set content type
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($ext) {
                    ".html" { $response.ContentType = "text/html; charset=utf-8" }
                    ".css" { $response.ContentType = "text/css; charset=utf-8" }
                    ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                    ".json" { $response.ContentType = "application/json; charset=utf-8" }
                    ".png" { $response.ContentType = "image/png" }
                    ".jpg" { $response.ContentType = "image/jpeg" }
                    ".svg" { $response.ContentType = "image/svg+xml" }
                    ".mp4" { $response.ContentType = "video/mp4" }
                    ".webm" { $response.ContentType = "video/webm" }
                    ".vtt" { $response.ContentType = "text/vtt" }
                    default { $response.ContentType = "application/octet-stream" }
                }

                $fileStream = $null
                try {
                    $fileStream = [System.IO.File]::Open($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
                    $totalLength = $fileStream.Length
                    $response.AddHeader("Accept-Ranges", "bytes")

                    $rangeHeader = $request.Headers["Range"]
                    if ($rangeHeader -and $rangeHeader -match 'bytes=(\d+)-(\d*)') {
                        $start = [int64]$matches[1]
                        $end = if ($matches[2] -ne '') { [int64]$matches[2] } else { $totalLength - 1 }
                        if ($end -ge $totalLength) { $end = $totalLength - 1 }
                        if ($start -ge $totalLength) { $start = $totalLength - 1 }
                        $chunkSize = $end - $start + 1

                        $response.StatusCode = 206
                        $response.ContentLength64 = $chunkSize
                        $response.AddHeader("Content-Range", "bytes $start-$end/$totalLength")

                        $fileStream.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
                        $buffer = New-Object byte[] 65536
                        $remaining = $chunkSize
                        while ($remaining -gt 0) {
                            $toRead = [Math]::Min($buffer.Length, $remaining)
                            $read = $fileStream.Read($buffer, 0, $toRead)
                            if ($read -le 0) { break }
                            $response.OutputStream.Write($buffer, 0, $read)
                            $remaining -= $read
                        }
                    } else {
                        $response.StatusCode = 200
                        $response.ContentLength64 = $totalLength
                        $fileStream.CopyTo($response.OutputStream)
                    }
                } finally {
                    if ($fileStream) { $fileStream.Close() }
                }
            } else {
                # SPA fallback - serve index.html for unknown routes
                $indexPath = Join-Path $publicDir "index.html"
                if (Test-Path $indexPath) {
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.StatusCode = 200
                    $fileStream = [System.IO.File]::OpenRead($indexPath)
                    $response.ContentLength64 = $fileStream.Length
                    $fileStream.CopyTo($response.OutputStream)
                    $fileStream.Close()
                } else {
                    $response.StatusCode = 404
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                    $response.ContentLength64 = $buffer.Length
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                }
            }
        } catch {
            Write-Host "Error: $_" -ForegroundColor Red
        } finally {
            if ($response) {
                $response.Close()
            }
        }
    }
} finally {
    $listener.Stop()
}
