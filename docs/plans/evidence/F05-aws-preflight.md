# F05 AWS preflight — 14 October 2026

Author: Codex (agent). This is setup evidence, not F05 acceptance.

## Verified target

- Implementation branch: `codex/civicmaps-f05-build`; PR #12 open/draft at `d13a982b04f0ec5399650b71e026af122e72f104` on resumption.
- Empirical workspace: CivicMAPS-rebuild. Retrieved handoff `6acf197bffb684dbbe239f44` and full AWS guide `6acf1942ffb684dbbe239eaf`.
- AWS CLI 2.38.0 exists at `/workspace/aws-toolkit/bin/aws`. Configuration and login-cache directories are present; cache contents were not printed.
- `aws configure get region --profile CivicMAPS`: `ap-southeast-2`.
- `aws sts get-caller-identity --profile CivicMAPS --region ap-southeast-2`: project `597663815195`, assumed `AccountFullAccessRole`.
- `aws freetier get-account-plan-state`: ACTIVE FREE plan, US$100 remaining credits, reported expiry 14 April 2027. This is not a spending authorisation.
- Sydney inventory: no RDS instances and no Systems Manager managed instances; default VPC `vpc-0902d21c7dcbb3701` exists. This is a scoped inventory, not a complete project inventory.
- Owner selected separate municipality PostgreSQL databases/logins on shared compute. This is logical isolation, not dedicated compute. Guidance preference: Medium.

## Live MCP verification

`codex mcp get aws-mcp` reported no configured server in this session. A temporary Python MCP client successfully initialised the documented `mcp-proxy-for-aws` stdio proxy, listed tools, called `aws___search_documentation`, and retrieved `rds-oss` using `aws___retrieve_skill`. Both calls returned `isError: false`. The endpoint was `https://aws-mcp.us-east-1.api.aws/mcp`; application resources remain in Sydney.

Use these non-secret environment selectors when launching the proxy:

```text
AWS_MCP_PROXY_PROFILES=CivicMAPS
AWS_CONFIG_FILE=/workspace/aws-toolkit/config/aws-config
AWS_LOGIN_CACHE_DIRECTORY=/workspace/aws-toolkit/config/login-cache
UV_CACHE_DIR=/workspace/aws-toolkit/uv-cache
UV_TOOL_DIR=/workspace/aws-toolkit/uv-tools
```

Gotcha: setting only UV_CACHE_DIR was insufficient; uvx tried to create `/home/agent/.local/share/uv/tools` on a read-only filesystem. A writable UV_TOOL_DIR resolved startup. Live MCP success does not mean the current Codex tool catalogue has dynamically loaded AWS tools.

## Proposed development configuration and cost

Owner selected budget and retention on 14 October 2026. Proposed configuration: one private Single-AZ RDS PostgreSQL `db.t4g.micro`, 20 GiB encrypted gp3, separate Alpha/Beta databases and runtime logins, enforced TLS/SCRAM, Secrets Manager references, and independently authorised S3 storage. Use a temporary Systems Manager access runner with no inbound access for cloud acceptance. No NAT gateway, public database access, DNS or application deployment is proposed. Engine version and access-runner details must be pinned against current supported options before provisioning.

Live AWS Price List API query (Sydney, PostgreSQL, Single-AZ) returned:

| Item | Unit price | Monthly estimate |
| --- | --- | --- |
| db.t4g.micro | US$0.025/hour | US$18.25 at 730 hours |
| gp3 | US$0.138/GiB-month | US$2.76 for 20 GiB |
| Database baseline | | US$21.01 |

Calculated with Python Decimal. This is on-demand list pricing before credits, tax and currency conversion. Secrets, S3 requests/storage, logs, excess backup storage, burst CPU charges and the access runner are additional. US$30–40/month is a planning allowance for light development, not a quoted complete bill or enforced ceiling. Proposed budget: US$50/month, initial acceptance allocation US$15, review after seven days. Preserve populated resources; clean only explicitly owned empty test resources. The owner selected these values. Budget alerts are not a hard cap; spend limits are managed in AWS Settings > Billing.

The [new-experience supported-services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html) was read live. RDS, S3, Secrets Manager, EC2, Systems Manager and IAM are listed for Free Tier. Listed support does not guarantee permission for every operation.

## Pre-creation snapshot and subsequent execution

Budget/retention and isolation are selected. Validate the concrete configuration before creation. Implement and execute the complete [F05 acceptance matrix](../F05-preparation.md#acceptance-matrix). No resources were created during this preflight. No runtime tests or cloud isolation acceptance are claimed. This was the pre-creation snapshot. The subsequent deployed inventory, acceptance results and resource disposition are recorded in [F05 evidence](F05.md); F06 has not started.
