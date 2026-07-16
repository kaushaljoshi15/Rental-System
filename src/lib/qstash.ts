import { Client } from '@upstash/qstash'

const qstashToken = process.env.QSTASH_TOKEN;

if (!qstashToken) {
  console.warn("⚠️ Upstash QStash environment variable QSTASH_TOKEN is missing. Background scheduling will be bypassed.");
}

export const qstash = qstashToken
  ? new Client({ token: qstashToken })
  : null;
