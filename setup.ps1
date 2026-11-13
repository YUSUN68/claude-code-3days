# 새 컴퓨터에서 이 저장소를 바로 쓸 수 있게 준비하는 스크립트
#   사용법:  powershell -ExecutionPolicy Bypass -File .\setup.ps1
#   옵션:    -SkipInstall   (npm install / Python 가상환경 / 전역 스킬 설치 건너뛰기)
#            -SkipSkills    (전역 스킬 설치만 건너뛰기)
param([switch]$SkipInstall, [switch]$SkipSkills)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$projects = Join-Path $root 'projects'

function Get-ClaudeProjectKey([string]$path) {
    # Claude Code는 프로젝트 폴더 경로의 영문자·숫자가 아닌 글자를 모두 '-'로 바꿔 기억 폴더 이름으로 씁니다.
    return ($path -replace '[^A-Za-z0-9]', '-')
}

Write-Host ''
Write-Host '== 1) Claude 기억(memory) 복원' -ForegroundColor Cyan
$memRoot = Join-Path $root 'claude\memory'
foreach ($dir in Get-ChildItem $memRoot -Directory) {
    $projPath = Join-Path $projects $dir.Name
    if (-not (Test-Path $projPath)) { continue }
    $key = Get-ClaudeProjectKey (Resolve-Path $projPath).Path
    $dest = Join-Path $env:USERPROFILE ".claude\projects\$key\memory"
    New-Item -ItemType Directory -Force $dest | Out-Null
    Copy-Item (Join-Path $dir.FullName '*') $dest -Force
    Write-Host "  $($dir.Name) -> $dest"
}

Write-Host ''
Write-Host '== 2) 환경 파일(.env.local) 만들기' -ForegroundColor Cyan
$envPairs = @(
    @{ dir = 'goguma';    from = '.env.example' },
    @{ dir = 'scheduler'; from = '.env.example' },
    @{ dir = 'shopping';  from = '.env.local.example' }
)
foreach ($p in $envPairs) {
    $d = Join-Path $projects $p.dir
    $src = Join-Path $d $p.from
    $dst = Join-Path $d '.env.local'
    if (Test-Path $dst) { Write-Host "  $($p.dir): .env.local 이미 있음 (그대로 둠)"; continue }
    Copy-Item $src $dst
    Write-Host "  $($p.dir): $($p.from) -> .env.local"
}
Write-Host '  ※ shopping 의 SUPABASE_SERVICE_ROLE_KEY 는 비어 있어요. Supabase 대시보드 > Project Settings > API Keys 의 secret 키를 직접 넣어야 결제완료 처리가 돼요.' -ForegroundColor Yellow

if ($SkipInstall) { Write-Host ''; Write-Host '설치 단계는 건너뜀 (-SkipInstall).'; exit 0 }

Write-Host ''
Write-Host '== 3) Node.js 프로젝트 패키지 설치 (npm install)' -ForegroundColor Cyan
if (Get-Command npm -ErrorAction SilentlyContinue) {
    foreach ($name in 'goguma', 'shopping', 'scheduler') {
        Write-Host "  -> $name"
        Push-Location (Join-Path $projects $name)
        try { npm install --no-fund --no-audit } finally { Pop-Location }
    }
} else {
    Write-Host '  npm 이 없어요. Node.js LTS 를 먼저 설치하세요:  winget install OpenJS.NodeJS.LTS' -ForegroundColor Yellow
}

Write-Host ''
Write-Host '== 4) 업무자동화 실습 폴더 Python 가상환경' -ForegroundColor Cyan
$py = Get-Command python -ErrorAction SilentlyContinue
$mc = Join-Path $projects 'multicampus-2026-09-practice'
if ($py -and $py.Source -notlike '*WindowsApps*') {
    Push-Location $mc
    try {
        if (-not (Test-Path '.venv')) { python -m venv .venv }
        & '.venv\Scripts\python.exe' -m pip install -q -r requirements.txt
        Write-Host '  .venv 준비 완료'
    } finally { Pop-Location }
} else {
    Write-Host '  Python 이 없어요. 필요하면:  winget install Python.Python.3.13' -ForegroundColor Yellow
}

Write-Host ''
Write-Host '== 5) 전역 스킬 설치 (eli5, humanize-korean, kakao-windows)' -ForegroundColor Cyan
# 다른 사람이 만든 공개 저장소(MIT)라 코드를 이 저장소에 복사하지 않고, 처음 설치 때 검토한 커밋 그대로 받아 설치합니다.
$skillsHome = Join-Path $env:USERPROFILE '.claude\skills'
$skillRepos = @(
    @{ name = 'eli5';                 url = 'https://github.com/dreambigou/eli5.git';                 commit = 'a766623b062331fdde53467001379b4ddf3acc2f'; check = 'eli5' },
    @{ name = 'im-not-ai';            url = 'https://github.com/epoko77-ai/im-not-ai.git';            commit = 'b37e0206d31fffd9149bf57168d4d62eb2086bee'; check = 'humanize-korean' },
    @{ name = 'kakao-windows-reader'; url = 'https://github.com/DAYBYDAI/kakao-windows-reader.git'; commit = '91f56498f8e04c1a8f3a23f3f17e679ba6643c2e'; check = 'kakao-windows' }
)
if ($SkipSkills) {
    Write-Host '  건너뜀 (-SkipSkills)'
} elseif (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host '  git 이 없어서 건너뜀. 설치:  winget install Git.Git' -ForegroundColor Yellow
} else {
    New-Item -ItemType Directory -Force $skillsHome | Out-Null
    $work = Join-Path $env:TEMP 'cc3d-skills'
    New-Item -ItemType Directory -Force $work | Out-Null
    foreach ($r in $skillRepos) {
        if (Test-Path (Join-Path $skillsHome $r.check)) { Write-Host "  $($r.name): 이미 설치됨 (그대로 둠)"; continue }
        try {
            $src = Join-Path $work $r.name
            if (-not (Test-Path $src)) { git clone -q $r.url $src; if ($LASTEXITCODE -ne 0) { throw 'git clone 실패' } }
            git -C $src -c advice.detachedHead=false checkout -q $r.commit; if ($LASTEXITCODE -ne 0) { throw 'checkout 실패' }
            switch ($r.name) {
                'eli5' {
                    Copy-Item (Join-Path $src 'skills\eli5') (Join-Path $skillsHome 'eli5') -Recurse
                }
                'im-not-ai' {
                    $bash = Join-Path $env:ProgramFiles 'Git\bin\bash.exe'
                    if (-not (Test-Path $bash)) { throw 'Git Bash(bash.exe)를 찾지 못함' }
                    Push-Location $src
                    try { $env:CLAUDE_HOME = (Join-Path $env:USERPROFILE '.claude').Replace('\', '/'); & $bash ./install.sh --claude-only --copy; if ($LASTEXITCODE -ne 0) { throw 'install.sh 실패' } } finally { Pop-Location }
                }
                'kakao-windows-reader' {
                    & (Join-Path $src 'install-skill.ps1')
                }
            }
            Write-Host "  $($r.name): 설치 완료" -ForegroundColor Green
        } catch {
            Write-Host "  $($r.name): 설치 실패 - $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Write-Host '  ※ 스킬은 새로 연 Claude Code 세션부터 적용돼요. 카카오톡 리더는 처음 쓸 때 "/kakao-windows 첫 설정을 해 줘"로 설정해요.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host '완료! README.md 의 "프로젝트별 실행 방법"을 보세요.' -ForegroundColor Green
