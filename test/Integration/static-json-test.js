const Path = require('path');
const FS = require('fs/promises');

const Code = require('@hapi/code');
const Joi = require('joi');
const Lab = require('@hapi/lab');
const Helper = require('../helper.js');

const expect = Code.expect;
const lab = (exports.lab = Lab.script());

const STATIC_PATH = Path.join(__dirname, '..', '..', 'data.json');

lab.experiment('plugin', () => {
  const testRoutes = [
    {
      method: 'POST',
      path: '/users',
      options: {
        handler: Helper.defaultHandler,
        description: 'Create new end-user',
        notes: 'Create user',
        tags: ['api'],
        validate: {
          payload: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required()
          }).label('user')
        }
      },
    },
    {
      method: 'POST',
      path: '/admins',
      options: {
        handler: Helper.defaultHandler,
        description: 'Create new admin',
        notes: 'Create admin',
        tags: ['api'],
        validate: {
          payload: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required()
          }).label('admin')
        }
      },
    },
    {
      method: 'PUT',
      path: '/admins',
      options: {
        handler: Helper.defaultHandler,
        description: 'Update admin',
        notes: 'Update admin',
        tags: ['api'],
        validate: {
          payload: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required()
          }).label('admin')
        }
      }
    },
    {
      method: 'PUT',
      path: '/other',
      options: {
        handler: Helper.defaultHandler,
        description: 'Other',
        notes: 'Other',
        tags: ['api'],
        validate: {
          payload: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required()
          }).label('other')
        }
      }
    },
    {
      method: 'PUT',
      path: '/unknown',
      options: {
        handler: Helper.defaultHandler,
        description: 'Unknown',
        notes: 'Unknown',
        tags: ['api'],
        validate: {
          payload: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required()
          })
        }
      },
    }
  ];

  lab.test('jsonFilePath option generates and stores static JSON file', async () => {
    const server = await Helper.createServer({ jsonFilePath: STATIC_PATH }, testRoutes);

    const response1 = await server.inject({ method: 'GET', url: '/swagger.json' });

    expect(response1.statusCode).to.equal(200);

    expect(Object.keys(response1.result.definitions).length).to.equal(4);
    expect(Object.keys(response1.result.definitions).includes('admin')).to.equal(true);
    expect(Object.keys(response1.result.definitions).includes('user')).to.equal(true);
    expect(Object.keys(response1.result.definitions).includes('other')).to.equal(true);
    expect(Object.keys(response1.result.definitions).includes('Model1')).to.equal(true);

    expect(response1.headers).to.contain('last-modified');
    expect(response1.headers['last-modified']).to.be.a.string();

    // Asserts file exists
    await FS.access(STATIC_PATH);

    const response2 = await server.inject({ method: 'GET', url: '/swagger.json' });

    expect(response2.statusCode).to.equal(200);

    expect(Object.keys(response2.result.definitions).length).to.equal(4);
    expect(Object.keys(response2.result.definitions).includes('admin')).to.equal(true);
    expect(Object.keys(response2.result.definitions).includes('user')).to.equal(true);
    expect(Object.keys(response2.result.definitions).includes('other')).to.equal(true);
    expect(Object.keys(response2.result.definitions).includes('Model1')).to.equal(true);

    expect(response2.headers).to.contain('last-modified');
    expect(response2.headers['last-modified']).to.be.a.string();
    expect(response2.headers['last-modified']).to.equal(response1.headers['last-modified']);
  });

  lab.after(() => FS.unlink(STATIC_PATH));
});
