/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { performance } from "@fluidframework/common-utils";
import {
    TelemetryLogger,
    MultiSinkLogger,
    ChildLogger,
} from "@fluidframework/telemetry-utils";

/**
 * Implementation of debug logger
 */
export class ContainerDebugLogger extends TelemetryLogger {

    static create(
        properties,
    ) {
        return new ContainerDebugLogger(properties);
    }

    /**
     * Mix in debug logger with another logger.
     * Returned logger will output events to both newly created debug logger, as well as base logger
     * @param namespace - Telemetry event name prefix to add to all events
     * @param properties - Base properties to add to all events
     * @param propertyGetters - Getters to add additional properties to all events
     * @param baseLogger - Base logger to output events (in addition to debug logger being created). Can be undefined.
     */
    static mixinDebugLogger(
        namespace,
        baseLogger,
        properties,
    ) {
        console.log("mixinDebugLogger debugger", namespace);
        if (!baseLogger) {
            return ContainerDebugLogger.create(namespace, properties);
        }

        const multiSinkLogger = new MultiSinkLogger(undefined, properties);
        multiSinkLogger.addLogger(
            ContainerDebugLogger.create(
                namespace,
                this.tryGetBaseLoggerProps(baseLogger),
            ),
        );
        multiSinkLogger.addLogger(ChildLogger.create(baseLogger, namespace));

        return multiSinkLogger;
    }

    static tryGetBaseLoggerProps(baseLogger) {
        if (baseLogger instanceof TelemetryLogger) {
            return (baseLogger).properties;
        }
        return undefined;
    }

    constructor(properties) {
        super(undefined, properties);

        // Kick Off another node process running our (Shell UI) App
        const popupParams = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
        width=0,height=0,left=-1000,top=-1000`;
        this.debuggerPopup = window.open(
            "http://localhost:8080/",
            "Container Debugger",
            popupParams,
        );
    }

    /**
     * Send an event to debug loggers
     *
     * @param event - the event to send
     */
    send(event) {
        console.log("Container Debug Logger event -----", event);

        const index = event.eventName.lastIndexOf(
            TelemetryLogger.eventNamespaceSeparator,
        );
        const name = event.eventName.substring(index + 1);
        const stack = event.stack ?? "";
        let tick = "";
        tick = `tick=${TelemetryLogger.formatTick(performance.now())}`;

        let payload;
        try {
            payload = JSON.stringify(event);
        } catch (error) {
            event.error = undefined;
            payload = JSON.stringify(event);
        }

        if (payload === "{}") {
            payload = "";
        }

        console.log(`CDL: ${name} ${payload} ${tick} ${stack}`);

        // TODO: Send message to our Shell App via IPC
        this.debuggerPopup?.postMessage(payload, "http://localhost:8080/");
    }
}
