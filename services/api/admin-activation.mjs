import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { transaction } from './database.mjs';
import { hashPassword } from './passwords.mjs';
import { loginThrottle } from './login-throttle.mjs';
import { deployedRouting } from './routing.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function requireValue(value, status, message) {
  if (!value) throw Object.assign(new Error(message), { status });
}
export function adminActivationRoutes(router, { authorised, mutation, input }) {
  router.get('/municipalities/:id/activation', async (req, res) => {
    requireValue(uuid.test(req.params.id), 404, 'Municipality not found');
    res.json(
      await authorised(req, false, async (client) => {
        const { rows } = await client.query('SELECT civicmaps_admin_status($1) AS data', [
          req.params.id,
        ]);
        return rows[0].data ?? { state: 'Not designated', contexts: [], latest: null };
      }),
    );
  });
  router.post('/municipalities/:id/activation', async (req, res) => {
    const data = input(req, ['bindingId', 'verifiedEmail', 'recipientVerified']);
    requireValue(
      uuid.test(req.params.id) && uuid.test(data.bindingId),
      400,
      'Select an explicit council context',
    );
    requireValue(
      data.recipientVerified === true &&
        typeof data.verifiedEmail === 'string' &&
        data.verifiedEmail.length <= 200,
      400,
      'Verify the designated recipient before issuing a link',
    );
    try {
      res.json(
        await mutation(req, async (client, actor) => {
          const raw = randomBytes(32).toString('hex');
          const { rows } = await client.query(
            'SELECT civicmaps_issue_admin($1,$2,$3,$4,$5,$6) AS data',
            [
              req.params.id,
              data.bindingId,
              actor.id,
              data.verifiedEmail,
              randomUUID(),
              digest(raw),
            ],
          );
          const hostname = (
            await client.query(
              "SELECT hostname FROM service_routes WHERE municipality_id=$1 AND binding_id=$2 AND service='commandmaps'",
              [req.params.id, data.bindingId],
            )
          ).rows[0]?.hostname;
          requireValue(
            !deployedRouting() || hostname,
            409,
            'Council service route is required for delivery',
          );
          const origin = deployedRouting()
            ? `https://${hostname}`
            : (process.env.CIVICMAPS_ACTIVATION_ORIGIN ?? 'http://127.0.0.1:5173');
          return {
            ...rows[0].data,
            activationUrl: `${origin}/#activate/${req.params.id}/${data.bindingId}/${raw}`,
          };
        }),
      );
    } catch (error) {
      if (error.code === '22023') error.status = 409;
      throw error;
    }
  });
  router.post('/municipalities/:id/activation/disable', async (req, res) => {
    requireValue(uuid.test(req.params.id), 404, 'Municipality not found');
    input(req, []);
    try {
      res.json(
        await mutation(
          req,
          async (client, actor) =>
            (
              await client.query('SELECT civicmaps_disable_admin($1,$2) AS data', [
                req.params.id,
                actor.id,
              ])
            ).rows[0].data,
        ),
      );
    } catch (error) {
      if (error.code === '22023') error.status = 409;
      throw error;
    }
  });
}
export function redemptionRoute(app, body) {
  const throttle = loginThrottle();
  app.post('/api/activation/redeem', async (req, res) => {
    const data = body(req, ['municipalityId', 'bindingId', 'token', 'password']);
    requireValue(
      uuid.test(data.municipalityId) &&
        uuid.test(data.bindingId) &&
        typeof data.token === 'string' &&
        /^[a-f0-9]{64}$/.test(data.token),
      400,
      'A complete activation link is required',
    );
    throttle(req, digest(data.token));
    requireValue(
      typeof data.password === 'string' &&
        data.password.length >= 12 &&
        data.password.length <= 128,
      400,
      'Choose a password between 12 and 128 characters',
    );
    const passwordHash = await hashPassword(data.password);
    const result = await transaction(
      async (client) =>
        (
          await client.query('SELECT civicmaps_redeem_admin($1,$2,$3,$4,$5) AS data', [
            data.municipalityId,
            data.bindingId,
            digest(data.token),
            passwordHash,
            req.serviceRoute?.id ?? null,
          ])
        ).rows[0].data,
    );
    // Rejections commit their non-secret audit event; throwing inside the transaction
    // would erase the evidence. No credential/token is stored in a retry receipt.
    res.status(result.status ?? 200).json(result);
  });
}
