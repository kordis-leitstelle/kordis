export interface Webcam {
	name: string;
	position: {
		lat: number;
		lon: number;
	};
	viewingDirection: string;
	videoSrcUri: string;
}
