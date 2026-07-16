import { describe, it, expect, vi, beforeEach } from 'vitest'
import { askSupportBot } from './support'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

describe('askSupportBot', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns generic assistant info when query is unrecognized', async () => {
    const result = await askSupportBot('hello there')
    expect(result.reply).toContain('Sahayak')
    expect(result.suggestedPrompts).toContain('Help with your order')
  })

  it('returns refund rules when query contains cancel or refund keyword', async () => {
    const result = await askSupportBot('tell me about refund policy')
    expect(result.reply).toContain('Refund Policy')
    expect(result.reply).toContain('Full Refund')
  })

  it('returns weekend pricing surcharge policy when query contains weekend', async () => {
    const result = await askSupportBot('what is weekend surcharge?')
    expect(result.reply).toContain('Weekend Surcharges')
    expect(result.reply).toContain('20% peak premium')
  })
})
