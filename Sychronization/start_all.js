const { spawn } = require('child_process');

const scripts = [
  'Sychronization/atlas_to_branches.js',
  'Sychronization/from_aws_to_atlas.js',
  'Sychronization/from_gcloud_to_atlas.js'
];

const children = [];

function runScript(script) {
  const child = spawn('node', [script], { stdio: 'inherit' });
  children.push(child);

  child.on('close', (code) => {
    console.log(`${script} exited with code ${code}`);
  });
}

// Catch SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Caught interrupt signal (Ctrl+C), killing child processes...');
  children.forEach(child => {
    child.kill('SIGINT');
  });
  process.exit(); // Finally exit this script
});

// Start all scripts
scripts.forEach(runScript);