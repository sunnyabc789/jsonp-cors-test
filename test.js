const arr = [1, 2, 3]
function mapAwaitAll(arr, mapper) {
  return Promise.all(arr.map(mapper))
}

/**
 * 结合了 for 和 await 的工具函数
 * @param arr
 * @param mapper
 */
 async function forAwaitAll(arr, mapper) {
  let res = []
  let i = 0
  for (let v of arr) {
    let r = await mapper(v, i++, arr)
    res.push(r)
  }
  return res
}

async function mapAwaitAll(arr, mapper) {
  return Promise.all(arr.map(mapper))
}
async function test() {
  await forAwaitAll(arr, async () => {
    await delay()
    await clg()
  })
}

async function clg() {
  return new Promise((resolve, reject) => {
    console.log('here===')
    resolve()
  })
}

async function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, 10 * 1000)
  })
}
test()