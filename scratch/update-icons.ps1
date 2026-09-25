Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\Office\Downloads\app images\quran.png"
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found at $sourcePath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($sourcePath)
Write-Host "Source image loaded: $($srcImage.Width) x $($srcImage.Height)"

# Copy original to public folder
Copy-Item -Path $sourcePath -Destination "public\app-icon.png" -Force
Copy-Item -Path $sourcePath -Destination "public\favicon.png" -Force

$resPath = "android\app\src\main\res"

$densities = @(
    @{ Name = "mipmap-mdpi"; LauncherSize = 48; ForegroundSize = 108 },
    @{ Name = "mipmap-hdpi"; LauncherSize = 72; ForegroundSize = 162 },
    @{ Name = "mipmap-xhdpi"; LauncherSize = 96; ForegroundSize = 216 },
    @{ Name = "mipmap-xxhdpi"; LauncherSize = 144; ForegroundSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; LauncherSize = 192; ForegroundSize = 432 }
)

function Draw-Fit-Image($source, $targetSize, $paddingRatio, $isCircular, $outputPath) {
    $destImage = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($isCircular) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $targetSize, $targetSize)
        $graphics.SetClip($path)
    }

    $availableSize = $targetSize * (1.0 - $paddingRatio * 2)
    $scale = [Math]::Min($availableSize / $source.Width, $availableSize / $source.Height)
    $drawW = [Math]::Max(1, [int]($source.Width * $scale))
    $drawH = [Math]::Max(1, [int]($source.Height * $scale))
    $posX = [int](($targetSize - $drawW) / 2)
    $posY = [int](($targetSize - $drawH) / 2)

    $destRect = New-Object System.Drawing.Rectangle($posX, $posY, $drawW, $drawH)
    $graphics.DrawImage($source, $destRect, 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel)

    $graphics.Dispose()
    $destImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
    Write-Host "Generated: $outputPath ($($targetSize)x$($targetSize))"
}

foreach ($d in $densities) {
    $dir = Join-Path $resPath $d.Name
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # ic_launcher.png (fit with subtle padding)
    $launcherPath = Join-Path $dir "ic_launcher.png"
    Draw-Fit-Image $srcImage $d.LauncherSize 0.04 $false $launcherPath

    # ic_launcher_round.png (circular clip with padding)
    $roundPath = Join-Path $dir "ic_launcher_round.png"
    Draw-Fit-Image $srcImage $d.LauncherSize 0.08 $true $roundPath

    # ic_launcher_foreground.png (for adaptive icons, safe zone is inner ~72dp of 108dp -> 0.18 padding)
    $foregroundPath = Join-Path $dir "ic_launcher_foreground.png"
    Draw-Fit-Image $srcImage $d.ForegroundSize 0.18 $false $foregroundPath
}

$srcImage.Dispose()
Write-Host "Icons updated with perfect aspect-ratio!"
