import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['test'], {
  encoding: 'utf8',
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: process.platform === 'win32'
});
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
process.stdout.write(output);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const coverageRows = output.split(/\r?\n/)
  .filter(line => /^\s*[^|]+\|\s*\d/.test(line))
  .filter(line => line.split('|').slice(1, 5).some(value => Number.parseInt(value, 10) !== 100));
if (coverageRows.length) {
  console.error('Coverage gaps detected:');
  console.error(coverageRows.join('\n'));
  process.exit(1);
}
