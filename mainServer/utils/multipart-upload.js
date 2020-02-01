
  const extractExt = filename => filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名

export default async function handleMultipartUploadFile(ctx) {
  const path = require('path')
  const fse = require("fs-extra");
  const multiparty = require("koa2-multiparty");

  const UPLOAD_DIR = path.resolve(__dirname, "../../", "public/upload"); // 大文件存储目录

  const extractExt = filename => filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名
  await multiparty()(ctx)

  const fields = ctx.req.body
  const files = ctx.req.files

  const { fileHash, hash, filename } = fields

  const { chunk } = files
  const filePath = path.resolve(
    UPLOAD_DIR,
    `${fileHash}${extractExt(filename)}`
  );
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash);

  // 切片文件已存在直接返回 更严谨要根据内容算hash
  if (fse.existsSync(filePath)) {
    ctx.body = {
      code: 200,
      message: 'file existed'
    }
    return;
  }

  //目录不存在 创建 windows无法使用 没权限 但在我电脑里成功了 可能是模块升级支持了 包括创建文件等 文件操作功能 windows下均可以使用
  if (!fse.existsSync(chunkDir)) {
    await fse.mkdirs(chunkDir);
  }

    // fs-extra 专用方法，类似 fs.rename 并且跨平台
      // fs-extra 的 rename 方法 windows 平台会有权限问题
      // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
  await fse.move(chunk.path, path.resolve(chunkDir, hash));

  ctx.body = 'received file chunk'
}