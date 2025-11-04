# =========================================
# Digital Files Restore Script (PowerShell)
# =========================================
# This script restores digital product files from a backup

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [switch]$Force
)

# Configuration
$TargetPath = "$PSScriptRoot\..\wwwroot\digital-files"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Digital Files Restore Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Host "ERROR: Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

# Check if target has existing files
$ExistingFiles = @()
if (Test-Path $TargetPath) {
    $ExistingFiles = Get-ChildItem -Path $TargetPath -File -Recurse
}

if ($ExistingFiles.Count -gt 0 -and -not $Force) {
    Write-Host "WARNING: Target directory contains $($ExistingFiles.Count) file(s)" -ForegroundColor Yellow
    Write-Host "Target: $TargetPath" -ForegroundColor Yellow
    Write-Host ""
    $Confirmation = Read-Host "This will overwrite existing files. Continue? (y/N)"
    if ($Confirmation -ne 'y' -and $Confirmation -ne 'Y') {
        Write-Host "Restore cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Perform restore
try {
    Write-Host "Starting restore..." -ForegroundColor Yellow
    Write-Host "Backup: $BackupFile" -ForegroundColor White
    Write-Host "Target: $TargetPath" -ForegroundColor White
    Write-Host ""

    # Create target directory if it doesn't exist
    if (-not (Test-Path $TargetPath)) {
        New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
    }

    # Extract backup
    $TempExtractPath = Join-Path $env:TEMP "digital-files-restore-$(Get-Date -Format 'yyyyMMddHHmmss')"
    Expand-Archive -Path $BackupFile -DestinationPath $TempExtractPath -Force

    # Find the digital-files folder in extracted content
    $ExtractedDigitalFiles = Get-ChildItem -Path $TempExtractPath -Directory -Recurse -Filter "digital-files" | Select-Object -First 1

    if ($null -eq $ExtractedDigitalFiles) {
        Write-Host "ERROR: Could not find digital-files folder in backup" -ForegroundColor Red
        Remove-Item -Path $TempExtractPath -Recurse -Force
        exit 1
    }

    # Copy files to target
    $FilesToRestore = Get-ChildItem -Path $ExtractedDigitalFiles.FullName -File -Recurse
    foreach ($File in $FilesToRestore) {
        $RelativePath = $File.FullName.Substring($ExtractedDigitalFiles.FullName.Length + 1)
        $DestPath = Join-Path $TargetPath $RelativePath
        $DestDir = Split-Path $DestPath -Parent

        if (-not (Test-Path $DestDir)) {
            New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
        }

        Copy-Item -Path $File.FullName -Destination $DestPath -Force
    }

    # Clean up temp
    Remove-Item -Path $TempExtractPath -Recurse -Force

    Write-Host "✓ Restore completed successfully!" -ForegroundColor Green
    Write-Host "Restored $($FilesToRestore.Count) file(s)" -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host "✗ Restore failed: $_" -ForegroundColor Red
    if (Test-Path $TempExtractPath) {
        Remove-Item -Path $TempExtractPath -Recurse -Force
    }
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restore Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Status: SUCCESS" -ForegroundColor Green
Write-Host "Files restored: $($FilesToRestore.Count)" -ForegroundColor White
Write-Host "Location: $TargetPath" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Test the restored files by:" -ForegroundColor Yellow
Write-Host "1. Restart your API server" -ForegroundColor White
Write-Host "2. Try downloading a digital product" -ForegroundColor White
Write-Host "3. Verify the file downloads correctly" -ForegroundColor White
