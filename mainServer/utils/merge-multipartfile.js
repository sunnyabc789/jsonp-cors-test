
const path = require('path')
const UPLOAD_DIR = path.resolve(__dirname, "../../", "public/upload"); // 大文件存储目录
const fse = require("fs-extra");

export default async function handleMergeMultipartFile(ctx) {
  // const data = await resolvePost(ctx);
  const { filename } = ctx.request.body;
  const filePath = `${UPLOAD_DIR}/${filename}`;
  await mergeFileChunk(filePath, filename);
  return ctx.body = {
    code: 200,
    message: 'success'
  }
}

//如果没有用body-parse 用来处理post请求的
function resolvePost (ctx) {
  const req = ctx.req
  return new Promise(resolve => {
    let chunk = "";
    req.on("data", data => {
      chunk += data;
    })
    
    req.on("end", () => {
      resolve(JSON.parse(chunk));
    })
  })
}

async function mergeFileChunk(filePath, filename) {
  const chunkDir = `${UPLOAD_DIR}/${filename}`;
  const chunkPaths = await fse.readdir(chunkDir);
  await fse.writeFile(filePath, "");
  chunkPaths.forEach(chunkPath => {
    fse.appendFileSync(filePath, fse.readFileSync(`${chunkDir}/${chunkPath}`));
    fse.unlinkSync(`${chunkDir}/${chunkPath}`);
  });
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
}