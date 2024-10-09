import { notFound, redirect } from 'next/navigation';

export async function GET(request: Request) {
	const url = new URL(request.url);
	const data = url.searchParams.get('tgWebAppStartParam');
	if (!data) {
		notFound();
	}
	redirect(atob(data));
}
