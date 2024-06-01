import LoadComplete from '@/client/LoadComplete';

export default ({ children }: { children: React.ReactNode }) => {
	return <>
		<LoadComplete />
		{children}
	</>;
}
