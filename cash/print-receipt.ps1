param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    [string]$PrinterName = ""
)

try {
    Add-Type -AssemblyName System.Drawing

    if (-not (Test-Path $FilePath)) {
        Write-Error "File not found: $FilePath"
        exit 1
    }

    $rawContent = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)

    $isJson = $false
    $order = $null
    if ($FilePath -match '\.json$' -or $rawContent.TrimStart().StartsWith('{')) {
        try {
            $order = $rawContent | ConvertFrom-Json
            if ($order.items) {
                $isJson = $true
            }
        } catch {
            $isJson = $false
        }
    }

    $doc = New-Object System.Drawing.Printing.PrintDocument
    if ($PrinterName) {
        $doc.PrinterSettings.PrinterName = $PrinterName
    }

    # Automatically select 80mm roll paper if available
    foreach ($ps in $doc.PrinterSettings.PaperSizes) {
        if ($ps.PaperName -match '80') {
            $doc.DefaultPageSettings.PaperSize = $ps
            break
        }
    }

    # Set zero margins for thermal receipt roll
    $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0, 0, 0, 0)

    # Printable width in 1/100 inch: 284 units (72 mm).
    $W = 284
    $pad = 4
    $printW = $W - ($pad * 2)

    # Fonts
    $fntTitle   = [System.Drawing.Font]::new("Arial",    [single]14.0, [System.Drawing.FontStyle]::Bold)
    $fntSub     = [System.Drawing.Font]::new("Arial",    [single]8.5,  [System.Drawing.FontStyle]::Regular)
    $fntArTitle = [System.Drawing.Font]::new("Tahoma",   [single]12.0, [System.Drawing.FontStyle]::Bold)
    $fntBold    = [System.Drawing.Font]::new("Arial",    [single]9.5,  [System.Drawing.FontStyle]::Bold)
    $fntRegular = [System.Drawing.Font]::new("Arial",    [single]9.0,  [System.Drawing.FontStyle]::Regular)
    $fntArItem  = [System.Drawing.Font]::new("Tahoma",   [single]8.5,  [System.Drawing.FontStyle]::Regular)
    $fntBigTot  = [System.Drawing.Font]::new("Arial",    [single]12.5, [System.Drawing.FontStyle]::Bold)

    $brush = [System.Drawing.Brushes]::Black
    $penSolid = [System.Drawing.Pen]::new([System.Drawing.Color]::Black, [single]1.5)
    $penDashed = [System.Drawing.Pen]::new([System.Drawing.Color]::Black, [single]1.0)
    $penDashed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

    # Formats
    $sfCenter = New-Object System.Drawing.StringFormat
    $sfCenter.Alignment     = [System.Drawing.StringAlignment]::Center
    $sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Near

    $sfRight = New-Object System.Drawing.StringFormat
    $sfRight.Alignment     = [System.Drawing.StringAlignment]::Far
    $sfRight.LineAlignment = [System.Drawing.StringAlignment]::Near

    $sfLeft = New-Object System.Drawing.StringFormat
    $sfLeft.Alignment     = [System.Drawing.StringAlignment]::Near
    $sfLeft.LineAlignment = [System.Drawing.StringAlignment]::Near

    $doc.add_PrintPage({
        param($sender, $ev)
        $g = $ev.Graphics
        $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

        if ($isJson) {
            $y = [single]8

            # 1. Header
            $rectCenter = [System.Drawing.RectangleF]::new($pad, $y, $printW, [single]24)
            $g.DrawString("AL PANINO", $fntTitle, $brush, $rectCenter, $sfCenter)
            $y += 22

            $rectCenter.Y = $y
            $g.DrawString("سناك البانينو", $fntArTitle, $brush, $rectCenter, $sfCenter)
            $y += 20

            $rectCenter.Y = $y
            $g.DrawString("Ghazieh Main St, South Lebanon", $fntSub, $brush, $rectCenter, $sfCenter)
            $y += 14

            $rectCenter.Y = $y
            $g.DrawString("Tel: +961 71 254 251 / 70 646 225", $fntSub, $brush, $rectCenter, $sfCenter)
            $y += 18

            # Solid divider
            $g.DrawLine($penSolid, [single]$pad, $y, [single]($pad + $printW), $y)
            $y += 6

            # 2. Ticket & Type Box
            $g.DrawString("Ticket #: AP-$($order.orderNumber)", $fntBold, $brush, [single]$pad, $y)
            $rectRight = [System.Drawing.RectangleF]::new($pad, $y, $printW, [single]16)
            $typeStr = if ($order.orderType) { $order.orderType.ToUpper() } else { "TAKEAWAY" }
            $g.DrawString("Type: $typeStr", $fntBold, $brush, $rectRight, $sfRight)
            $y += 16

            $dateVal = if ($order.timestamp) {
                try { [DateTime]::Parse($order.timestamp).ToLocalTime().ToString('g') } catch { [DateTime]::Now.ToString('g') }
            } else {
                [DateTime]::Now.ToString('g')
            }
            $g.DrawString("Date: $dateVal", $fntSub, $brush, [single]$pad, $y)
            $y += 15

            if ($order.customerNote) {
                $g.DrawString("Note: $($order.customerNote)", $fntSub, $brush, [single]$pad, $y)
                $y += 15
            }

            # Dashed divider
            $g.DrawLine($penDashed, [single]$pad, $y, [single]($pad + $printW), $y)
            $y += 6

            # 3. Table Column Headers
            $g.DrawString("QTY", $fntBold, $brush, [single]$pad, $y)
            $g.DrawString("ITEM", $fntBold, $brush, [single]($pad + 28), $y)
            $rectRight.Y = $y
            $g.DrawString("TOTAL", $fntBold, $brush, $rectRight, $sfRight)
            $y += 16

            $g.DrawLine($penDashed, [single]$pad, $y, [single]($pad + $printW), $y)
            $y += 6

            # 4. Items List
            foreach ($it in $order.items) {
                $g.DrawString("$($it.quantity)x", $fntBold, $brush, [single]$pad, $y)
                
                $nameRect = [System.Drawing.RectangleF]::new([single]($pad + 28), $y, [single]165, [single]16)
                $g.DrawString($it.name, $fntBold, $brush, $nameRect, $sfLeft)
                
                $lineTot = if ($it.lineTotal) { [double]$it.lineTotal } else { [double]($it.price * $it.quantity) }
                $totStr = "{0:N0} L.L." -f $lineTot
                $rectRight.Y = $y
                $g.DrawString($totStr, $fntBold, $brush, $rectRight, $sfRight)
                $y += 16
                
                if ($it.nameAr) {
                    $arRect = [System.Drawing.RectangleF]::new([single]($pad + 28), $y, [single]230, [single]14)
                    $g.DrawString($it.nameAr, $fntArItem, $brush, $arRect, $sfLeft)
                    $y += 16
                }
                if ($it.note) {
                    $noteRect = [System.Drawing.RectangleF]::new([single]($pad + 28), $y, [single]230, [single]14)
                    $g.DrawString("** $($it.note)", $fntSub, $brush, $noteRect, $sfLeft)
                    $y += 14
                }
            }

            # Divider before Totals
            $g.DrawLine($penDashed, [single]$pad, $y, [single]($pad + $printW), $y)
            $y += 7

            # 5. Grand Totals
            $g.DrawString("TOTAL DUE:", $fntBigTot, $brush, [single]$pad, $y)
            $dueStr = "{0:N0} L.L." -f [double]$order.total
            $rectRight.Y = $y
            $g.DrawString($dueStr, $fntBigTot, $brush, $rectRight, $sfRight)
            $y += 20

            $g.DrawString("USD Equiv:", $fntBold, $brush, [single]$pad, $y)
            $rectRight.Y = $y
            $g.DrawString("`$$($order.totalUsd)", $fntBold, $brush, $rectRight, $sfRight)
            $y += 16

            $g.DrawLine($penDashed, [single]$pad, $y, [single]($pad + $printW), $y)
            $y += 6

            # 6. Payment & Cash Details
            $g.DrawString("Payment Method:", $fntSub, $brush, [single]$pad, $y)
            $rectRight.Y = $y
            $g.DrawString("CASH ONLY", $fntBold, $brush, $rectRight, $sfRight)
            $y += 15

            if ($order.tendered) {
                $tendUsdPart = if ($order.tenderedUsd) { " (`$$($order.tenderedUsd))" } else { "" }
                $tendStr = ("{0:N0} L.L." -f [double]$order.tendered) + $tendUsdPart
                $g.DrawString("Cash Received:", $fntSub, $brush, [single]$pad, $y)
                $rectRight.Y = $y
                $g.DrawString($tendStr, $fntRegular, $brush, $rectRight, $sfRight)
                $y += 15
            }

            if ($order.change -ne $null) {
                $chgUsdPart = if ($order.changeUsd) { " (`$$($order.changeUsd))" } else { "" }
                $chgStr = ("{0:N0} L.L." -f [double]$order.change) + $chgUsdPart
                $g.DrawString("Change Given:", $fntBold, $brush, [single]$pad, $y)
                $rectRight.Y = $y
                $g.DrawString($chgStr, $fntBold, $brush, $rectRight, $sfRight)
                $y += 18
            }

            # 7. Footer
            $g.DrawLine($penSolid, [single]$pad, $y, [single]($pad + $printW), $y)
            $y += 8

            $rectCenter.Y = $y
            $g.DrawString("Thank you for choosing Al Panino!", $fntBold, $brush, $rectCenter, $sfCenter)
            $y += 16

            $rectCenter.Y = $y
            $g.DrawString("صحتين وهنا • أهلاً وسهلاً بكم", $fntArTitle, $brush, $rectCenter, $sfCenter)
            $y += 45  # Feed space before cutter

        } else {
            # Plain text fallback (for shift report or legacy text receipts)
            $lines = $rawContent -split "`r?`n"
            $fntMono = [System.Drawing.Font]::new("Consolas", [single]9.0, [System.Drawing.FontStyle]::Bold)
            $y = [single]8
            foreach ($l in $lines) {
                if ([string]::IsNullOrWhiteSpace($l)) { $y += 10; continue }
                if ($l -match '^={3,}|^-{3,}') {
                    $g.DrawLine($penSolid, [single]$pad, $y + 6, [single]($pad + $printW), $y + 6)
                    $y += 14
                    continue
                }
                $g.DrawString($l, $fntMono, $brush, [single]$pad, $y)
                $y += 14
            }
            $fntMono.Dispose()
        }

        $ev.HasMorePages = $false
    })

    $doc.Print()
    Write-Host "Dispatched to 80mm printer successfully"
} catch {
    Write-Warning "Print error: $_"
}
