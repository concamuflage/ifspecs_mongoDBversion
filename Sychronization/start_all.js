
const { spawn } = require('child_process');

// Define the scripts to run
const scripts = [
  'Sychronization/atlas_to_branches.js',
  'Sychronization/from_aws_to_atlas.js',
  'Sychronization/from_gcloud_to_atlas.js'
];

// Function to run a script
function runScript(script) {
  const process = spawn('node', [script], { stdio: 'inherit' });

  process.on('close', (code) => {
    console.log(`${script} exited with code ${code}`);
  });
}

// Start all scripts
scripts.forEach(runScript);