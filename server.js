const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
    const url = req.url
    const method = req.method
    if (url === '/' && method === 'GET') {
        res.write('<html>')
        res.write('<body>')
        res.write('<form action="/message" method="POST"><input type="text" name="message"/><button type="submit">Send</button></form>')
        res.write('</body>')
        res.write('</html>')
    }
    if (method === 'POST' && url === '/message') {

        const body = []
        req.on('data', (chunk) => {
            body.push(chunk)
        })
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString() //buff and concat to add all chunks
            const message = parsedBody.split('=')[1]
            fs.writeFileSync('message.txt', message)
        })
    }
})

server.listen(3003)
