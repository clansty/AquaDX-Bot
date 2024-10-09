import fs from 'node:fs';

if (fs.existsSync('.next/standalone'))
	fs.rmSync('.next/standalone', { recursive: true, force: true });
