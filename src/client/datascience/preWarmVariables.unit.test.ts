// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { anything, instance, mock, verify, when } from 'ts-mockito';
import { EventEmitter } from 'vscode';
import { IExtensionSingleActivationService } from '../activation/types';
import { PythonExtensionChecker } from '../api/pythonApi';
import { IPythonApiProvider, IPythonExtensionChecker } from '../api/types';
import { IWorkspaceService } from '../common/application/types';
import { CondaService } from '../common/process/condaService';
import { createDeferred } from '../common/utils/async';
import { IEnvironmentVariablesProvider } from '../common/variables/types';
import { JupyterInterpreterService } from './jupyter/interpreter/jupyterInterpreterService';
import { PreWarmActivatedJupyterEnvironmentVariables } from './preWarmVariables';
import { IRawNotebookSupportedService } from './types';
import { IEnvironmentActivationService } from '../interpreter/activation/types';
import { PythonEnvironment } from '../pythonEnvironments/info';
import { sleep } from '../../test/core';

suite('DataScience - PreWarm Env Vars', () => {
    let activationService: IExtensionSingleActivationService;
    let envActivationService: IEnvironmentActivationService;
    let jupyterInterpreter: JupyterInterpreterService;
    let onDidChangeInterpreter: EventEmitter<PythonEnvironment>;
    let interpreter: PythonEnvironment;
    let extensionChecker: PythonExtensionChecker;
    let zmqSupported: IRawNotebookSupportedService;
    setup(() => {
        interpreter = {
            path: '',
            sysPrefix: '',
            sysVersion: ''
        };
        onDidChangeInterpreter = new EventEmitter<PythonEnvironment>();
        envActivationService = mock<IEnvironmentActivationService>();
        jupyterInterpreter = mock(JupyterInterpreterService);
        when(jupyterInterpreter.onDidChangeInterpreter).thenReturn(onDidChangeInterpreter.event);
        extensionChecker = mock(PythonExtensionChecker);
        const apiProvider = mock<IPythonApiProvider>();
        when(apiProvider.onDidActivatePythonExtension).thenReturn(new EventEmitter<void>().event);
        when(extensionChecker.isPythonExtensionInstalled).thenReturn(true);
        when(extensionChecker.isPythonExtensionActive).thenReturn(true);
        zmqSupported = mock<IRawNotebookSupportedService>();
        const envVarsProvider = mock<IEnvironmentVariablesProvider>();
        when(envVarsProvider.getEnvironmentVariables(anything())).thenResolve();
        const workspace = mock<IWorkspaceService>();
        when(workspace.workspaceFolders).thenReturn();
        when(zmqSupported.isSupported).thenReturn(false);
        const pythonChecker = mock<IPythonExtensionChecker>();
        when(pythonChecker.isPythonExtensionInstalled).thenReturn(false);
        activationService = new PreWarmActivatedJupyterEnvironmentVariables(
            instance(envActivationService),
            instance(jupyterInterpreter),
            [],
            instance(extensionChecker),
            instance(apiProvider),
            instance(zmqSupported),
            instance(envVarsProvider),
            instance(workspace),
            instance(mock(CondaService)),
            instance(pythonChecker)
        );
    });
    test('Should not pre-warm env variables if there is no jupyter interpreter', async () => {
        const envActivated = createDeferred<string>();
        when(jupyterInterpreter.getSelectedInterpreter()).thenResolve(undefined);
        when(envActivationService.getActivatedEnvironmentVariables(anything(), anything())).thenCall(() => {
            envActivated.reject(new Error('Environment Activated when it should not have been!'));
            return Promise.resolve();
        });

        await activationService.activate();

        await Promise.race([envActivated.promise, sleep(50)]);
    });
    test('Should not pre-warm env variables if there is no python extension', async () => {
        const envActivated = createDeferred<string>();
        when(extensionChecker.isPythonExtensionInstalled).thenReturn(false);
        when(envActivationService.getActivatedEnvironmentVariables(anything(), anything())).thenCall(() => {
            envActivated.reject(new Error('Environment Activated when it should not have been!'));
            return Promise.resolve();
        });

        await activationService.activate();

        await Promise.race([envActivated.promise, sleep(50)]);
    });
    test('Should not pre-warm env variables if ZMQ is supported', async () => {
        const envActivated = createDeferred<string>();
        when(zmqSupported.isSupported).thenReturn(true);
        when(envActivationService.getActivatedEnvironmentVariables(anything(), anything())).thenCall(() => {
            envActivated.reject(new Error('Environment Activated when it should not have been!'));
            return Promise.resolve();
        });

        await activationService.activate();

        await Promise.race([envActivated.promise, sleep(50)]);
    });
    test('Should pre-warm env variables', async () => {
        const envActivated = createDeferred<string>();
        when(jupyterInterpreter.getSelectedInterpreter()).thenResolve(interpreter);
        when(envActivationService.getActivatedEnvironmentVariables(anything(), anything())).thenCall(() => {
            envActivated.resolve();
            return Promise.resolve();
        });

        await activationService.activate();

        await envActivated.promise;
        verify(envActivationService.getActivatedEnvironmentVariables(undefined, interpreter)).once();
    });
    test('Should pre-warm env variables when jupyter interpreter changes', async () => {
        const envActivated = createDeferred<string>();
        when(jupyterInterpreter.getSelectedInterpreter()).thenResolve(undefined);
        when(envActivationService.getActivatedEnvironmentVariables(anything(), anything())).thenCall(() => {
            envActivated.reject(new Error('Environment Activated when it should not have been!'));
            return Promise.resolve();
        });

        await activationService.activate();

        await Promise.race([envActivated.promise, sleep(50)]);

        // Change interpreter
        when(jupyterInterpreter.getSelectedInterpreter()).thenResolve(interpreter);
        when(envActivationService.getActivatedEnvironmentVariables(anything(), anything())).thenCall(() => {
            envActivated.resolve();
            return Promise.resolve();
        });
        onDidChangeInterpreter.fire(interpreter);

        await envActivated.promise;
        verify(envActivationService.getActivatedEnvironmentVariables(undefined, interpreter)).once();
    });
});