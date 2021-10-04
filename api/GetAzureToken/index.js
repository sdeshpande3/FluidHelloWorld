var ScopeType =  require('@fluidframework/protocol-definitions');
var services =  require('@fluidframework/server-services-utils');

const key = "5f9d1943796b6d248041950aa2c1d7dc";

module.exports = async function (context, req) {
    const tenantId = (req.query.tenantId) || (req.body && req.body.tenantId);
    const documentId = (req.query.documentId) || (req.body && req.body.documentId);
    const userId = (req.query.userId) || (req.body && req.body.userId);
    const userName = (req.query.userName) || (req.body && req.body.userName);
    const scopes = (req.query.scopes) || (req.body && req.body.scopes);

    if (!tenantId) {
        context.res = {
            status: 400,
            body: "No tenantId provided in query params",
        };
    }

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

    let user = { name: userName, id: userId };

    const token = (await services).generateToken(
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
}
