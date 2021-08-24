/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ContainerSchema, ISharedMap, SharedMap } from "@fluid-experimental/fluid-framework";
import { FrsAzFunctionTokenProvider, FrsClient, FrsConnectionConfig, FrsContainerConfig } from "@fluid-experimental/frs-client";
import { getContainerId } from "./utils";
import { jsRenderView as renderView } from "./view";
import { httpTrigger } from '../api/GetFrsToken';

async function start() {

    const { id, isNew } = getContainerId();

    // This configures the FrsClient to use a local in-memory service called Tinylicious.
    // You can run Tinylicious locally using 'npx tinylicious'.
    // const localConfig: FrsConnectionConfig = {
    //     tenantId: "local",
    //     tokenProvider: new InsecureTokenProvider("anyValue", { id: "userId" }),
    //     // if you're running Tinylicious on a non-default port, you'll need change these URLs
    //     orderer: "http://localhost:7070",
    //     storage: "http://localhost:7070",
    // };

    // This configures the FrsClient to use a remote Azure Fluid Service instance.
    const frsAzUser = {
        userId: "Test User",
        userName: "test-user"
    }

    const token = httpTrigger as any;
    console.log("TOKEN: ", token);

    const prodConfig: FrsConnectionConfig = {
        tenantId: "frs-client-tenant",
        tokenProvider: new FrsAzFunctionTokenProvider("https://sonaliazfunc.azurewebsites.net/api/GetFrsToken", frsAzUser),
        orderer: "https://alfred.eus-1.canary.frs.azure.com",
        storage: "https://historian.eus-1.canary.frs.azure.com",
    };

    const client = new FrsClient(prodConfig);

    const containerConfig: FrsContainerConfig = { id };
    const containerSchema: ContainerSchema = {
        name: "hello-world-demo-container",
        initialObjects: { dice: SharedMap }
    };

    const { fluidContainer } = isNew
        ? await client.createContainer(containerConfig, containerSchema)
        : await client.getContainer(containerConfig, containerSchema);

    renderView(
        fluidContainer.initialObjects.dice as ISharedMap,
        document.getElementById("content") as HTMLDivElement
    );
}

start().catch((error) => console.error(error));
