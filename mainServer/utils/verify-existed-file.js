const path = require('path')
const UPLOAD_DIR = path.resolve(__dirname, "../../", "public/upload"); // 大文件存储目录
const fse = require("fs-extra");

export default async function handleVerify (ctx) {
  
  // const extractExt = filename => filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名

  const data = ctx.request.body;
  const { fileHash, filename } = data;
  // const ext = extractExt(filename);
  // const filePath = `${UPLOAD_DIR}/${fileHash}${ext}`
  const filePath = `${UPLOAD_DIR}/${filename}`
  if (fse.existsSync(filePath)) {
    return ctx.body = {
      code: 200,
      shouldUpload: false
    }
  }
  return ctx.body = {
    code: 200,
    shouldUpload: true,
    // uploadedList: await createUploadedList(fileHash)
    uploadedList: await createUploadedList(filename)
  }

}

// async function createUploadedList(fileHash ) {
//   fse.existsSync(`${UPLOAD_DIR}/${fileHash}`)
//     // ? await fse.readdir(`${UPLOAD_DIR}/${fileHash}`)
//     ? await fse.readdir(`${UPLOAD_DIR}/${fileHash}_dirname`)
//     : [];
// }

//地址的处理时刻记得要用path.resolve
const createUploadedList = async fileHash =>
  fse.existsSync(path.resolve(UPLOAD_DIR, fileHash))
    ? await fse.readdir(path.resolve(UPLOAD_DIR, fileHash))
    : [];