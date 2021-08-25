import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ScopeType } from "@fluidframework/protocol-definitions";
import { generateToken, generateUser } from "@fluidframework/server-services-utils";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    // Parse out query parameters. tenantId and documentId are required, userId, userName, and scopes are
    // optional and willbe filled with default values if not provided
    const tenantId = (req.query.tenantId || (req.body && req.body.tenantId)) as string;
    const documentId = (req.query.documentId || (req.body && req.body.documentId)) as string;
    const userId = (req.query.userId || (req.body && req.body.userId)) as string;
    const userName = (req.query.userName || (req.body && req.body.userName)) as string;
    const scopes = (req.query.scopes || (req.body && req.body.scopes)) as ScopeType[];

    if (!tenantId) {
        context.res = {
            status: 400,
            body: "No tenantId provided in query params",
        };
    }

    // The private key for the given tenantId will be parsed out from the Azure Function's application settings. The value for
    // "tenants" here is a JSON blob that holds the mapping between tenantId's and their respective secret keys
    const key = JSON.parse(process.env["tenants"])[tenantId];
    if (!key) {
        context.res = {
            status: 404,
            body: `No key found for the provided tenantId: ${tenantId}`,
        };
    }

    if (!documentId) {
        context.res = {
            status: 400,
            body: "No documentId provided in query params"
        };
    }

    // generateUser will generate a random userName and userId. If either of these values are not provided as
    // query parameters, the randomly generated values will be used instead
    let user = { name: userName, id: userId };
    if (!userId || !userName) {
        const generatedUser = generateUser() as any;
        user = { name: userName ?? generatedUser.name, id: userId ?? generatedUser.id };
    }

    // This will generate a token for the given user that is signed using the tenant's secret key. This allows the token
    // to be returned to the client without ever exposing the secret itself to it. Instead, the token is generated using it
    // to provide scoped access to the given document. This token can be returned by an ITokenProvider implementation to use
    // with the FrsClient.
    const token = generateToken(
        tenantId,
        documentId,
        key,
        scopes ?? [ScopeType.DocRead, ScopeType.DocWrite, ScopeType.SummaryWrite],
        user
    );

    context.res = {
        status: 200,
        body: token
    };
};

export default httpTrigger; 