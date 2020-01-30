import Koa from 'koa'
import mount from 'koa-mount'
import serve from 'koa-static'
import _ from 'lodash'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import compress from 'koa-compress'
import forward from 'koa-forward-request'
import allowCROSMiddleware from './allow-cros-middleware'
import Bodyparser from 'koa-bodyparser'
import handleMultipartUploadFile from '../utils/multipart-upload'
import handleMergeMultipartFile from '../utils/merge-multipartfile'
import handleVerify from '../utils/verify-existed-file'

const isProduction = process.env.NODE_ENV || 'development'
const cwd = process.cwd()
const app = new Koa()
const staticOption = () => ({
  maxAge: 1000 * 60 * 60 * 24 * 365,
  hidden: true
})

const defaultRequestbodyLimit = {
  jsonLimit: '2mb',
  textLimit: '56kb',
  formLimit: '56kb'
}
const bodyparser = Bodyparser(defaultRequestbodyLimit)

export default async function appInit(extraLocal) {

  // global middlewares
  // app.keys = ['sugo:' + env + ':' + CONFIG.db.database]

  // 转发请求，解决跨域问题
  forward(app, { debug: !isProduction })


  app.use(compress({
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }))


  //get
  app.use(conditional())
  // add etags 缓存用
  app.use(etag())

  // 静态资源允许CROS响应头
  // if (CONFIG.allowStaticResourceCROS) {
    app.use(allowCROSMiddleware)
  // }

  //静态资源目录
  app.use(serve(cwd + '/public', staticOption()))
  app.use(mount('/_bc', serve(cwd + '/node_modules', staticOption())))
  app.use(mount('/static', serve(cwd + '/static', staticOption())))
  // if (staticDashboardScanPath) {
  //   app.use(mount('/static-dashboard', serve(path.resolve(__dirname, staticDashboardScanPath), staticOption())))
  // }


  // body解析，与 http-proxy-middleware 不兼容
  // bodyparser.unless = koaUnless
  // app.use(bodyparser.unless({ path: /(^\/app\/task-schedule)|(^\/app\/sdk\/sdk-upload-importfile)/ }))
  app.use(bodyparser)

  // session
  // const sessionKey = 'sugo:sess'
  // const sessionStore = new RedisStore({
  //   client: await getRedisClient(),
  //   duplicate: true
  // })

  // app.use(session({
  //   key: sessionKey,
  //   signed: false,
  //   genid: (ctx) => {
  //     const { q } = ctx.request.body || {}
  //     let sessionId = generate()
  //     if (q) {
  //       const params = tryJsonParse(decompressUrlQuery(q))
  //       sessionId = `${params.username}-${sessionId}`
  //     }
  //     return `${sessionId}`
  //   },
  //   store: sessionStore,
  //   maxAge: null
  // }, app))


  //全局错误处理 输出到body
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      // sequelize 报错时打印出sql
      if (e.sql) {
        console.error('ERROR SQL ==> ', e.sql)
      }
      console.error(e.stack)
      let { path } = ctx
      if (
        /^\/app\//.test(path) ||
        /^\/api\//.test(path) ||
        /^\/common\//.test(path)
      ) {
        ctx.status = 500
        ctx.body = {
          error: e.message || e.stack
        }
      } else {
        //500 page
        ctx.status = 500
        ctx.local.error = e
        ctx.render('500', ctx.local)
      }
    }
  })




  //通用加工，获取host等
  // app.use(commonMiddleware)

  // app.use(ua)
  // app.use(loginCheckMiddleware)
  // app.use(permissionCheckMiddleware)


  // 集成客户的(标准)单点登陆接口
  // if (CONFIG.CAS.server) {
  //   // Create a new instance of CASAuthentication.
  //   const casClient = getCasClient(sessionKey, sessionStore)
  //   // CAS中间件 => 登出
  //   app.use(casClient.logout())
  //     // CAS中间件 => CAS server调用post登出
  //     .use(casClient.ssoff())
  //     // CAS中间件以下为必须
  //     .use(casClient.serviceValidate())
  //     .use(casClient.authenticate())
  //     // 处理CAS系统用户与本系统用户权限
  //     .use(casAuthMiddleware)
  // }


  //路由处理
  // router(app)


  app.use( async (ctx ) => {
    let url = ctx.request.url
    if (url === '/chunk-upload-file') {
      handleMultipartUploadFile(ctx)
      return ctx.body = 'test-cors'
    }

    if (url === '/merge') {
      await handleMergeMultipartFile(ctx)
      return ctx.body = 'test-merge'
    }

    if (url === '/verify') {
      await handleVerify()
    }
  })
  return app
}