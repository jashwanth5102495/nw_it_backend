Param(
  [string]$SeedPath = "c:\\Users\\jashw\\Desktop\\jasNav\\jas\\nw_it_backend\\data\\assignmentSeedData.json"
)

Write-Host "Patching correctAnswer for frontend-beginner-6 (JavaScript Part 1) in: $SeedPath"

if (!(Test-Path -Path $SeedPath)) {
  throw "Seed file not found at $SeedPath"
}

# Load JSON
$jsonText = Get-Content $SeedPath -Raw
$json = $jsonText | ConvertFrom-Json

# Find assignment
$target = $json | Where-Object { $_.assignmentId -eq 'frontend-beginner-6' }
if ($null -eq $target) { throw 'Assignment frontend-beginner-6 not found in seed data.' }

# Map of questionId -> correctAnswer index
$map = @{
  '1' = 0
  '2' = 1
  '3' = 2
  '4' = 2
  '5' = 1
  '6' = 3
  '7' = 1
  '8' = 1
  '9' = 2
  '10' = 2
}

# Apply mapping, adding property if missing
foreach ($q in $target.questions) {
  $id = [string]$q.questionId
  if ($map.ContainsKey($id)) {
    $prop = $q.PSObject.Properties['correctAnswer']
    if ($null -eq $prop) {
      Add-Member -InputObject $q -MemberType NoteProperty -Name 'correctAnswer' -Value $map[$id]
    } else {
      $q.correctAnswer = $map[$id]
    }
  }
}

# Save back
$json | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $SeedPath
Write-Host "Patched seed file successfully."