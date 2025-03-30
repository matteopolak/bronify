export function formatSeconds(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function randomElement<T>(array: T[]): T {
	if (array.length === 0) {
		throw new Error('Array is empty');
	}

	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}
