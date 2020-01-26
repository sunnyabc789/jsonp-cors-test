
import init from './init'

const start = async function () {
  const app = await init()
  const httpServer = app.listen(3000, () => {
    console.log('3000 here===');
  })

}



try {
  //go
  start()
} catch (e) {
  process.exit(1)
}





