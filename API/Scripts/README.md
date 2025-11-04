# Digital Files Backup & Restore Guide

This folder contains scripts for backing up and restoring digital product files.

## 📁 What Gets Backed Up

- Location: `API/wwwroot/digital-files/`
- Contents: All uploaded digital product files (PDFs, etc.)
- **IMPORTANT**: These files are NOT stored in git (see `.gitignore`)

---

## 🔄 Backup Script

### Manual Backup

```powershell
# Run from API/Scripts folder
.\backup-digital-files.ps1
```

This will:
1. Copy all files from `wwwroot/digital-files/`
2. Create a compressed ZIP archive
3. Store backup in `C:\Backups\Ecomm_Digital_Files\`
4. Name format: `digital-files_YYYY-MM-DD_HH-mm-ss.zip`
5. Clean up backups older than 30 days

### Custom Backup Location

```powershell
.\backup-digital-files.ps1 -BackupPath "D:\MyBackups" -RetentionDays 60
```

### Automated Daily Backups (Recommended)

#### Windows Task Scheduler Setup:

1. **Open Task Scheduler**
   - Press `Win + R`, type `taskschd.msc`, press Enter

2. **Create New Task**
   - Click "Create Task" (not "Create Basic Task")
   - Name: "Ecomm Digital Files Backup"
   - Description: "Daily backup of digital product files"
   - Check "Run whether user is logged on or not"
   - Check "Run with highest privileges"

3. **Triggers Tab**
   - Click "New"
   - Begin the task: "On a schedule"
   - Settings: Daily, start at 2:00 AM
   - Repeat task every: (leave unchecked)
   - Stop task if it runs longer than: 1 hour
   - Enabled: ✓

4. **Actions Tab**
   - Click "New"
   - Action: "Start a program"
   - Program/script: `powershell.exe`
   - Add arguments:
     ```
     -ExecutionPolicy Bypass -File "C:\Users\Administrator\source\repos\Ecomm_diplomski\API\Scripts\backup-digital-files.ps1"
     ```
   - Start in: `C:\Users\Administrator\source\repos\Ecomm_diplomski\API\Scripts`

5. **Conditions Tab**
   - Uncheck "Start the task only if the computer is on AC power"
   - Check "Wake the computer to run this task"

6. **Settings Tab**
   - Check "Allow task to be run on demand"
   - Check "Run task as soon as possible after a scheduled start is missed"
   - If the task fails, restart every: 10 minutes, 3 times

7. **Save** and enter your password when prompted

---

## ♻️ Restore Script

### Restore from Backup

```powershell
# List available backups
Get-ChildItem "C:\Backups\Ecomm_Digital_Files\" -Filter "*.zip"

# Restore from specific backup
.\restore-digital-files.ps1 -BackupFile "C:\Backups\Ecomm_Digital_Files\digital-files_2025-10-23_02-00-00.zip"

# Force restore without confirmation
.\restore-digital-files.ps1 -BackupFile "path\to\backup.zip" -Force
```

### Testing Restore Process

**Test monthly to ensure backups work!**

```powershell
# 1. Create a test restore location
$TestPath = "C:\Temp\DigitalFilesTest"
New-Item -ItemType Directory -Path $TestPath -Force

# 2. Extract backup to test location
$LatestBackup = Get-ChildItem "C:\Backups\Ecomm_Digital_Files\" -Filter "*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Expand-Archive -Path $LatestBackup.FullName -DestinationPath $TestPath -Force

# 3. Verify files
Get-ChildItem $TestPath -Recurse

# 4. Clean up
Remove-Item $TestPath -Recurse -Force
```

---

## ☁️ Cloud Backup (Optional but Recommended)

### Option 1: Google Drive / Dropbox / OneDrive

1. Install desktop sync app
2. Create folder: `Google Drive\Ecomm_Backups\`
3. Modify backup script to use that path:
   ```powershell
   .\backup-digital-files.ps1 -BackupPath "C:\Users\Administrator\Google Drive\Ecomm_Backups"
   ```

### Option 2: Azure Blob Storage

```powershell
# Install Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Upload backup to Azure
az storage blob upload `
  --account-name yourstorageaccount `
  --container-name backups `
  --name "digital-files_$(Get-Date -Format 'yyyy-MM-dd').zip" `
  --file "C:\Backups\Ecomm_Digital_Files\digital-files_latest.zip"
