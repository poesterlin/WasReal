import type { Post } from '$lib/bereal';
import { BlobReader, BlobWriter, ZipReader, ZipWriter } from '@zip.js/zip.js';
import { expose } from 'comlink';

let root: FileSystemDirectoryHandle;
let isInitialized = false;
let filesStored = 0;
let filesFused = 0;
let isProcessing = false;

async function init() {
	root = await navigator.storage.getDirectory();

	// pre-cache posts folder
	await getFolder('Photos/post/any.jpg');

	isInitialized = true;
}

export async function readZip(zipFile: File) {
	if (!isInitialized) {
		await init();
	}

	isProcessing = true;

	try {
		const reader = new BlobReader(zipFile);
		const zip = new ZipReader(reader);

		const files = await zip.getEntries();

		for (const entry of files) {
			if (!entry.getData) {
				continue;
			}

			const isPostJson = entry.filename === 'posts.json';
			const isPostImage = entry.filename.startsWith('Photos/post');
			const isBerealImage = entry.filename.includes('/bereal/');
			if (!isPostJson && !isPostImage && !isBerealImage) {
				continue;
			}

			const blob = await entry.getData(new BlobWriter());
			if (!blob || blob.size === 0) {
				continue;
			}

			if (isBerealImage) {
				const filename = entry.filename.split('/').at(-1)!;
				const { folder } = await getFolder('Photos/post/any.jpg');
				await storeEntry(blob, folder, filename);
				continue;
			}

			const { folder, filename } = await getFolder(entry.filename);
			await storeEntry(blob, folder, filename);
		}
	} catch (error) {
		console.error('Error reading zip:', error);
		throw error;
	} finally {
		isProcessing = false;
	}
}

async function getImages(post: Post) {
	return Promise.all([readImageAsUrl(post.secondary.path), readImageAsUrl(post.primary.path)]);
}

async function getImageFile(path: string) {
	if (!isInitialized) {
		await init();
	}

	const isBerealImage = path.includes('/bereal/');
	if (isBerealImage) {
		const filename = path.split('/').at(-1)!;
		path = 'Photos/post/' + filename;

		const { folder } = await getFolder(path);
		const fileHandle = await folder.getFileHandle(filename);
		return fileHandle.getFile();
	}

	try {
		// '/Photos/<id>/post/<filename>'
		// id needs to be removed
		const filename = path.split('/').at(-1)!;
		path = 'Photos/post/' + filename;

		const { folder } = await getFolder(path);
		const fileHandle = await folder.getFileHandle(filename);
		return fileHandle.getFile();
	} catch (error) {
		console.error('Error reading image:', error);
		throw error;
	}
}

async function readImageAsUrl(path: string) {
	if (!isInitialized) {
		await init();
	}
	const file = await getImageFile(path);
	const url = URL.createObjectURL(file);
	return url;
}

async function getPosts() {
	if (!isInitialized) {
		await init();
	}

	try {
		const postsHandle = await root.getFileHandle('posts.json');
		assert(postsHandle, 'Posts file not found');
		const posts: Post[] = await readAsJson(postsHandle);
		return posts;
	} catch (error) {
		console.error('Error reading posts:', error);
		throw error;
	}
}

async function getProgress() {
	return { filesStored, isProcessing, filesFused, averageTime };
}

async function storeEntry(entry: Blob, folder: FileSystemDirectoryHandle, path: string = '') {
	assert(!path.includes('/'), 'Path must not include a /');
	const fileHandle = await folder.getFileHandle(path, { create: true });

	if ('createWritable' in fileHandle) {
		const writable = await fileHandle.createWritable();
		writable.write(entry);
		writable.close();
	} else {
		// @ts-expect-error - createSyncAccessHandle is not in the types yet
		const writable = await fileHandle.createSyncAccessHandle();
		const arrayBuffer = await entry.arrayBuffer();
		writable.truncate(0);
		writable.write(arrayBuffer);
		writable.close();
	}

	filesStored++;
}

async function readAsJson(file: FileSystemFileHandle) {
	try {
		const fileContents = await file.getFile();
		const content = await fileContents.text();
		return JSON.parse(content);
	} catch (e) {
		console.error(e);
		throw e;
	}
}

const folderCache = new Map<string, FileSystemDirectoryHandle>();

