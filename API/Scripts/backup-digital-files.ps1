# =========================================
# Digital Files Backup Script (PowerShell)
# =========================================
# This script backs up digital product files to a specified location
# Run daily via Windows Task Scheduler

param(
    [string]$BackupPath = "C:\Backups\Ecomm_Digital_Files",
    [int]$RetentionDays = 30
)

# Configuration
$SourcePath = "$PSScriptRoot\..\wwwroot\digital-files"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupName = "digital-files_$Timestamp"
$BackupFullPath = Join-Path $BackupPath $BackupName

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Digital Files Backup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if source exists
if (-not (Test-Path $SourcePath)) {
    Write-Host "ERROR: Source path not found: $SourcePath" -ForegroundColor Red
    exit 1
}

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupPath)) {
    Write-Host "Creating backup directory: $BackupPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

# Count files to backup
$FileCount = (Get-ChildItem -Path $SourcePath -File -Recurse).Count
$TotalSize = (Get-ChildItem -Path $SourcePath -File -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "Source: $SourcePath" -ForegroundColor White
Write-Host "Files to backup: $FileCount" -ForegroundColor White
Write-Host "Total size: $([math]::Round($TotalSize, 2)) MB" -ForegroundColor White
Write-Host ""

# Perform backup
try {
    Write-Host "Starting backup..." -ForegroundColor Yellow

    # Copy files
    Copy-Item -Path $SourcePath -Destination $BackupFullPath -Recurse -Force

    Write-Host "✓ Backup completed successfully!" -ForegroundColor Green
    Write-Host "Backup location: $BackupFullPath" -ForegroundColor Green
    Write-Host ""

    # Create compressed archive (optional)
    $ZipPath = "$BackupFullPath.zip"
    Write-Host "Creating compressed archive..." -ForegroundColor Yellow
    Compress-Archive -Path $BackupFullPath -DestinationPath $ZipPath -Force

    # Remove uncompressed backup (keep only zip)
    Remove-Item -Path $BackupFullPath -Recurse -Force

    $ZipSize = (Get-Item $ZipPath).Length / 1MB
    Write-Host "✓ Archive created: $([math]::Round($ZipSize, 2)) MB" -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host "✗ Backup failed: $_" -ForegroundColor Red
    exit 1
}

# Clean up old backups
Write-Host "Cleaning up old backups (retention: $RetentionDays days)..." -ForegroundColor Yellow
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
$OldBackups = Get-ChildItem -Path $BackupPath -Filter "digital-files_*.zip" |
    Where-Object { $_.LastWriteTime -lt $CutoffDate }

if ($OldBackups.Count -gt 0) {
    foreach ($OldBackup in $OldBackups) {
        Write-Host "  Deleting old backup: $($OldBackup.Name)" -ForegroundColor Gray
        Remove-Item $OldBackup.FullName -Force
    }
    Write-Host "✓ Removed $($OldBackups.Count) old backup(s)" -ForegroundColor Green
} else {
    Write-Host "  No old backups to remove" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Status: SUCCESS" -ForegroundColor Green
Write-Host "Files backed up: $FileCount" -ForegroundColor White
Write-Host "Backup location: $ZipPath" -ForegroundColor White
Write-Host "Timestamp: $Timestamp" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Schedule this script to run daily via Task Scheduler" -ForegroundColor White
Write-Host "2. Consider uploading backups to cloud storage" -ForegroundColor White
Write-Host "3. Test restore process monthly" -ForegroundColor White
