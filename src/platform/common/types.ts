// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';

import { Socket } from 'net';
import { Request as RequestResult } from 'request';
import { ConfigurationTarget, Disposable, Event, Extension, ExtensionContext, OutputChannel, Uri } from 'vscode';
import { IExtensionSingleActivationService } from '../activation/types';
import { BannerType } from '../datascience/dataScienceSurveyBanner';
import { LogLevel } from '../logging/levels';
import { PythonEnvironment } from '../pythonEnvironments/info';
import { CommandsWithoutArgs } from './application/commands';
import { Experiments } from './experiments/groups';
export const IsCodeSpace = Symbol('IsCodeSpace');
export const IsDevMode = Symbol('IsDevMode');
export const IsPreRelease = Symbol('IsPreRelease');
export const IOutputChannel = Symbol('IOutputChannel');
export interface IOutputChannel extends OutputChannel {}
export const IsWindows = Symbol('IS_WINDOWS');
export const IDisposableRegistry = Symbol('IDisposableRegistry');
export type IDisposableRegistry = Disposable[];
export const IMemento = Symbol('IGlobalMemento');
export const GLOBAL_MEMENTO = Symbol('IGlobalMemento');
export const WORKSPACE_MEMENTO = Symbol('IWorkspaceMemento');

export type Resource = Uri | undefined;
export interface IPersistentState<T> {
    readonly value: T;
    updateValue(value: T): Promise<void>;
}

export type ReadWrite<T> = {
    -readonly [P in keyof T]: T[P];
};

export const IPersistentStateFactory = Symbol('IPersistentStateFactory');

export interface IPersistentStateFactory {
    createGlobalPersistentState<T>(key: string, defaultValue?: T, expiryDurationMs?: number): IPersistentState<T>;
    createWorkspacePersistentState<T>(key: string, defaultValue?: T, expiryDurationMs?: number): IPersistentState<T>;
}

// eslint-disable-next-line
// TODO: Drop IPathUtils in favor of IFileSystemPathUtils.
// See https://github.com/microsoft/vscode-python/issues/8542.
export const IPathUtils = Symbol('IPathUtils');
export interface IPathUtils {
    readonly delimiter: string;
    readonly home: string;
    /**
     * The platform-specific file separator. '\\' or '/'.
     * @type {string}
     * @memberof IPathUtils
     */
    readonly separator: string;
    basename(pathValue: string, ext?: string): string;
    getDisplayName(pathValue: string, cwd?: string): string;
}

export const IRandom = Symbol('IRandom');
export interface IRandom {
    getRandomInt(min?: number, max?: number): number;
}

export interface IJupyterSettings {
    readonly experiments: IExperiments;
    readonly logging: ILoggingSettings;
    readonly allowUnauthorizedRemoteConnection: boolean;
    readonly allowImportFromNotebook: boolean;
    readonly jupyterInterruptTimeout: number;
    readonly jupyterLaunchTimeout: number;
    readonly jupyterLaunchRetries: number;
    readonly jupyterServerType: string;
    readonly notebookFileRoot: string;
    readonly changeDirOnImportExport: boolean;
    readonly useDefaultConfigForJupyter: boolean;
    readonly searchForJupyter: boolean;
    readonly allowInput: boolean;
    readonly showCellInputCode: boolean;
    readonly maxOutputSize: number;
    readonly enableScrollingForCellOutputs: boolean;
    readonly enablePythonKernelLogging: boolean;
    readonly sendSelectionToInteractiveWindow: boolean;
    readonly markdownRegularExpression: string;
    readonly codeRegularExpression: string;
    readonly allowLiveShare: boolean;
    readonly errorBackgroundColor: string;
    readonly ignoreVscodeTheme: boolean;
    readonly variableExplorerExclude: string;
    readonly liveShareConnectionTimeout: number;
    readonly decorateCells: boolean;
    readonly enableCellCodeLens: boolean;
    askForLargeDataFrames: boolean;
    readonly enableAutoMoveToNextCell: boolean;
    readonly askForKernelRestart: boolean;
    readonly generateSVGPlots: boolean;
    readonly codeLenses: string;
    readonly debugCodeLenses: string;
    readonly debugpyDistPath: string;
    readonly stopOnFirstLineWhileDebugging: boolean;
    readonly textOutputLimit: number;
    readonly magicCommandsAsComments: boolean;
    readonly pythonExportMethod: string;
    readonly stopOnError: boolean;
    readonly remoteDebuggerPort: number;
    readonly colorizeInputBox: boolean;
    readonly addGotoCodeLenses: boolean;
    readonly runStartupCommands: string | string[];
    readonly debugJustMyCode: boolean;
    readonly defaultCellMarker: string;
    readonly verboseLogging: boolean;
    readonly themeMatplotlibPlots: boolean;
    readonly variableQueries: IVariableQuery[];
    readonly disableJupyterAutoStart: boolean;
    readonly jupyterCommandLineArguments: string[];
    readonly widgetScriptSources: WidgetCDNs[];
    readonly alwaysScrollOnNewCell: boolean;
    readonly interactiveWindowMode: InteractiveWindowMode;
    readonly disableZMQSupport: boolean;
    readonly disablePythonDaemon: boolean;
    readonly variableTooltipFields: IVariableTooltipFields;
    readonly showVariableViewWhenDebugging: boolean;
    readonly newCellOnRunLast: boolean;
    readonly pylanceHandlesNotebooks?: boolean;
    readonly pythonCompletionTriggerCharacters?: string;
    readonly logKernelOutputSeparately: boolean;
    readonly poetryPath: string;
}

