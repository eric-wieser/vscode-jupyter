import { inject, injectable } from 'inversify';
import * as os from 'os';
import { Uri } from 'vscode';
import { IFileSystem } from '../common/platform/types.node';
import { IConfigurationService } from '../common/types';
import { ExportToPythonPlainBase } from './exportToPythonPlain';

// Handles exporting a NotebookDocument to python
@injectable()
export class ExportToPythonPlain extends ExportToPythonPlainBase {
    public constructor(
        @inject(IFileSystem) private readonly fs: IFileSystem,
        @inject(IConfigurationService) configuration: IConfigurationService
    ) {
        super(configuration);
    }

    override async writeFile(target: Uri, contents: string): Promise<void> {
        await this.fs.writeFile(target, contents);
    }

    override getEOL(): string {
        return os.EOL;
    }
}
