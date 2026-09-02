/**
 * Composition root for *this* repo.
 *
 * The only file in the repo that couples the CLI to `extensions/`. Everything
 * under `cli/src` works off the injected registry, which is what lets the same
 * code ship as @awell-health/extension-cli and be reused by any repo that holds
 * a single extension of its own.
 */
import { runCli } from './src'
import { extensions } from '../extensions'

runCli(extensions)