export interface IVariableTooltipFields {
    [languageKey: string]: {
        [typeNameKey: string]: string[]; // List of attributes
    };
}

export interface IWatchableJupyterSettings extends IJupyterSettings {
    readonly onDidChange: Event<void>;
}

export type LoggingLevelSettingType = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'verbose';

export interface ILoggingSettings {
    readonly level: LogLevel | 'off';
}

export interface IExperiments {
    /**
     * Return `true` if experiments are enabled, else `false`.
     */
    readonly enabled: boolean;
    /**
     * Experiments user requested to opt into manually
     */
    readonly optInto: string[];
    /**
     * Experiments user requested to opt out from manually
     */
    readonly optOutFrom: string[];
}

export interface IVariableQuery {
    language: string;
    query: string;
    parseExpr: string;
}

export type InteractiveWindowMode = 'perFile' | 'single' | 'multiple';

export type WidgetCDNs = 'unpkg.com' | 'jsdelivr.com';

export const IConfigurationService = Symbol('IConfigurationService');
export interface IConfigurationService {
    getSettings(resource?: Uri): IWatchableJupyterSettings;
    isTestExecution(): boolean;
    updateSetting(setting: string, value?: {}, resource?: Uri, configTarget?: ConfigurationTarget): Promise<void>;
    updateSectionSetting(
        section: string,
        setting: string,
        value?: {},
        resource?: Uri,
        configTarget?: ConfigurationTarget
    ): Promise<void>;
}

export const ISocketServer = Symbol('ISocketServer');
export interface ISocketServer extends Disposable {
    readonly client: Promise<Socket>;
    Start(options?: { port?: number; host?: string }): Promise<number>;
}

export type DownloadOptions = {
    /**
     * Prefix for progress messages displayed.
     *
     * @type {('Downloading ... ' | string)}
     */
    progressMessagePrefix: 'Downloading ... ' | string;
    /**
     * Output panel into which progress information is written.
     *
     * @type {IOutputChannel}
     */
    outputChannel?: IOutputChannel;
    /**
     * Extension of file that'll be created when downloading the file.
     *
     * @type {('tmp' | string)}
     */
    extension: 'tmp' | string;
};

export const IFileDownloader = Symbol('IFileDownloader');
/**
 * File downloader, that'll display progress in the status bar.
 *
 * @export
 * @interface IFileDownloader
 */
export interface IFileDownloader {
    /**
     * Download file and display progress in statusbar.
     * Optionnally display progress in the provided output channel.
     *
     * @param {string} uri
     * @param {DownloadOptions} options
     * @returns {Promise<string>}
     * @memberof IFileDownloader
     */
    downloadFile(uri: string, options: DownloadOptions): Promise<string>;
}

