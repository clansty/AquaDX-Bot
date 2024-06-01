'use client';

export default ({
	error,
	reset
}: {
	error: Error & { digest?: string }
	reset: () => void
}) => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<h1>Something went wrong!</h1>
			<h2 style={{margin: '.3em 0'}}>{error.name}</h2>
			<p style={{margin: '.3em 0'}}>{error.message}</p>
			<button
				style={{margin: '.3em 0'}}
				onClick={
					// Attempt to recover by trying to re-render the segment
					() => reset()
				}
			>
				Try again
			</button>
		</div>
	);
}
