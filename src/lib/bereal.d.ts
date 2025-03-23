export interface Post {
	primary: Primary;
	secondary: Secondary;
	retakeCounter: number;
	visibility: string[];
	takenAt: string | Date;
	caption?: string;
	location?: Location;
	btsMedia?: BtsMedia;
}

export interface Primary {
	bucket: string;
	height: number;
	path: string;
	width: number;
	id?: string;
	ownerId?: string;
	url?: string;
	mediaType?: string;
	mimeType?: string;
}

export interface Secondary {
	bucket: string;
	height: number;
	path: string;
	width: number;
	id?: string;
	ownerId?: string;
	url?: string;
	mediaType?: string;
	mimeType?: string;
}

export interface Location {
	latitude: number;
	longitude: number;
}

export interface BtsMedia {
	bucket: string;
	height: number;
	mediaType: string;
	path: string;
	width: number;
}
