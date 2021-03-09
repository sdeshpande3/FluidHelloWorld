/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    IKeyValueDataObject,
    KeyValueInstantiationFactory,
} from '@fluid-experimental/data-objects';
import { Fluid } from '@fluid-experimental/fluid-static';
import { getContainerId } from './utils';
import { reactRenderView as renderView } from './view';

const { containerId, isNew } = getContainerId();

const defaultData = {
    "dice": 1
}

async function start(): Promise<void> {
    let keyValueDataObject: IKeyValueDataObject;

    if (isNew) {
        const fluidDocument = await Fluid.createDocument(
            containerId,
            [KeyValueInstantiationFactory.registryEntry]
        );
        keyValueDataObject = await fluidDocument.createDataObject(
            KeyValueInstantiationFactory.type,
            'dice'
        );
        for (let key in defaultData) {
            keyValueDataObject.set(key, defaultData[key])
        }
    } else {
        const fluidDocument = await Fluid.getDocument(
            containerId,
            [KeyValueInstantiationFactory.registryEntry]
        );
        keyValueDataObject = await fluidDocument.getDataObject('dice');
    }

    renderView(keyValueDataObject, document.getElementById('content') as HTMLDivElement);
}

start().catch((error) => console.error(error));
