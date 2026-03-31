$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000/api'

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
    return [pscustomobject]@{ ok = $false; status = $status; body = $_.ErrorDetails.Message }
  }
}

$adminLogin = Invoke-RestMethod -Uri "$base/users/login" -Method Post -ContentType 'application/json' -Body (@{ email = 'admin@muraho.rw'; password = 'MurahoAdmin2026!' } | ConvertTo-Json -Compress)
$adminHeaders = @{ Authorization = "JWT $($adminLogin.token)" }
$stamp = Get-Date -Format 'yyyyMMddHHmmss'

$roles = @(
  @{ role = 'user'; email = "local.user+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'Local User' },
  @{ role = 'moderator'; email = "local.mod+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'Local Moderator' },
  @{ role = 'agency_admin'; email = "local.agency+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'Local Agency Admin' }
)

$created = @{}
foreach ($r in $roles) {
  $create = Invoke-RestMethod -Uri "$base/users" -Method Post -Headers $adminHeaders -ContentType 'application/json' -Body (@{ email = $r.email; password = $r.pass; fullName = $r.fullName; role = $r.role } | ConvertTo-Json -Compress)
  $id = if ($create.doc) { $create.doc.id } else { $create.id }
  $created[$r.role] = @{ id = $id; email = $r.email; pass = $r.pass }
}

$agencyCreate = Invoke-RestMethod -Uri "$base/tour-agencies" -Method Post -Headers $adminHeaders -ContentType 'application/json' -Body (@{ name = "Local Agency $stamp"; slug = "local-agency-$stamp"; contactEmail = "local.agency.org+$stamp@muraho.rw"; adminUser = $created['agency_admin'].id; isActive = $true } | ConvertTo-Json -Compress)
$agencyId = if ($agencyCreate.doc) { $agencyCreate.doc.id } else { $agencyCreate.id }

$results = @()
foreach ($role in @('user', 'moderator', 'agency_admin')) {
  $u = $created[$role]
  $loginRes = Invoke-TestRequest -Method 'POST' -Url "$base/users/login" -Headers @{} -BodyObj @{ email = $u.email; password = $u.pass }
  if (-not $loginRes.ok) {
    $results += [pscustomobject]@{ role = $role; test = 'login'; status = $loginRes.status; ok = $false }
    continue
  }

  $loginObj = $loginRes.body | ConvertFrom-Json
  $h = @{ Authorization = "JWT $($loginObj.token)" }
  $selfId = $loginObj.user.id

  $storiesCreate = Invoke-TestRequest -Method 'POST' -Url "$base/stories" -Headers $h -BodyObj @{ title = "Local RBAC Story $stamp"; slug = "local-rbac-story-$role-$stamp"; summary = 'rbac local'; status = 'draft' }
  $accessCodeCreate = Invoke-TestRequest -Method 'POST' -Url "$base/access-codes" -Headers $h -BodyObj @{ agency = $agencyId; code = "LOCAL-$role-$stamp"; maxUses = 2; usesCount = 0; validHours = 24; isActive = $true }
  $updateOtherTarget = $created['user'].id
  if ($role -eq 'user') { $updateOtherTarget = $created['moderator'].id }
  if ($role -eq 'moderator') { $updateOtherTarget = $created['agency_admin'].id }
  $updateOther = Invoke-TestRequest -Method 'PATCH' -Url "$base/users/$updateOtherTarget" -Headers $h -BodyObj @{ fullName = 'Not Allowed' }
  $usersList = Invoke-TestRequest -Method 'GET' -Url "$base/users?limit=50" -Headers $h -BodyObj $null

  $usersCount = -1
  if ($usersList.ok) {
    $usersObj = $usersList.body | ConvertFrom-Json
    $usersCount = $usersObj.totalDocs
  }

  $results += [pscustomobject]@{ role = $role; test = 'stories_create'; status = $storiesCreate.status; ok = $storiesCreate.ok }
  $results += [pscustomobject]@{ role = $role; test = 'access_codes_create'; status = $accessCodeCreate.status; ok = $accessCodeCreate.ok }
  $results += [pscustomobject]@{ role = $role; test = 'update_other'; status = $updateOther.status; ok = $updateOther.ok }
  $results += [pscustomobject]@{ role = $role; test = 'users_list_totalDocs'; status = $usersList.status; ok = $usersList.ok; count = $usersCount }
}

$results | Sort-Object role, test | ForEach-Object {
  $countPart = ''
  if ($_.PSObject.Properties.Name -contains 'count') { $countPart = " COUNT=$($_.count)" }
  Write-Output "ROLE=$($_.role) TEST=$($_.test) STATUS=$($_.status) OK=$($_.ok)$countPart"
}
