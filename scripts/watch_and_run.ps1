# Watch the project's `uploads` folder and run the Python analyzer on new files.
# This script polls the uploads folder and runs secret_analyzer.py on any new files.
param()

$root = Get-Location
$uploads = Join-Path $root 'uploads'
if (-not (Test-Path $uploads)) {
  New-Item -ItemType Directory -Path $uploads | Out-Null
}

Write-Host "Watching uploads folder: $uploads" -ForegroundColor Cyan
Write-Host "Press CTRL+C to stop watching..." -ForegroundColor Cyan

$python = $env:PYTHON
if (-not $python) { $python = 'python' }

$analyzerPath = Join-Path $root 'app\dashboard\secret_analyzer.py'
$processedFiles = @{}

while ($true) {
  try {
    # Get all files in the uploads folder
    $files = Get-ChildItem -Path $uploads -File 2>$null

    foreach ($file in $files) {
      $fileKey = $file.FullName
      
      # If we haven't processed this file yet, process it
      if (-not $processedFiles.ContainsKey($fileKey)) {
        Write-Host "[Watcher] New file detected: $($file.Name)" -ForegroundColor Yellow
        
        if (Test-Path $analyzerPath) {
          try {
            Write-Host "[Watcher] Running: $python $analyzerPath $fileKey" -ForegroundColor Green
            Write-Host "[Analyzer Output]:" -ForegroundColor Green
            & $python $analyzerPath $fileKey 2>&1 | ForEach-Object { Write-Host $_  }
            Write-Host "[Watcher] Done processing $($file.Name)" -ForegroundColor Green
          } catch {
            Write-Host "[Watcher] Execution failed: $_" -ForegroundColor Red
          }
        } else {
          Write-Host "[Watcher] ERROR: secret_analyzer.py not found at $analyzerPath" -ForegroundColor Red
        }
        
        # Mark this file as processed
        $processedFiles[$fileKey] = $true
      }
    }

    # Sleep briefly before checking again
    Start-Sleep -Milliseconds 500
  } catch {
    Write-Host "[Watcher] Error: $_" -ForegroundColor Red
  }
}
