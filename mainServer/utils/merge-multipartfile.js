
const path = require('path')
const UPLOAD_DIR = path.resolve(__dirname, "../../", "public/upload"); // 大文件存储目录
const fse = require("fs-extra");

const extractExt = filename => filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名

export default async function handleMergeMultipartFile(ctx) {
  // const data = await resolvePost(ctx);

  const { fileHash, filename, size } = ctx.request.body;
  
  const ext = extractExt(filename);

  //这里用了文件名来保存 其实可以考虑用hash名${ext}来保存 这样比较合理 merge请求应该去掉
  const filePath = path.resolve(UPLOAD_DIR, `${filename}`);

  await mergeFileChunk(filePath, fileHash, size);
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

async function mergeFileChunk(filePath, fileHash, size) {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash);

  const chunkPaths = await fse.readdir(chunkDir);

  //非流式
  //写个空文件
  // await fse.writeFile(filePath, "");

  // chunkPaths.forEach(chunkPath => {
  //   //往文件里填内容
  //   fse.appendFileSync(filePath, fse.readFileSync(`${chunkDir}/${chunkPath}`));
  //   fse.unlinkSync(`${chunkDir}/${chunkPath}`);
  // });


  //流式
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序可能会错乱
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        // 指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * size,
          end: (index + 1) * size
        })
      )
    )
  );

  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
}

const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });