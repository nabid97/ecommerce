import { rest } from 'msw';

export const handlers = [
  // Orders
  rest.post('/api/orders', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '123',
        status: 'pending',
        items: req.body.items,
        total: 100,
        createdAt: new Date().toISOString()
      })
    );
  }),

  // Auth
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'fake-token',
        user: {
          id: '123',
          email: 'test@example.com'
        }
      })
    );
  }),

  // Fabrics
  rest.get('/api/fabrics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Cotton',
          price: 10,
          available: true
        },
        {
          id: '2',
          name: 'Silk',
          price: 20,
          available: true
        }
      ])
    );
  }),

  // Logo Generation
  rest.post('/api/logos/generate', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        url: 'https://example.com/generated-logo.png'
      })
    );
  }),

  // Image Upload
  rest.post('/api/upload', async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        url: 'https://example.com/uploaded-image.jpg'
      })
    );
  })
];

module.exports = { handlers };
