# 새 컴퓨터에서 이 저장소를 바로 쓸 수 있게 준비하는 스크립트
#   사용법:  powershell -ExecutionPolicy Bypass -File .\setup.ps1
#   옵션:    -SkipInstall   (npm install / Python 가상환경 만들기 건너뛰기)
param([switch]$SkipInstall)

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
Write-Host '완료! README.md 의 "프로젝트별 실행 방법"을 보세요.' -ForegroundColor Green
