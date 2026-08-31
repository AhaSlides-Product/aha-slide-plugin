import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';

/**
 * HTTP e2e for the Preference-based Grouping backend. Boots the real Nest app on
 * an ephemeral port and drives it over the wire with the global fetch, so no
 * extra HTTP client dependency is required. Mirrors the production
 * ValidationPipe so the contract these tests assert is the one clients hit.
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    await app.close();
  });

  it('Verify that GET /health-check returns 200 OK', async () => {
    const res = await fetch(`${baseUrl}/health-check`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('OK');
  });

  it('Verify that POST /external/form-groups partitions the roster without leaking picks', async () => {
    const participantIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
    const res = await fetch(`${baseUrl}/external/form-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantIds,
        picks: { p1: ['p2'], p2: ['p1'], p3: ['p4'], p4: ['p3'] },
        targetSize: 3,
      }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();

    expect(Object.keys(body).sort()).toEqual(['groups', 'seed']);
    expect(typeof body.seed).toBe('number');
    expect(Array.isArray(body.groups)).toBe(true);

    // Every participant is placed in exactly one group, and each group is
    // identified — a full partition.
    const placed: string[] = [];
    for (const group of body.groups) {
      expect(typeof group.id).toBe('string');
      expect(group.id.length).toBeGreaterThan(0);
      expect(Array.isArray(group.memberIds)).toBe(true);
      placed.push(...group.memberIds);
    }
    expect(placed.sort()).toEqual([...participantIds].sort());
    expect(new Set(placed).size).toBe(participantIds.length);

    // Privacy: the response carries no pick data — no pickedPeerIds and no
    // per-person match structure, only opaque member ids.
    const serialised = JSON.stringify(body);
    expect(serialised).not.toContain('pickedPeerIds');
    expect(serialised).not.toContain('picks');
  });
});
