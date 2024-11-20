import { RequestHandler } from '@builder.io/qwik-city';

export const onRequest: RequestHandler = (request) => {
	const url = new URL(request.url);
	const data = url.searchParams.get('tgWebAppStartParam');
	if (!data) {
		request.error(404, '>_<');
		return;
	}
	request.redirect(302, atob(data));
};