export const IHttpClient = Symbol('IHttpClient');
export interface IHttpClient {
    downloadFile(uri: string): Promise<RequestResult>;
    /**
     * Downloads file from uri as string and parses them into JSON objects
     * @param uri The uri to download the JSON from
     * @param strict Set `false` to allow trailing comma and comments in the JSON, defaults to `true`
     */
    getJSON<T>(uri: string, strict?: boolean): Promise<T>;
    /**
     * Returns the url is valid (i.e. return status code of 200).
     */
    exists(uri: string): Promise<boolean>;
}

export const IExtensionContext = Symbol('ExtensionContext');
export interface IExtensionContext extends ExtensionContext {}

export const IExtensions = Symbol('IExtensions');
export interface IExtensions {
    /**
     * All extensions currently known to the system.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly all: readonly Extension<any>[];

    /**
     * An event which fires when `extensions.all` changes. This can happen when extensions are
     * installed, uninstalled, enabled or disabled.
     */
    readonly onDidChange: Event<void>;

    /**
     * Get an extension by its full identifier in the form of: `publisher.name`.
     *
     * @param extensionId An extension identifier.
     * @return An extension or `undefined`.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getExtension(extensionId: string): Extension<any> | undefined;

    /**
     * Get an extension its full identifier in the form of: `publisher.name`.
     *
     * @param extensionId An extension identifier.
     * @return An extension or `undefined`.
     */
    getExtension<T>(extensionId: string): Extension<T> | undefined;
    determineExtensionFromCallStack(): Promise<{ extensionId: string; displayName: string }>;
}

export const IBrowserService = Symbol('IBrowserService');
export interface IBrowserService {
    launch(url: string): void;
}

export const IJupyterExtensionBanner = Symbol('IJupyterExtensionBanner');
export interface IJupyterExtensionBanner {
    isEnabled(type: BannerType): boolean;
    showBanner(type: BannerType): Promise<void>;
}
export const BANNER_NAME_INTERACTIVE_SHIFTENTER: string = 'InteractiveShiftEnterBanner';

export const ISurveyBanner = Symbol('ISurveyBanner');
export interface ISurveyBanner extends IExtensionSingleActivationService, IJupyterExtensionBanner {}

export type DeprecatedSettingAndValue = {
    setting: string;
    values?: {}[];
};

export type DeprecatedFeatureInfo = {
    doNotDisplayPromptStateKey: string;
    message: string;
    moreInfoUrl: string;
    commands?: CommandsWithoutArgs[];
    setting?: DeprecatedSettingAndValue;
};

export const IFeatureDeprecationManager = Symbol('IFeatureDeprecationManager');

export interface IFeatureDeprecationManager extends Disposable {
    initialize(): void;
    registerDeprecation(deprecatedInfo: DeprecatedFeatureInfo): void;
}

export interface IDisposable {
    dispose(): void | undefined;
}
export interface IAsyncDisposable {
    dispose(): Promise<void>;
}

/**
 * Stores hash formats
 */
export interface IHashFormat {
    number: number; // If hash format is a number
    string: string; // If hash format is a string
}

/**
 * Interface used to implement cryptography tools
 */
export const ICryptoUtils = Symbol('ICryptoUtils');
export interface ICryptoUtils {
    /**
     * Creates hash using the data and encoding specified
     * @returns hash as number, or string
     * @param data The string to hash
     * @param hashFormat Return format of the hash, number or string
     * @param [algorithm]
     */
    createHash<E extends keyof IHashFormat>(
        data: string,
        hashFormat: E,
        algorithm?: 'SHA512' | 'SHA256' | 'FNV'
    ): IHashFormat[E];
}

export const IAsyncDisposableRegistry = Symbol('IAsyncDisposableRegistry');
export interface IAsyncDisposableRegistry extends IAsyncDisposable {
    push(disposable: IDisposable | IAsyncDisposable): void;
}

/**
 * Experiment service leveraging VS Code's experiment framework.
 */
export const IExperimentService = Symbol('IExperimentService');
export interface IExperimentService {
    activate(): Promise<void>;
    inExperiment(experimentName: Experiments): Promise<boolean>;
    getExperimentValue<T extends boolean | number | string>(experimentName: string): Promise<T | undefined>;
    logExperiments(): void;
}

export type InterpreterUri = Resource | PythonEnvironment;