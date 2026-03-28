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
  @{ role = 'user'; email = "rbac.user+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'RBAC User' },
  @{ role = 'moderator'; email = "rbac.moderator+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'RBAC Moderator' },
  @{ role = 'agency_admin'; email = "rbac.agency+$stamp@muraho.rw"; pass = 'RoleTest!234'; fullName = 'RBAC Agency Admin' }
)

$created = @{}
foreach ($r in $roles) {
  $create = Invoke-RestMethod -Uri "$base/users" -Method Post -Headers $adminHeaders -ContentType 'application/json' -Body (@{ email = $r.email; password = $r.pass; fullName = $r.fullName; role = $r.role } | ConvertTo-Json -Compress)
  $id = if ($create.doc) { $create.doc.id } else { $create.id }
  $created[$r.role] = @{ id = $id; email = $r.email; pass = $r.pass }
}

$agencyCreate = Invoke-RestMethod -Uri "$base/tour-agencies" -Method Post -Headers $adminHeaders -ContentType 'application/json' -Body (@{ name = "RBAC Agency $stamp"; slug = "rbac-agency-$stamp"; contactEmail = "rbac.agency.org+$stamp@muraho.rw"; adminUser = $created['agency_admin'].id; isActive = $true } | ConvertTo-Json -Compress)
$agencyId = if ($agencyCreate.doc) { $agencyCreate.doc.id } else { $agencyCreate.id }

$results = @()

foreach ($role in @('user', 'moderator', 'agency_admin')) {
  $u = $created[$role]
  $loginRes = Invoke-TestRequest -Method 'POST' -Url "$base/users/login" -Headers @{} -BodyObj @{ email = $u.email; password = $u.pass }

  if (-not $loginRes.ok) {
    $results += [pscustomobject]@{ role = $role; test = 'login'; status = $loginRes.status; ok = $false; note = 'login failed' }
    continue
  }

  $loginObj = $loginRes.body | ConvertFrom-Json
  $token = $loginObj.token
  $selfId = $loginObj.user.id
  $h = @{ Authorization = "JWT $token" }

  $tests = @(
    @{ name = 'me'; method = 'GET'; url = "$base/users/me"; body = $null },
    @{ name = 'stories_read'; method = 'GET'; url = "$base/stories?limit=3"; body = $null },
    @{ name = 'stories_create'; method = 'POST'; url = "$base/stories"; body = @{ title = "RBAC Story $stamp"; slug = "rbac-story-$role-$stamp"; summary = 'rbac'; status = 'published' } },
    @{ name = 'users_list'; method = 'GET'; url = "$base/users?limit=10"; body = $null },
    @{ name = 'update_self'; method = 'PATCH'; url = "$base/users/$selfId"; body = @{ fullName = "RBAC $role Updated" } },
    @{ name = 'update_other'; method = 'PATCH'; url = "$base/users/$($created['user'].id)"; body = @{ fullName = 'Should Fail' } },
    @{ name = 'analytics_read'; method = 'GET'; url = "$base/analytics-events?limit=3"; body = $null },
    @{ name = 'create_user_settings'; method = 'POST'; url = "$base/user-settings"; body = @{ user = $selfId; theme = 'light'; language = 'en' } },
    @{ name = 'read_user_settings_all'; method = 'GET'; url = "$base/user-settings?limit=10"; body = $null },
    @{ name = 'access_codes_create'; method = 'POST'; url = "$base/access-codes"; body = @{ agency = $agencyId; code = "RBAC-$role-$stamp"; maxUses = 5; usesCount = 0; validHours = 24; isActive = $true } },
    @{ name = 'access_codes_read'; method = 'GET'; url = "$base/access-codes?limit=10"; body = $null }
  )

  foreach ($t in $tests) {
    $res = Invoke-TestRequest -Method $t.method -Url $t.url -Headers $h -BodyObj $t.body
    $results += [pscustomobject]@{ role = $role; test = $t.name; status = $res.status; ok = $res.ok }
  }

  if ($role -eq 'agency_admin') {
    $resAgencyUpdate = Invoke-TestRequest -Method 'PATCH' -Url "$base/tour-agencies/$agencyId" -Headers $h -BodyObj @{ contactPhone = '+250700000000' }
    $results += [pscustomobject]@{ role = $role; test = 'agency_update_own'; status = $resAgencyUpdate.status; ok = $resAgencyUpdate.ok }
  }
}

$results | Sort-Object role, test | ForEach-Object {
  Write-Output "ROLE=$($_.role) TEST=$($_.test) STATUS=$($_.status) OK=$($_.ok)"
}