async function getFolder(path: string) {
	const parts = path.split('/').filter(Boolean);
	let currentFolder = root;

	// the last part is the file name, so we don't need to create a folder for it
	const filename = parts.pop();
	assert(filename, 'Filename not found');

	const folderPath = parts.join('/');

	// check if folder is already cached
	const cachedFolder = folderCache.get(folderPath);
	if (cachedFolder) {
		return { folder: cachedFolder, filename };
	}

	console.log('Creating folder:', folderPath);

	for (const part of parts) {
		currentFolder = await currentFolder.getDirectoryHandle(part, { create: true });
	}

	// cache the folder
	folderCache.set(folderPath, currentFolder);

	return { folder: currentFolder, filename };
}

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
async function fuseImages(primary: string, secondary: string, options: { asBlob?: boolean } = {}) {
	const { asBlob = false } = options;

	const primaryImage = await urlToBitmap(primary);
	const secondaryImage = await urlToBitmap(secondary);

	const width = Math.max(primaryImage.width, secondaryImage.width);
	const height = Math.max(primaryImage.height, secondaryImage.height);

	if (!ctx) {
		canvas = new OffscreenCanvas(width, height);
		ctx = canvas.getContext('2d')!;
		assert(ctx, 'Canvas context not found');
	}

	// Draw primary image
	ctx.drawImage(primaryImage, 0, 0, width, height);

	// Calculate secondary image dimensions
	const secondaryWidth = width / 3.8;
	const aspectRatio = secondaryImage.width / secondaryImage.height;
	const secondaryHeight = secondaryWidth / aspectRatio;

	// Add border effect
	const borderWidth = 1;
	ctx.strokeStyle = 'white';
	ctx.lineWidth = borderWidth;

	// Add shadow effect
	ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
	ctx.shadowBlur = 4;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 2;

	// Position secondary image (equivalent to top-3 left-3)
	const x = 16;
	const y = 16;
	const borderRadius = 24; // Adjust this value to control roundness

	// Create clipping path for rounded corners
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(x + borderRadius, y);
	ctx.lineTo(x + secondaryWidth - borderRadius, y);
	ctx.quadraticCurveTo(x + secondaryWidth, y, x + secondaryWidth, y + borderRadius);
	ctx.lineTo(x + secondaryWidth, y + secondaryHeight - borderRadius);
	ctx.quadraticCurveTo(
		x + secondaryWidth,
		y + secondaryHeight,
		x + secondaryWidth - borderRadius,
		y + secondaryHeight
	);
	ctx.lineTo(x + borderRadius, y + secondaryHeight);
	ctx.quadraticCurveTo(x, y + secondaryHeight, x, y + secondaryHeight - borderRadius);
	ctx.lineTo(x, y + borderRadius);
	ctx.quadraticCurveTo(x, y, x + borderRadius, y);
	ctx.closePath();

	// Add shadow effect
	ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
	ctx.shadowBlur = 4;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 2;

	// Clip and draw secondary image
	ctx.clip();
	ctx.drawImage(secondaryImage, x, y, secondaryWidth, secondaryHeight);

	// Draw border
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.stroke();

	// Reset context
	ctx.restore();

	filesFused++;

	const blob = await canvas.convertToBlob({ quality: 0.95, type: 'image/jpeg' });
	if (asBlob) {
		return blob;
	}

	const url = URL.createObjectURL(blob);
	return url;
}

async function urlToBitmap(url: string) {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		return createImageBitmap(blob);
	} catch (e) {
		console.error(e);
		throw e;
	}
}

let averageTime = 0;

/**
 * uses filesFused as a counter to calculate the average time
 * @param duration
 */
function addToAverage(duration: number) {
	averageTime = (averageTime * filesFused + duration) / (filesFused + 1);
}

async function processAllPosts() {
	const posts = await getPosts();
	const zip = new ZipWriter(new BlobWriter('application/zip'), { bufferedWrite: true });
	for (const post of posts) {
		try {
			const [primary, secondary] = await getImages(post);
			const start = performance.now();
			const blob = (await fuseImages(primary, secondary, { asBlob: true })) as Blob;
			const end = performance.now();
			const duration = end - start;
			addToAverage(duration);
			const filename = post.primary.path.split('/').at(-1)! + '.jpg';

			const path = `fused/${filename}`;
			await zip.add(path, new BlobReader(blob));
		} catch (e) {
			console.error(e);
		}
	}

	const zipBlob = await zip.close();
	const url = URL.createObjectURL(zipBlob);
	return url;
}

function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

type PromiseMethod = (...args: never) => Promise<unknown> | AsyncGenerator<unknown>;

const methods = {
	init,
	getProgress,
	readZip,
	getPosts,
	getImages,
	fuseImages,
	processAllPosts
} satisfies Record<string, PromiseMethod>;

export type ProcessWorker = typeof methods;

expose(methods);
