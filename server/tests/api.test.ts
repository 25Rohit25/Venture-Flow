import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { StartupModel } from '../src/modules/startups/startup.model.js';
import { InterestModel } from '../src/modules/interests/interest.model.js';
import { BookmarkModel } from '../src/modules/bookmarks/bookmark.model.js';

describe('VentureFlow API Integration Tests', () => {
  let founderToken: string;
  let founder2Token: string;
  let investorToken: string;
  let investorCookie: string;
  let founderId: string;
  let founder2Id: string;
  let investorId: string;
  let publishedStartupId: string;
  let draftStartupId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodbUri);
    }
    // Clean test database and sync unique indexes
    await Promise.all([
      UserModel.deleteMany({}),
      StartupModel.deleteMany({}),
      InterestModel.deleteMany({}),
      BookmarkModel.deleteMany({}),
    ]);

    await Promise.all([
      UserModel.init(),
      StartupModel.init(),
      InterestModel.init(),
      BookmarkModel.init(),
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Authentication Suite', () => {
    it('AUTH-01: Founder registration + login (201/200 and cookie set)', async () => {
      // Register
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Asha Founder',
          email: 'asha.test@ventureflow.demo',
          password: 'TestPassword123!',
          role: 'FOUNDER',
        });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.data.user.role).toBe('FOUNDER');
      founderId = regRes.body.data.user.id;
      founderToken = regRes.body.data.token;

      // Verify cookie
      const cookies = regRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'asha.test@ventureflow.demo',
          password: 'TestPassword123!',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.user.email).toBe('asha.test@ventureflow.demo');
      expect(loginRes.headers['set-cookie']).toBeDefined();

      // Register second founder for ownership tests
      const f2Res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Rohan Founder',
          email: 'rohan.test@ventureflow.demo',
          password: 'TestPassword123!',
          role: 'FOUNDER',
        });
      founder2Token = f2Res.body.data.token;
      founder2Id = f2Res.body.data.user.id;

      // Register investor
      const invRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Vikram Investor',
          email: 'vikram.test@ventureflow.demo',
          password: 'TestPassword123!',
          role: 'INVESTOR',
        });
      expect(invRes.status).toBe(201);
      investorToken = invRes.body.data.token;
      investorId = invRes.body.data.user.id;
      const invCookies = invRes.headers['set-cookie'];
      if (invCookies && invCookies.length > 0) {
        investorCookie = invCookies[0].split(';')[0];
      }
    });

    it('AUTH-02: Duplicate registered email returns 409', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate Asha',
          email: 'asha.test@ventureflow.demo',
          password: 'TestPassword123!',
          role: 'FOUNDER',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('AUTH-03: No cookie/token on protected route returns 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('RBAC & Startup Management Suite', () => {
    it('RBAC-01: Investor tries creating startup returns 403', async () => {
      const res = await request(app)
        .post('/api/v1/startups')
        .set('Authorization', `Bearer ${investorToken}`)
        .send({
          name: 'Illegal Startup',
          tagline: 'Should be blocked by role authorization',
          description: 'This startup attempt by an investor role must be rejected by server middleware.',
          industry: 'FINTECH',
          stage: 'IDEA',
          targetAmount: 5000000,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Founder creates draft and publishes startup', async () => {
      // 1. Create published startup
      const createRes = await request(app)
        .post('/api/v1/startups')
        .set('Authorization', `Bearer ${founderToken}`)
        .send({
          name: 'HealthFlow AI',
          tagline: 'Streamlined patient clinical notes and automated triage',
          description:
            'HealthFlow AI structures unstructured outpatient intake consultations directly into actionable EHR summaries. We save doctors up to 2 hours every day.',
          industry: 'HEALTHTECH',
          stage: 'MVP',
          targetAmount: 3000000,
          location: 'Bengaluru, India',
        });

      expect(createRes.status).toBe(201);
      publishedStartupId = createRes.body.data._id;

      // Publish it
      const pubRes = await request(app)
        .patch(`/api/v1/startups/${publishedStartupId}/status`)
        .set('Authorization', `Bearer ${founderToken}`)
        .send({ status: 'PUBLISHED' });

      expect(pubRes.status).toBe(200);
      expect(pubRes.body.data.status).toBe('PUBLISHED');

      // 2. Create another startup that remains in DRAFT
      const draftRes = await request(app)
        .post('/api/v1/startups')
        .set('Authorization', `Bearer ${founderToken}`)
        .send({
          name: 'Secret Stealth Project',
          tagline: 'Unreleased stealth technology for next generation chips',
          description:
            'A confidential semiconductor design platform in very early research stage. Only founder should ever be able to see this until published.',
          industry: 'SAAS',
          stage: 'IDEA',
          targetAmount: 8000000,
        });

      expect(draftRes.status).toBe(201);
      draftStartupId = draftRes.body.data._id;
    });

    it("OWN-01: Founder edits another founder's startup returns 403", async () => {
      const res = await request(app)
        .patch(`/api/v1/startups/${publishedStartupId}`)
        .set('Authorization', `Bearer ${founder2Token}`)
        .send({
          name: 'Hacked Startup Name',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Discovery & Privacy Suite', () => {
    it('DISC-01: Draft startup is absent from public discovery listing', async () => {
      const res = await request(app).get('/api/v1/startups');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const items = res.body.data;
      const draftItem = items.find((s: any) => s._id === draftStartupId);
      expect(draftItem).toBeUndefined();

      const publishedItem = items.find((s: any) => s._id === publishedStartupId);
      expect(publishedItem).toBeDefined();
      // Ensure no private founder email leakage
      expect(publishedItem.founderId.email).toBeUndefined();
    });

    it('DISC-02: Search, filter, and pagination return correct results and metadata', async () => {
      const res = await request(app).get('/api/v1/startups?industry=HEALTHTECH&sort=newest&page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].industry).toBe('HEALTHTECH');
    });
  });

  describe('Interest Pipeline Suite & Concurrency', () => {
    let createdInterestId: string;

    it('INT-03: Investor tries interest on draft startup returns 404', async () => {
      const res = await request(app)
        .post(`/api/v1/startups/${draftStartupId}/interests`)
        .set('Authorization', `Bearer ${investorToken}`)
        .send({
          message: 'Trying to express interest in an unpublished draft startup should fail.',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('INT-01: Investor interest on published startup returns 201 PENDING', async () => {
      const res = await request(app)
        .post(`/api/v1/startups/${publishedStartupId}/interests`)
        .set('Authorization', `Bearer ${investorToken}`)
        .send({
          message: 'We are very interested in your HealthFlow platform and want to discuss investment.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      createdInterestId = res.body.data._id;
    });

    it('INT-02: Same investor submits interest twice returns 409 duplicate', async () => {
      const res = await request(app)
        .post(`/api/v1/startups/${publishedStartupId}/interests`)
        .set('Authorization', `Bearer ${investorToken}`)
        .send({
          message: 'Duplicate second submission attempt should be rejected by server.',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTEREST_ALREADY_EXISTS');

      // Verify only 1 document exists in database
      const count = await InterestModel.countDocuments({
        startupId: publishedStartupId,
        investorId: investorId,
      });
      expect(count).toBe(1);
    });

    it('INT-04: Non-owner founder tries accepting interest returns 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/interests/${createdInterestId}/status`)
        .set('Authorization', `Bearer ${founder2Token}`)
        .send({
          status: 'ACCEPTED',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Founder accepts pending interest', async () => {
      const res = await request(app)
        .patch(`/api/v1/interests/${createdInterestId}/status`)
        .set('Authorization', `Bearer ${founderToken}`)
        .send({
          status: 'ACCEPTED',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ACCEPTED');
    });

    it('INT-05: Founder accepts, then tries declining returns 409 transition conflict', async () => {
      const res = await request(app)
        .patch(`/api/v1/interests/${createdInterestId}/status`)
        .set('Authorization', `Bearer ${founderToken}`)
        .send({
          status: 'DECLINED',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('INT-06: Investor withdraws, founder responds yields 409 transition conflict', async () => {
      // Create a new investor & interest to test withdraw flow
      const newInv = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Second Investor',
          email: 'second.inv@ventureflow.demo',
          password: 'Password123!',
          role: 'INVESTOR',
        });

      const intRes = await request(app)
        .post(`/api/v1/startups/${publishedStartupId}/interests`)
        .set('Authorization', `Bearer ${newInv.body.data.token}`)
        .send({
          message: 'I want to partner with your clinical startup for series seed funding.',
        });

      const intId = intRes.body.data._id;

      // Investor withdraws
      const withdrawRes = await request(app)
        .post(`/api/v1/interests/${intId}/withdraw`)
        .set('Authorization', `Bearer ${newInv.body.data.token}`);

      expect(withdrawRes.status).toBe(200);
      expect(withdrawRes.body.data.status).toBe('WITHDRAWN');

      // Founder tries to accept already withdrawn interest -> 409
      const acceptRes = await request(app)
        .patch(`/api/v1/interests/${intId}/status`)
        .set('Authorization', `Bearer ${founderToken}`)
        .send({ status: 'ACCEPTED' });

      expect(acceptRes.status).toBe(409);
    });

    it('Concurrency test: Parallel POST interest requests for same pair yield exactly one 201 and one 409', async () => {
      // Create fresh third investor
      const thirdInv = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Concurrent Investor',
          email: 'concurrent.inv@ventureflow.demo',
          password: 'Password123!',
          role: 'INVESTOR',
        });

      const token = thirdInv.body.data.token;

      // Fire 2 concurrent requests simultaneously
      const [res1, res2] = await Promise.all([
        request(app)
          .post(`/api/v1/startups/${publishedStartupId}/interests`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            message: 'First concurrent interest message from investor evaluating this round.',
          }),
        request(app)
          .post(`/api/v1/startups/${publishedStartupId}/interests`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            message: 'Second concurrent interest message sent at the exact same millisecond.',
          }),
      ]);

      const statuses = [res1.status, res2.status].sort();
      expect(statuses).toEqual([201, 409]);

      // Exactly 1 record in database
      const dbCount = await InterestModel.countDocuments({
        startupId: publishedStartupId,
        investorId: thirdInv.body.data.user.id,
      });
      expect(dbCount).toBe(1);
    });
  });

  describe('Security & Error Validation Suite', () => {
    it('SEC-01: Invalid Mongo ObjectId / invalid body returns safe 400 without crashing', async () => {
      const res = await request(app).get('/api/v1/startups/invalid-not-an-id-1234');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });
});
