const fs = require('fs')

const requestHandler = (req, res) => {
    const url = req.url
    const method = req.method
    if (url === '/' && method === 'GET') {
        res.write('<html>')
        res.write('<body>')
        res.write('<form action="/message" method="POST"><input type="text" name="message"/><button type="submit">Send</button></form>')
        res.write('</body>')
        res.write('</html>')
        return res.end()
    }
    if (method === 'POST' && url === '/message') {

        const body = []
        req.on('data', (chunk) => {
            body.push(chunk)
        })
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString() //buff and concat to add all chunks
            const message = parsedBody.split('=')[1]
            fs.writeFile('message.txt', message, (err) => {

                res.statusCode = 302
                res.setHeader('Location', '/')
                res.end()
            })
        })
        return res.end()
    }
}

// module.exports = requestHandler

// module.exports.handler = requestHandler

module.exports = {
    handler: requestHandler,
    someText: 'Hello World!'
}
