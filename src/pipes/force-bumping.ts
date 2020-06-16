import type { IAppCtx } from '../types/app-ctx'
import type { ILogger } from '../utils/logger'
import type { IRawCommit } from '../types/raw-commit'
import type { BumpKey, Conventions } from '../types/common-types'
import { Either } from '../utils/either'
import { tap } from '../utils/helpers'

const commitsOrNull = (convention: string[]) => (commits: IRawCommit[]) => {
	const thisType = commits.filter((commit) => convention.includes(commit.type))
	return thisType.length > 0
		? Either.right<IRawCommit[]>(thisType)
		: Either.left<null, IRawCommit[]>(null)
}

const logFoundCommits = (key: BumpKey, logger: ILogger) => (commits: IRawCommit[]) =>
	logger.info(`${key.replace('bump', '')} level changes: ${logger.green(String(commits.length))}`)

interface IForceBumpingDeps {
	key: BumpKey
	logger: ILogger
	conventions: Conventions
}

type ForceBumpingCtx = Pick<IAppCtx, 'commitList' | BumpKey>

export const forceBumping = ({ key, logger, conventions }: IForceBumpingDeps) => (
	ctx: ForceBumpingCtx,
) => ({
	[key]: Either.right(ctx.commitList)
		.chain(commitsOrNull(conventions[key]))
		.map(tap(logFoundCommits(key, logger)))
		.fold(
			() => ctx[key],
			() => true,
		),
})