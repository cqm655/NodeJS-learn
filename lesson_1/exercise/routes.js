const handleRoutes = (req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === '/' && method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<html lang="en">');
        res.write('<body>');
        res.write('<p>Hello</p>');
        res.write('<form action="/create-user" method="POST">');
        res.write('<input type="text" name="text"/>');
        res.write('<button type="submit">Submit</button>');
        res.write('</form>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
    }

    if (url === '/users' && method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        });
        res.write('<html><body>');
        res.write('<ul><li>User 1</li><li>User 2</li></ul>');
        res.write('</body></html>');
        return res.end();
    }

    if (url === '/create-user' && method === 'POST') {
        const body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            const parsedData = Buffer.concat(body).toString();

            const message = parsedData.split('=')[1] || '';

            res.writeHead(302, {Location: '/'});
            res.end();

            console.log('User introdus:', decodeURIComponent(message));
        });
        return;
    }

    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
};

module.exports = handleRoutes;
