import EdgeConfigFactory from '../../webpack/plugins/EdgeConfigFactory'
import { Router, cache, fromServer, fromOrigin, redirectTo } from '../../src/router'
import createCustomCacheKey from '../../src/router/createCustomCacheKey'
import Response from '../../../react-storefront-moov-xdn/src/Response'

describe('EdgeConfigFactory', () => {
  let key, cacheHandler

  beforeEach(() => {
    key = createCustomCacheKey()
      .addHeader('user-agent')
      .addHeader('host')
      .excludeQueryParameters(['uid', 'gclid'])
      .addCookie('currency')
      .addCookie('location', cookie => {
        cookie.partition('na').byPattern('us|ca')
        cookie.partition('eur').byPattern('de|fr|ee')
      })
    cacheHandler = cache({
      edge: {
        maxAgeSeconds: 300,
        key
      }
    })
  })

  describe('version', () => {
    it('should emit a version', () => {
      const router = new Router().get('/', cacheHandler).get('/p/:id', cacheHandler)
      const config = new EdgeConfigFactory(router).createConfig()
      expect(config.version).not.toBeNull()
    })
  })

  describe('custom_cache_keys', () => {
    it('should generate custom cache keys for outer edge manager', () => {
      const router = new Router().get('/', cacheHandler).get('/p/:id', cacheHandler)
      const config = new EdgeConfigFactory(router).createConfig()

      expect(config.backends.moov.custom_cache_keys).toEqual([
        {
          notes: 'rsf: /.powerlinks.js.json',
          path_regex: '^/\\.powerlinks\\.js\\.json(?=\\?|$)'
        },
        {
          notes: 'rsf: /.powerlinks.js.amp',
          path_regex: '^/\\.powerlinks\\.js\\.amp(?=\\?|$)'
        },
        {
          notes: 'rsf: /.powerlinks.js',
          path_regex: '^/\\.powerlinks\\.js(?=\\?|$)'
        },
        {
          add_cookies: {
            currency: null,
            location: [
              {
                partition: 'na',
                partitioning_regex: 'us|ca'
              },
              {
                partition: 'eur',
                partitioning_regex: 'de|fr|ee'
              }
            ]
          },
          add_headers: ['user-agent', 'host'],
          notes: 'rsf: /.json',
          path_regex: '^/\\.json(?=\\?|$)',
          query_parameters_list: ['uid', 'gclid'],
          query_parameters_mode: 'blacklist'
        },
        {
          add_cookies: {
            currency: null,
            location: [
              {
                partition: 'na',
                partitioning_regex: 'us|ca'
              },
              {
                partition: 'eur',
                partitioning_regex: 'de|fr|ee'
              }
            ]
          },
          add_headers: ['user-agent', 'host'],
          notes: 'rsf: /.amp',
          path_regex: '^/\\.amp(?=\\?|$)',
          query_parameters_list: ['uid', 'gclid'],
          query_parameters_mode: 'blacklist'
        },
        {
          add_cookies: {
            currency: null,
            location: [
              {
                partition: 'na',
                partitioning_regex: 'us|ca'
              },
              {
                partition: 'eur',
                partitioning_regex: 'de|fr|ee'
              }
            ]
          },
          add_headers: ['user-agent', 'host'],
          notes: 'rsf: /',
          path_regex: '^/(?=\\?|$)',
          query_parameters_list: ['uid', 'gclid'],
          query_parameters_mode: 'blacklist'
        },
        {
          add_cookies: {
            currency: null,
            location: [
              {
                partition: 'na',
                partitioning_regex: 'us|ca'
              },
              {
                partition: 'eur',
                partitioning_regex: 'de|fr|ee'
              }
            ]
          },
          add_headers: ['user-agent', 'host'],
          notes: 'rsf: /p/:id.json',
          path_regex: '^/p/([^/\\?]+)\\.json(?=\\?|$)',
          query_parameters_list: ['uid', 'gclid'],
          query_parameters_mode: 'blacklist'
        },
        {
          add_cookies: {
            currency: null,
            location: [
              {
                partition: 'na',
                partitioning_regex: 'us|ca'
              },
              {
                partition: 'eur',
                partitioning_regex: 'de|fr|ee'
              }
            ]
          },
          add_headers: ['user-agent', 'host'],
          notes: 'rsf: /p/:id.amp',
          path_regex: '^/p/([^/\\?]+)\\.amp(?=\\?|$)',
          query_parameters_list: ['uid', 'gclid'],
          query_parameters_mode: 'blacklist'
        },
        {
          add_cookies: {
            currency: null,
            location: [
              {
                partition: 'na',
                partitioning_regex: 'us|ca'
              },
              {
                partition: 'eur',
                partitioning_regex: 'de|fr|ee'
              }
            ]
          },
          add_headers: ['user-agent', 'host'],
          notes: 'rsf: /p/:id',
          path_regex: '^/p/([^/\\?]+)(?=\\?|$)',
          query_parameters_list: ['uid', 'gclid'],
          query_parameters_mode: 'blacklist'
        },
        {
          notes: 'rsf: __fallback__',
          path_regex: '.'
        }
      ])
    })
  })

  describe('fromOrigin', () => {
    it('should proxy to given origin', () => {
      const router = new Router().get('/foo', fromOrigin('desktop'))
      const routes = new EdgeConfigFactory(router).createConfig().backends['moov'].request_router

      expect(routes).toEqual([
        {
          notes: 'rsf: /.powerlinks.js.json',
          path_regex: '^/\\.powerlinks\\.js\\.json(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: 'rsf: /.powerlinks.js.amp',
          path_regex: '^/\\.powerlinks\\.js\\.amp(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: 'rsf: /.powerlinks.js',
          path_regex: '^/\\.powerlinks\\.js(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: 'rsf: /foo.json',
          path_regex: '^/foo\\.json(?=\\?|$)',
          proxy: { alternative_backend: 'desktop' }
        },
        {
          notes: 'rsf: /foo.amp',
          path_regex: '^/foo\\.amp(?=\\?|$)',
          proxy: { alternative_backend: 'desktop' }
        },
        {
          notes: 'rsf: /foo',
          path_regex: '^/foo(?=\\?|$)',
          proxy: { alternative_backend: 'desktop' }
        },
        { notes: 'rsf: __fallback__', path_regex: '.', proxy: { alternative_backend: 'moov' } }
      ])
    })

    it('should handle fallback(fromOrigin)', () => {
      const router = new Router().get('/foo', fromServer('./foo')).fallback(fromOrigin())
      expect(new EdgeConfigFactory(router).createConfig().backends['moov'].request_router).toEqual([
        {
          notes: expect.any(String),
          path_regex: '^/\\.powerlinks\\.js\\.json(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: expect.any(String),
          path_regex: '^/\\.powerlinks\\.js\\.amp(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: expect.any(String),
          path_regex: '^/\\.powerlinks\\.js(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: expect.any(String),
          path_regex: '^/foo\\.json(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: expect.any(String),
          path_regex: '^/foo\\.amp(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: expect.any(String),
          path_regex: '^/foo(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: expect.any(String),
          path_regex: '.',
          proxy: { alternative_backend: 'origin' }
        }
      ])
    })

    it('should add caching to backends.response_router', () => {
      const router = new Router().get(
        '/foo',
        cache({ edge: { maxAgeSeconds: 500 } }),
        fromOrigin('desktop')
      )
      const { request_router, response_router } = new EdgeConfigFactory(
        router
      ).createConfig().backends.moov

      expect(request_router.find(r => r.notes === 'rsf: /foo')).toEqual({
        notes: 'rsf: /foo',
        path_regex: '^/foo(?=\\?|$)',
        proxy: {
          alternative_backend: 'desktop'
        }
      })

      expect(response_router).toEqual([
        {
          notes: 'rsf: /.powerlinks.js.json',
          path_regex: '^/\\.powerlinks\\.js\\.json(?=\\?|$)'
        },
        {
          notes: 'rsf: /.powerlinks.js.amp',
          path_regex: '^/\\.powerlinks\\.js\\.amp(?=\\?|$)'
        },
        { notes: 'rsf: /.powerlinks.js', path_regex: '^/\\.powerlinks\\.js(?=\\?|$)' },
        { notes: 'rsf: /foo.json', path_regex: '^/foo\\.json(?=\\?|$)', ttl: '500s' },
        { notes: 'rsf: /foo.amp', path_regex: '^/foo\\.amp(?=\\?|$)', ttl: '500s' },
        { notes: 'rsf: /foo', path_regex: '^/foo(?=\\?|$)', ttl: '500s' },
        { notes: 'rsf: __fallback__', path_regex: '.' }
      ])
    })

    it('should support caching for falling back to origin', () => {
      const router = new Router()
        .get('/foo', fromServer('./foo'))
        .fallback(cache({ edge: { maxAgeSeconds: 500 } }), fromOrigin('desktop'))

      const { response_router } = new EdgeConfigFactory(router).createConfig().backends.moov

      expect(response_router).toEqual([
        {
          notes: 'rsf: /.powerlinks.js.json',
          path_regex: '^/\\.powerlinks\\.js\\.json(?=\\?|$)'
        },
        {
          notes: 'rsf: /.powerlinks.js.amp',
          path_regex: '^/\\.powerlinks\\.js\\.amp(?=\\?|$)'
        },
        { notes: 'rsf: /.powerlinks.js', path_regex: '^/\\.powerlinks\\.js(?=\\?|$)' },
        { notes: 'rsf: /foo.json', path_regex: '^/foo\\.json(?=\\?|$)' },
        { notes: 'rsf: /foo.amp', path_regex: '^/foo\\.amp(?=\\?|$)' },
        { notes: 'rsf: /foo', path_regex: '^/foo(?=\\?|$)' },
        { notes: 'rsf: __fallback__', path_regex: '.', ttl: '500s' }
      ])
    })

    it('should proxy to given origin with transformed path', () => {
      const router = new Router().get(
        '/foo/:cat/:id',
        fromOrigin('desktop').transformPath('/bar/{cat}/{id}')
      )
      expect(new EdgeConfigFactory(router).createConfig().backends.moov.request_router).toEqual([
        {
          notes: 'rsf: /.powerlinks.js.json',
          path_regex: '^/\\.powerlinks\\.js\\.json(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: 'rsf: /.powerlinks.js.amp',
          path_regex: '^/\\.powerlinks\\.js\\.amp(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: 'rsf: /.powerlinks.js',
          path_regex: '^/\\.powerlinks\\.js(?=\\?|$)',
          proxy: { alternative_backend: 'moov' }
        },
        {
          notes: 'rsf: /foo/:cat/:id.json',
          path_regex: '^/foo/([^/\\?]+)/([^/\\?]+)\\.json(?=\\?|$)',
          proxy: { alternative_backend: 'desktop', rewrite_path_regex: '/bar/\\1/\\2' }
        },
        {
          notes: 'rsf: /foo/:cat/:id.amp',
          path_regex: '^/foo/([^/\\?]+)/([^/\\?]+)\\.amp(?=\\?|$)',
          proxy: { alternative_backend: 'desktop', rewrite_path_regex: '/bar/\\1/\\2' }
        },
        {
          notes: 'rsf: /foo/:cat/:id',
          path_regex: '^/foo/([^/\\?]+)/([^/\\?]+)(?=\\?|$)',
          proxy: { alternative_backend: 'desktop', rewrite_path_regex: '/bar/\\1/\\2' }
        },
        { notes: 'rsf: __fallback__', path_regex: '.', proxy: { alternative_backend: 'moov' } }
      ])
    })

    it('should support a transformed path with multiple uses of variable', () => {
      const router = new Router().get(
        '/foo/:x/:y',
        fromOrigin('desktop').transformPath('/bar/{x}/{y}/{x}')
      )
      const config = new EdgeConfigFactory(router)
        .createConfig()
        .backends.moov.request_router.find(r => r.notes === 'rsf: /foo/:x/:y')

      expect(config).toEqual({
        notes: 'rsf: /foo/:x/:y',
        path_regex: '^/foo/([^/\\?]+)/([^/\\?]+)(?=\\?|$)',
        proxy: {
          alternative_backend: 'desktop',
          rewrite_path_regex: '/bar/\\1/\\2/\\1'
        }
      })

      // Test regex replacement
      expect(
        '/foo/a/b'.replace(
          new RegExp(config.path_regex),
          config.proxy.rewrite_path_regex.replace(/\\/g, '$')
        )
      ).toEqual('/bar/a/b/a')
    })

    it('should handle variable at beginning of path', () => {
      const router = new Router().get('/foo/:x', fromOrigin('desktop').transformPath('{x}/bar'))

      const config = new EdgeConfigFactory(router)
        .createConfig()
        .backends.moov.request_router.find(r => r.notes === 'rsf: /foo/:x')

      expect(config).toEqual({
        notes: 'rsf: /foo/:x',
        path_regex: '^/foo/([^/\\?]+)(?=\\?|$)',
        proxy: {
          alternative_backend: 'desktop',
          rewrite_path_regex: '\\1/bar'
        }
      })
    })

    it('should handle variable within a path param', () => {
      const router = new Router().get('/foo/:x', fromOrigin('desktop').transformPath('/bar{x}'))

      const config = new EdgeConfigFactory(router)
        .createConfig()
        .backends.moov.request_router.find(r => r.notes === 'rsf: /foo/:x')

      expect(config).toEqual({
        notes: 'rsf: /foo/:x',
        path_regex: '^/foo/([^/\\?]+)(?=\\?|$)',
        proxy: {
          alternative_backend: 'desktop',
          rewrite_path_regex: '/bar\\1'
        }
      })
    })

    it('should not support fromOrigin when not at edge', async () => {
      const router = new Router().get('/foo/:x', fromOrigin('desktop'))
      const request = { method: 'get', path: '/foo/1' }
      const response = new Response()
      await router.runAll(request, response)
      expect(response.statusCode).toEqual(500)
    })
  })

  describe('redirectTo', () => {
    it('should redirect with status', () => {
      const router = new Router().get('/foo', redirectTo('/bar').withStatus(302))
      const config = new EdgeConfigFactory(router).createConfig()
      const route = config.backends.moov.request_router.find(r => r.notes === 'rsf: /foo')

      expect(route).toEqual({
        notes: 'rsf: /foo',
        path_regex: '^/foo(?=\\?|$)',
        redirect: {
          status: 302,
          rewrite_path_regex: '/bar'
        }
      })
    })

    it('should redirect with status and path transformation', () => {
      const router = new Router().get('/foo/*path', redirectTo('/bar/{path}').withStatus(200))
      const config = new EdgeConfigFactory(router).createConfig()
      const route = config.backends.moov.request_router.find(r => r.notes === 'rsf: /foo/*path')

      expect(route).toEqual({
        notes: 'rsf: /foo/*path',
        path_regex: '^/foo/([^?]*?)(?=\\?|$)',
        redirect: {
          status: 200,
          rewrite_path_regex: '/bar/\\1'
        }
      })
    })

    it('should leave escaped paths alone', () => {
      const router = new Router().get(
        '/foo/:x',
        fromOrigin('desktop').transformPath('/bar/\\{x}/{x}')
      )
      const config = new EdgeConfigFactory(router).createConfig()
      const route = config.backends.moov.request_router.find(r => r.notes === 'rsf: /foo/:x')

      expect(route).toEqual({
        notes: 'rsf: /foo/:x',
        path_regex: '^/foo/([^/\\?]+)(?=\\?|$)',
        proxy: {
          alternative_backend: 'desktop',
          rewrite_path_regex: '/bar/\\{x}/\\1'
        }
      })

      // Test regex replacement
      expect(
        '/foo/a'.replace(
          new RegExp(route.path_regex),
          route.proxy.rewrite_path_regex.replace(/\\\d/g, '$$1')
        )
      ).toEqual('/bar/\\{x}/a')
    })

    it('should redirect with transformed path when not at edge and using redirectTo', async () => {
      const router = new Router().get('/foo/:x/:y', redirectTo('/bar/{x}/x-{y}/{x}'))
      const request = { method: 'get', path: '/foo/1/2' }
      const response = new Response()
      await router.runAll(request, response)
      expect(response.redirectTo).toEqual('/bar/1/x-2/1')
    })
  })
})
