$ErrorActionPreference = 'Stop'
$base = 'http://152.42.136.241:3000/api'

function Invoke-TestRequest {
  param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Headers,
    [object]$BodyObj
  )

  try {
    if ($null -ne $BodyObj) {
      $bodyJson = $BodyObj | ConvertTo-Json -Depth 12 -Compress
      $resp = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -ContentType 'application/json' -Body $bodyJson -UseBasicParsing
    } else {
      $resp = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -UseBasicParsing
    }

    return [pscustomobject]@{ ok = $true; status = [int]$resp.StatusCode; body = $resp.Content }
  } catch {
    $status = 0
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
    }
    $errBody = $_.ErrorDetails.Message
    return [pscustomobject]@{ ok = $false; status = $status; body = $errBody }
  }
}

$adminLogin = Invoke-RestMethod -Uri "$base/users/login" -Method Post -ContentType 'application/json' -Body (@{ email = 'admin@muraho.rw'; password = 'MurahoAdmin2026!' } | ConvertTo-Json -Compress)
$adminHeaders = @{ Authorization = "JWT $($adminLogin.token)" }
$stamp = Get-Date -Format 'yyyyMMddHHmmss'

$roles = @(
  @{ role = 'user'; email = "rbac2.user+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'RBAC2 User' },
  @{ role = 'moderator'; email = "rbac2.moderator+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'RBAC2 Moderator' },
  @{ role = 'agency_admin'; email = "rbac2.agency+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'RBAC2 Agency Admin' }
)

$created = @{}
foreach ($r in $roles) {
  $create = Invoke-RestMethod -Uri "$base/users" -Method Post -Headers $adminHeaders -ContentType 'application/json' -Body (@{ email = $r.email; password = $r.pass; fullName = $r.fullName; role = $r.role } | ConvertTo-Json -Compress)
  $id = if ($create.doc) { $create.doc.id } else { $create.id }
  $created[$r.role] = @{ id = $id; email = $r.email; pass = $r.pass }
}

$agencyCreate = Invoke-RestMethod -Uri "$base/tour-agencies" -Method Post -Headers $adminHeaders -ContentType 'application/json' -Body (@{ name = "RBAC2 Agency $stamp"; slug = "rbac2-agency-$stamp"; contactEmail = "rbac2.agency.org+$stamp@muraho.rw"; adminUser = $created['agency_admin'].id; isActive = $true } | ConvertTo-Json -Compress)
$agencyId = if ($agencyCreate.doc) { $agencyCreate.doc.id } else { $agencyCreate.id }

foreach ($role in @('user', 'moderator', 'agency_admin')) {
  $u = $created[$role]
  $loginRes = Invoke-TestRequest -Method 'POST' -Url "$base/users/login" -Headers @{} -BodyObj @{ email = $u.email; password = $u.pass }
  if (-not $loginRes.ok) {
    Write-Output "ROLE=$role TEST=login STATUS=$($loginRes.status) OK=False"
    continue
  }

  $loginObj = $loginRes.body | ConvertFrom-Json
  $token = $loginObj.token
  $selfId = $loginObj.user.id
  $h = @{ Authorization = "JWT $token" }

  $otherId = $created['moderator'].id
  if ($role -eq 'moderator') { $otherId = $created['agency_admin'].id }

  $updateOther = Invoke-TestRequest -Method 'PATCH' -Url "$base/users/$otherId" -Headers $h -BodyObj @{ fullName = "ILLEGAL-$role-$stamp" }
  Write-Output "ROLE=$role TEST=update_other_cross STATUS=$($updateOther.status) OK=$($updateOther.ok)"

  $usersList = Invoke-TestRequest -Method 'GET' -Url "$base/users?limit=50" -Headers $h -BodyObj $null
  if ($usersList.ok) {
    $usersJson = $usersList.body | ConvertFrom-Json
    $emails = @()
    if ($usersJson.docs) { $emails = $usersJson.docs | ForEach-Object { $_.email } }
    Write-Output "ROLE=$role TEST=users_list_docs STATUS=$($usersList.status) COUNT=$($usersJson.totalDocs) EMAILS=$($emails -join ',')"
  } else {
    Write-Output "ROLE=$role TEST=users_list_docs STATUS=$($usersList.status)"
  }

  $settingsList = Invoke-TestRequest -Method 'GET' -Url "$base/user-settings?limit=50" -Headers $h -BodyObj $null
  if ($settingsList.ok) {
    $settingsJson = $settingsList.body | ConvertFrom-Json
    $userIds = @()
    if ($settingsJson.docs) { $userIds = $settingsJson.docs | ForEach-Object { if ($_.user.id) { $_.user.id } else { $_.user } } }
    Write-Output "ROLE=$role TEST=user_settings_docs STATUS=$($settingsList.status) COUNT=$($settingsJson.totalDocs) USER_IDS=$($userIds -join ',')"
  } else {
    Write-Output "ROLE=$role TEST=user_settings_docs STATUS=$($settingsList.status)"
  }

  $accessRead = Invoke-TestRequest -Method 'GET' -Url "$base/access-codes?limit=50" -Headers $h -BodyObj $null
  if ($accessRead.ok) {
    $ac = $accessRead.body | ConvertFrom-Json
    Write-Output "ROLE=$role TEST=access_codes_read_count STATUS=$($accessRead.status) COUNT=$($ac.totalDocs)"
  } else {
    Write-Output "ROLE=$role TEST=access_codes_read_count STATUS=$($accessRead.status)"
  }

  $accessCreate = Invoke-TestRequest -Method 'POST' -Url "$base/access-codes" -Headers $h -BodyObj @{ agency = $agencyId; code = "RBAC2-$role-$stamp"; maxUses = 3; usesCount = 0; validHours = 24; isActive = $true }
  Write-Output "ROLE=$role TEST=access_codes_create STATUS=$($accessCreate.status) OK=$($accessCreate.ok)"
}
