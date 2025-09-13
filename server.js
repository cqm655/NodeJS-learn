const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
    const url = req.url
    const method = req.method
    if (url === '/' && method === 'GET') {
        fs.writeFileSync('test.tx', 'dummy')
        return res.end()
    }
})

server.listen(3003)
