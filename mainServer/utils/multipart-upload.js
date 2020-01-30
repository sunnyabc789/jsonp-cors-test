
export default async function handleMultipartUploadFile(ctx) {
  const path = require('path')
  const fse = require("fs-extra");
  const multiparty = require("koa2-multiparty");

  const UPLOAD_DIR = path.resolve(__dirname, "../../", "public/upload"); // 大文件存储目录

  await multiparty()(ctx)

  const fields = ctx.req.body
  const files = ctx.req.files
  const { hash, filename } = fields
  const { chunk } = files
  const chunkDir = `${UPLOAD_DIR}/${filename}`;

  //目录不存在 创建 windows无法使用 没权限 但在我电脑里成功了 可能是模块升级支持了
  if (!fse.existsSync(chunkDir)) {
    await fse.mkdirs(chunkDir);
  }

  await fse.move(chunk.path, `${chunkDir}/${hash}`);
  // const multiparty = require("multiparty");
  // const multipart = new multiparty.Form();
  // multipart.parse(ctx.req, async (err, fields, files) => {
  //   if (err) return ctx.body = 'error'
  //   const [chunk] = files.chunk;
  //   const [hash] = fields.hash;
  //   const [filename] = fields.filename;
  //   const chunkDir = `${UPLOAD_DIR}/${filename}`;

  // })

  ctx.body = 'received file chunk'
}