const { spawn } = require('child_process');

export const executeCommand = async (command: string, args: string[]) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let output = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}; 