```

### Option 3: AWS S3

```powershell
# Install AWS CLI
# https://aws.amazon.com/cli/

# Upload to S3
aws s3 cp "C:\Backups\Ecomm_Digital_Files\digital-files_latest.zip" `
  s3://your-bucket-name/backups/
```

---

## 🚀 Deployment Checklist

When deploying to a new server:

### Initial Setup:

1. **Clone repository**
   ```bash
   git clone <your-repo-url>
   ```

2. **Create digital-files folder**
   ```powershell
   New-Item -ItemType Directory -Path "API\wwwroot\digital-files" -Force
   ```

3. **Restore from latest backup** (if migrating)
   ```powershell
   .\Scripts\restore-digital-files.ps1 -BackupFile "path\to\latest-backup.zip"
   ```

4. **Set up automated backups** (see Task Scheduler instructions above)

5. **Test download functionality**
   - Start API
   - Login as user with digital downloads
   - Try downloading a file
   - Verify file downloads correctly

### Ongoing Deployments:

**IMPORTANT**: The `wwwroot/digital-files/` folder should **NOT** be deleted during deployments!

- ✅ Update code via git pull
- ✅ Restart API service
- ❌ DO NOT delete wwwroot folder
- ❌ DO NOT run clean/rebuild that removes wwwroot

---

## 📊 Monitoring

### Check Backup Status

```powershell
# List recent backups
Get-ChildItem "C:\Backups\Ecomm_Digital_Files\" -Filter "*.zip" |
  Sort-Object LastWriteTime -Descending |
  Select-Object Name, Length, LastWriteTime -First 10

# Check disk space
Get-PSDrive C | Select-Object Used, Free
```

### Backup Health Checklist (Monthly):

- [ ] Check last backup date (should be daily)
- [ ] Verify backup file sizes are reasonable
- [ ] Test restore process with latest backup
- [ ] Check disk space on backup drive
- [ ] Review backup retention (clean up if needed)
- [ ] Verify cloud backup sync (if configured)

---

## 🆘 Disaster Recovery

### Scenario: Lost all digital files

1. **Stop the API** (prevent new purchases during recovery)

2. **Restore from latest backup**
   ```powershell
   .\restore-digital-files.ps1 -BackupFile "C:\Backups\Ecomm_Digital_Files\digital-files_LATEST.zip" -Force
   ```

3. **Verify files restored**
   ```powershell
   Get-ChildItem "API\wwwroot\digital-files" -Recurse
   ```

4. **Restart API**

5. **Test downloads** with a test user account

6. **Check logs** for any download errors

### Scenario: Corrupted files

1. **Identify affected files** (check error logs)

2. **Extract specific files from backup**
   ```powershell
   # Extract to temp location
   Expand-Archive -Path "backup.zip" -DestinationPath "C:\Temp\Recovery"

   # Copy specific file
   Copy-Item "C:\Temp\Recovery\digital-files\specific-file.pdf" `
            "API\wwwroot\digital-files\" -Force
   ```

3. **Test the specific download**

---

## 📞 Support

If you encounter issues:

1. Check backend logs: `API\Logs\`
2. Check Windows Event Viewer (Task Scheduler logs)
3. Verify file permissions on `wwwroot/digital-files/`
4. Test backup script manually before troubleshooting automation

---

## 📝 Notes

- Backups are **incremental** in size (only changed files)
- Compressed backups save ~50-70% disk space
- Default retention: 30 days (configurable)
- Backup location: `C:\Backups\Ecomm_Digital_Files\`
- Consider cloud backup for disaster recovery
- Test restore process regularly!

---

**Last Updated**: 2025-10-23
**Author**: Claude Code AI Assistant
