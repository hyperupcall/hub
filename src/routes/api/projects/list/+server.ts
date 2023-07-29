import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { json } from '@sveltejs/kit'
import { glob } from 'glob'

type HubJson = {
	repositoryRoot: string
	repositoryDirectories: {
		dir: string
		tags: string[]
	}[]
}

/** @type {import('./$types').RequestHandler} */
export async function POST() {
	// TODO
	let hubFile
	if (path.basename(process.cwd()) === 'build') {
		hubFile = '../hub.json'
	} else {
		hubFile = './hub.json'
	}

	const hubJson: HubJson = JSON.parse(await fs.readFile(hubFile, 'utf-8'))

	const allMatches: {
		dir: string
		name: string
		tags: string[]
		isGitDir: boolean
	}[] = []

	for (const dir of hubJson.repositoryDirectories) {
		const matches = await glob(hubJson.repositoryRoot + dir.dir)
		for (const match of matches) {
			const hasGitDir = await fs
				.stat(path.join(match, '.git'))
				.then(() => true)
				.catch(() => false)

			allMatches.push({
				dir: match,
				name: path.basename(match),
				tags: dir.tags,
				isGitDir: hasGitDir,
			})
		}
	}

	return json({ matches: allMatches })
}
