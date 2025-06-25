import { spawn } from 'child_process';

const args = process.argv.slice(2);
const backendIPArg = args.find(arg => arg.startsWith('--bip='));

if (backendIPArg) {
    const ip = backendIPArg.split('=')[1];
    process.env.VITE_BACKEND_IP = ip;
    console.log(`Usando bip: ${ip}:8000`);
} else {
    console.log('Usando localhost:8000');
}

const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
});

child.on('error', (error) => {
    console.error('Error :(', error);
    process.exit(1);
});

child.on('exit', (code) => {
    process.exit(code);
});
