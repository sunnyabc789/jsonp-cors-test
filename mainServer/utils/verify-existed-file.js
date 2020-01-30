export default async function handleVerify (ctx) {
  const path = require('path')
  const UPLOAD_DIR = path.resolve(__dirname, "../../", "public/upload"); // 大文件存储目录

  const extractExt = filename => filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名

  const data = ctx.request.body;
  const { fileHash, filename } = data;
  const ext = extractExt(filename);
  const filePath = `${UPLOAD_DIR}/${fileHash}${ext}`
  if (fse.existsSync(filePath)) {
    return ctx.body = {
      code: 200,
      shouldUpload: false
    }
  }
  return ctx.body = {
    code: 200,
    shouldUpload: true
  }

}