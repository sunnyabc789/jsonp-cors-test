
import init from './init'

const start = async function () {
  const app = await init()
  const httpServer = app.listen(8080, () => {
    console.log('8080 here===');
  })

}



try {
  //go
  start()
} catch (e) {
  process.exit(1)
}





