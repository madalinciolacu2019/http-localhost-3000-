$source = "c:\MadaDevelop\coffeexf1"
$dest = "c:\MadaDevelop\coffeexf1-source.zip"

if (Test-Path $dest) {
    Remove-Item $dest
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($dest, [System.IO.Compression.ZipArchiveMode]::Create)

# Get all files, excluding node_modules, .next, and .git directories
$files = Get-ChildItem -Path $source -Recurse | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\\.next\\' -and
    $_.FullName -notmatch '\\\.git\\'
}

foreach ($file in $files) {
    if (-not $file.PSIsContainer) {
        $relativePath = $file.FullName.Substring($source.Length + 1)
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relativePath)
    }
}

$zip.Dispose()
Write-Host "Project successfully zipped to $dest"
