import { Env } from '../../worker-configuration';
import Elysia from 'elysia';

export default function createRouter(env: Env) {
	const app = new Elysia({ aot: false });

	return app;
}
