import fs from 'node:fs';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * /download/windows 로 윈도우 설치 파일(release/*Setup*.exe)을 내려준다.
 * 설치 파일은 dist(앱 번들)에 넣지 않고 웹 서버에서만 제공한다.
 */
function windowsInstallerDownload(): Plugin {
  const findInstaller = () => {
    const dir = path.resolve(process.cwd(), 'release');
    if (!fs.existsSync(dir)) return null;
    const files = fs
      .readdirSync(dir)
      .filter((f) => /setup.*\.exe$/i.test(f))
      .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    return files[0] ? path.join(dir, files[0].f) : null;
  };

  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url?.split('?')[0] !== '/download/windows') return next();
    const file = findInstaller();
    if (!file) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('설치 파일이 아직 없어요. 프로젝트 폴더에서 npm run dist:win 으로 만들어 주세요.');
      return;
    }
    const size = fs.statSync(file).size;
    res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
    res.setHeader('Content-Length', String(size));
    res.setHeader('Content-Disposition', `attachment; filename="QuestScheduler-Setup.exe"; filename*=UTF-8''${encodeURIComponent(path.basename(file))}`);
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  };

  return {
    name: 'windows-installer-download',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), windowsInstallerDownload()],
  server: { port: 5173, strictPort: true },
  test: { environment: 'node' },
} as never);
